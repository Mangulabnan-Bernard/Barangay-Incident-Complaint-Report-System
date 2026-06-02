import { SignJWT, jwtVerify } from "jose";

// Edge-safe session helpers: this module only depends on `jose`, so it can be
// imported from middleware. No Prisma / bcrypt / next-headers here.

export type Role = "ADMIN" | "STAFF" | "RESIDENT";

export const SESSION_COOKIE = "barangay_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

export interface SessionPayload {
  sub: string; // user id
  kind: "admin" | "resident";
  role: Role;
  name: string;
  username: string; // email for admins, username for residents
  [key: string]: unknown;
}

function getSecret(): Uint8Array {
  // Falls back to a fixed dev secret so a zero-config demo deploy still works.
  // Set a real AUTH_SECRET in production.
  const secret =
    process.env.AUTH_SECRET ||
    "barangay-v2-insecure-default-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
