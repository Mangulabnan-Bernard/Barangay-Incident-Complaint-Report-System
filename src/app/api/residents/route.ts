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
  if (session.role === "RESIDENT") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const gender = String(body?.gender ?? "").trim();
  const address = String(body?.address ?? "").trim();
  const user = String(body?.user ?? "").trim();
  const password = String(body?.password ?? "");

  if (!name || !address || !user || !password) {
    return NextResponse.json(
      { ok: false, error: "Name, address, username and password are required" },
      { status: 400 },
    );
  }

  const existing = await prisma.residents.findFirst({ where: { user } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "That username is already taken." },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  const resident = await prisma.residents.create({
    data: {
      name,
      gender,
      address,
      user,
      password: hashed,
      role: "resident",
    },
  });

  await logActivity(`${session.name} added resident "${name}" (${user})`);
  return NextResponse.json({ ok: true, id: resident.id });
}
