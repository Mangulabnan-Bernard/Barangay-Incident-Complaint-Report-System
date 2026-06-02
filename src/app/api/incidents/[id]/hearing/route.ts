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
  if (session.role === "RESIDENT") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";
  const action = typeof body.action === "string" ? body.action : "none";
  const status = typeof body.status === "string" ? body.status : "Pending";

  const existing = await prisma.incidents.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.incidents.update({
    where: { id },
    data: {
      expected_arrival: date ? new Date(date) : null,
      time_hearing: time ? new Date(`1970-01-01T${time}:00`) : null,
      action,
      status,
    },
  });

  if (status === "Solved") {
    await logActivity(`${session.name} marked case #${updated.caseNo} as Solved`);
  } else {
    await logActivity(
      `${session.name} scheduled a hearing for case #${updated.caseNo} on ${date} ${time} (${action})`,
    );
  }

  return NextResponse.json({ ok: true });
}
