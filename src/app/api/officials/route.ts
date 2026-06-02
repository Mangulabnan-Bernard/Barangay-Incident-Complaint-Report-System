import { NextResponse } from "next/server";
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
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const Position = String(body.Position ?? "").trim();
  const LastName = String(body.LastName ?? "").trim();
  const FirstName = String(body.FirstName ?? "").trim();
  const MiddleName = String(body.MiddleName ?? "");
  const Contact = String(body.Contact ?? "").trim();
  const Address = String(body.Address ?? "").trim();
  const startTerm = String(body.startTerm ?? "").trim();
  const endTerm = String(body.endTerm ?? "").trim();
  const status = String(body.status ?? "").trim();

  if (
    !Position ||
    !LastName ||
    !FirstName ||
    !Contact ||
    !Address ||
    !startTerm ||
    !endTerm ||
    !status
  ) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  const official = await prisma.officials.create({
    data: {
      Position,
      LastName,
      FirstName,
      MiddleName,
      Contact,
      Address,
      StartTerm: new Date(startTerm),
      EndTerm: new Date(endTerm),
      status,
    },
  });

  await logActivity(
    `${session.name} added official ${FirstName} ${LastName} (${Position})`,
  );
  return NextResponse.json({ ok: true, id: official.OfficialID });
}
