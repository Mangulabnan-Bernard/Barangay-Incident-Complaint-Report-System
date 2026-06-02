import { NextResponse } from "next/server";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { incidentCreateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

async function generateCaseNo(): Promise<number> {
  for (let i = 0; i < 25; i++) {
    const n = Math.floor(10000 + Math.random() * 90000);
    const existing = await prisma.incidents.findFirst({
      where: { caseNo: n },
      select: { id: true },
    });
    if (!existing) return n;
  }
  throw new Error("Unable to generate a unique case number");
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = incidentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const caseNo = await generateCaseNo();
  const pb = await prisma.officials.findFirst({
    where: { Position: { contains: "Punong" } },
  });
  const punong = pb ? `${pb.FirstName} ${pb.LastName}`.trim() : "Punong Barangay";
  const cage = d.cage && /^\d+$/.test(d.cage) ? parseInt(d.cage, 10) : null;

  const incident = await prisma.incidents.create({
    data: {
      complaint: d.complaint,
      age: d.age,
      current_address: d.current_address,
      contact: d.contact,
      complainee: d.complainee,
      cage,
      caddress: d.caddress,
      ccontact: d.ccontact || null,
      incident: d.incident,
      incident_details: d.incident_details,
      datetime_incident: d.datetime_incident ? new Date(d.datetime_incident) : null,
      status: "Pending",
      action: "none",
      punong_barangay: punong,
      caseNo,
      user: session.kind === "resident" ? session.username : "admin",
    },
  });

  await logActivity(
    `${session.name} filed complaint #${caseNo} (${d.incident}): ${d.complaint} vs ${d.complainee}`,
  );
  return NextResponse.json({ ok: true, id: incident.id, caseNo });
}
