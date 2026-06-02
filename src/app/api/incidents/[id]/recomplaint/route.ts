import { NextResponse } from "next/server";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

// Reopen a resolved/unsolved complaint back to Pending.
export async function POST(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const incident = await prisma.incidents.findUnique({ where: { id } });
  if (!incident) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  // Residents may only reopen their own complaints.
  if (session.role === "RESIDENT" && incident.user !== session.username) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.incidents.update({
    where: { id },
    data: { status: "Pending", action: "none" },
  });
  await logActivity(
    `${session.name} re-filed (reopened) complaint #${incident.caseNo}`,
  );
  return NextResponse.json({ ok: true });
}
