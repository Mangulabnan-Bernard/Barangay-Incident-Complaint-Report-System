import { NextResponse } from "next/server";
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
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const {
    status,
    description,
    incident_involve,
    failReason,
    punong_barangay,
  } = body as {
    status?: string;
    description?: string;
    incident_involve?: string;
    failReason?: string;
    punong_barangay?: string;
  };

  if (!status) {
    return NextResponse.json(
      { ok: false, error: "Status is required" },
      { status: 400 },
    );
  }
  if (!description || !description.trim()) {
    return NextResponse.json(
      { ok: false, error: "A decision / resolution is required." },
      { status: 400 },
    );
  }
  if (status === "Unsolved" && (!failReason || !failReason.trim())) {
    return NextResponse.json(
      { ok: false, error: "Please provide a reason for an unsolved case." },
      { status: 400 },
    );
  }

  const existing = await prisma.incidents.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
    );
  }

  const updated = await prisma.incidents.update({
    where: { id },
    data: {
      status,
      description: description || null,
      incident_involve: incident_involve || null,
      failReason: failReason || null,
      ...(punong_barangay ? { punong_barangay } : {}),
    },
  });

  await logActivity(
    `${session.name} recorded decision for case #${updated.caseNo} (${status})`,
  );
  return NextResponse.json({ ok: true });
}
