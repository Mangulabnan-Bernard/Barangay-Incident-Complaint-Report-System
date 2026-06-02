import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sanity check that the Next.js app can reach the existing `barangay` database
// through Prisma. Visit /api/health.
export async function GET() {
  try {
    const [admins, residents, incidents] = await Promise.all([
      prisma.admin.count(),
      prisma.residents.count(),
      prisma.incidents.count(),
    ]);
    return NextResponse.json({ ok: true, db: "barangay", admins, residents, incidents });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
