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
  if (session.role === "RESIDENT") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const resident = await prisma.residents.findUnique({ where: { id } });
  if (!resident) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const gender = String(body?.gender ?? "").trim();
  const address = String(body?.address ?? "").trim();
  const user = String(body?.user ?? "").trim();
  const password = String(body?.password ?? "");

  if (!name || !address || !user) {
    return NextResponse.json(
      { ok: false, error: "Name, address and username are required" },
      { status: 400 },
    );
  }

  const taken = await prisma.residents.findFirst({
    where: { user, NOT: { id } },
    select: { id: true },
  });
  if (taken) {
    return NextResponse.json(
      { ok: false, error: "That username is already taken." },
      { status: 400 },
    );
  }

  await prisma.residents.update({
    where: { id },
    data: {
      name,
      gender,
      address,
      user,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
  });

  await logActivity(`${session.name} updated resident "${name}" (${user})`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const resident = await prisma.residents.findUnique({ where: { id } });
  if (!resident) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await prisma.residents.delete({ where: { id } });
  await logActivity(
    `${session.name} deleted resident "${resident.name}" (${resident.user})`,
  );
  return NextResponse.json({ ok: true });
}
