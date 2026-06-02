import { NextResponse } from "next/server";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
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

  const incident = await prisma.incidents.findUnique({ where: { id } });
  if (!incident) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // Snapshot the incident. Dates serialize fine; coerce any BigInt to string
  // so JSON.stringify never throws on the record.
  const snapshot = JSON.stringify(incident, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );

  await prisma.archived_records.create({
    data: {
      record_type: "incident",
      archived_data: snapshot,
      archived_at: new Date(),
    },
  });

  await prisma.incidents.update({
    where: { id },
    data: { archived: true, action: "archive" },
  });

  await logActivity(`${session.name} archived case #${incident.caseNo}`);
  return NextResponse.json({ ok: true });
}
