import { NextResponse } from "next/server";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const username = new URL(req.url).searchParams.get("username")?.trim() ?? "";
  if (!username) {
    return NextResponse.json({ ok: true, available: false });
  }

  const existing = await prisma.zone_leaders.findUnique({
    where: { username },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, available: !existing });
}
