import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
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
  if (!password) {
    return NextResponse.json({ ok: false, error: "Password is required" }, { status: 400 });
  }

  const existing = await prisma.zone_leaders.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "That username is already taken" },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  const leader = await prisma.zone_leaders.create({
    data: { zone, username, password: hashed },
  });

  await logActivity(
    `${session.name} added zone leader "${username}" for ${zone}`,
  );
  return NextResponse.json({ ok: true, id: leader.id });
}
