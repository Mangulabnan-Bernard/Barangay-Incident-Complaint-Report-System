import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role, SessionPayload } from "./session";

// Node-only auth logic (Prisma + bcrypt). Used by API route handlers.

export type AuthResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; reason: "no_user" | "bad_password" };

/**
 * Verify credentials against the `admin` table (by email) then the `residents`
 * table (by username).
 *
 * Note (v2 fresh-start): passwords are bcrypt. Legacy plain-text passwords will
 * simply fail bcrypt.compare, so old accounts cannot log in until re-created.
 */
export async function authenticate(
  identifier: string,
  password: string,
): Promise<AuthResult> {
  const admin = await prisma.admin.findFirst({
    where: { admin_email: identifier },
  });
  if (admin) {
    const ok = await safeCompare(password, admin.admin_password);
    if (!ok) return { ok: false, reason: "bad_password" };
    const role: Role = admin.role?.toLowerCase() === "user" ? "STAFF" : "ADMIN";
    return {
      ok: true,
      session: {
        sub: String(admin.admin_id),
        kind: "admin",
        role,
        name: admin.admin_name,
        username: admin.admin_email,
      },
    };
  }

  const resident = await prisma.residents.findFirst({
    where: { user: identifier },
  });
  if (resident) {
    const ok = await safeCompare(password, resident.password);
    if (!ok) return { ok: false, reason: "bad_password" };
    return {
      ok: true,
      session: {
        sub: String(resident.id),
        kind: "resident",
        role: "RESIDENT",
        name: resident.name,
        username: resident.user,
      },
    };
  }

  return { ok: false, reason: "no_user" };
}

export interface RegisterInput {
  name: string;
  gender: string;
  address: string;
  user: string;
  password: string;
}

export async function registerResident(
  input: RegisterInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await prisma.residents.findFirst({
    where: { user: input.user },
  });
  if (existing) {
    return { ok: false, error: "That username is already taken." };
  }
  const hashed = await bcrypt.hash(input.password, 10);
  await prisma.residents.create({
    data: {
      name: input.name,
      gender: input.gender,
      address: input.address,
      user: input.user,
      password: hashed,
      role: "resident",
    },
  });
  return { ok: true };
}

// bcrypt.compare throws if the stored hash isn't a valid bcrypt string (e.g. a
// legacy plain-text password). Treat that as a failed match.
async function safeCompare(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
