import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const leader = await prisma.zone_leaders.findUnique({ where: { id } });
  if (!leader) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const zone = typeof body?.zone === "string" ? body.zone.trim() : "";
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!zone) {
    return NextResponse.json({ ok: false, error: "Zone is required" }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ ok: false, error: "Username is required" }, { status: 400 });
  }

  if (username !== leader.username) {
    const taken = await prisma.zone_leaders.findUnique({ where: { username } });
    if (taken) {
      return NextResponse.json(
        { ok: false, error: "That username is already taken" },
        { status: 400 },
      );
    }
  }

  await prisma.zone_leaders.update({
    where: { id },
    data: {
      zone,
      username,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
  });

  await logActivity(
    `${session.name} updated zone leader "${username}" (${zone})`,
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const leader = await prisma.zone_leaders.findUnique({ where: { id } });
  if (!leader) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await prisma.zone_leaders.delete({ where: { id } });
  await logActivity(
    `${session.name} deleted zone leader "${leader.username}" (${leader.zone})`,
  );
  return NextResponse.json({ ok: true });
}
