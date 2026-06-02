import { NextResponse } from "next/server";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { incidentUpdateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.role === "RESIDENT") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = incidentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // A resolved case must record a decision; an unsolved one must say why.
  if (d.status !== "Pending" && (!d.description || !d.description.trim())) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A decision / resolution is required when marking a case Solved or Unsolved.",
      },
      { status: 400 },
    );
  }
  if (d.status === "Unsolved" && (!d.failReason || !d.failReason.trim())) {
    return NextResponse.json(
      { ok: false, error: "Please provide a reason for an unsolved case." },
      { status: 400 },
    );
  }

  const cage = d.cage && /^\d+$/.test(d.cage) ? parseInt(d.cage, 10) : null;

  const updated = await prisma.incidents.update({
    where: { id },
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
      status: d.status,
      action: d.action || "none",
      description: d.description || null,
      incident_involve: d.incident_involve || null,
      failReason: d.failReason || null,
      ...(d.punong_barangay ? { punong_barangay: d.punong_barangay } : {}),
    },
  });

  await logActivity(
    `${session.name} updated complaint #${updated.caseNo} — status: ${d.status}, action: ${d.action || "none"}`,
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

  const incident = await prisma.incidents.findUnique({ where: { id } });
  if (!incident) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await prisma.incidents.delete({ where: { id } });
  await logActivity(
    `${session.name} deleted complaint #${incident.caseNo} (${incident.incident})`,
  );
  return NextResponse.json({ ok: true });
}
