import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const admin_name = String(body?.admin_name ?? "").trim();
  const admin_email = String(body?.admin_email ?? "").trim();
  const password = String(body?.password ?? "");
  const role = body?.role === "STAFF" ? "STAFF" : "ADMIN";

  if (!admin_name) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400 },
    );
  }
  if (!admin_email) {
    return NextResponse.json(
      { ok: false, error: "Email is required" },
      { status: 400 },
    );
  }
  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Password is required" },
      { status: 400 },
    );
  }

  const existing = await prisma.admin.findFirst({ where: { admin_email } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "That email is already in use" },
      { status: 400 },
    );
  }

  const admin_password = await bcrypt.hash(password, 10);
  const created = await prisma.admin.create({
    data: { admin_name, admin_email, admin_password, role },
  });

  await logActivity(
    `${session.name} created user ${admin_name} (${admin_email}) as ${role}`,
  );
  return NextResponse.json({ ok: true, id: created.admin_id });
}
