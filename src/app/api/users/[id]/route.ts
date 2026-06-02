import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
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

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  const existing = await prisma.admin.findFirst({ where: { admin_id: id } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
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

  const emailOwner = await prisma.admin.findFirst({ where: { admin_email } });
  if (emailOwner && emailOwner.admin_id !== id) {
    return NextResponse.json(
      { ok: false, error: "That email is already in use" },
      { status: 400 },
    );
  }

  const data: {
    admin_name: string;
    admin_email: string;
    role: string;
    admin_password?: string;
  } = { admin_name, admin_email, role };
  if (password) {
    data.admin_password = await bcrypt.hash(password, 10);
  }

  await prisma.admin.update({ where: { admin_id: id }, data });

  await logActivity(
    `${session.name} updated user ${admin_name} (${admin_email}) — role: ${role}`,
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
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

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  if (Number(session.sub) === id) {
    return NextResponse.json(
      { ok: false, error: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body?.password ?? "");

  const currentAdmin = await prisma.admin.findFirst({
    where: { admin_id: Number(session.sub) },
  });
  if (!currentAdmin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let valid = false;
  try {
    valid = await bcrypt.compare(password, currentAdmin.admin_password);
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Password incorrect" },
      { status: 403 },
    );
  }

  const target = await prisma.admin.findFirst({ where: { admin_id: id } });
  if (!target) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
    );
  }

  await prisma.admin.delete({ where: { admin_id: id } });
  await logActivity(
    `${session.name} deleted user ${target.admin_name} (${target.admin_email})`,
  );
  return NextResponse.json({ ok: true });
}
