import { NextResponse } from "next/server";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// Required string fields and their human-readable labels (for error messages).
const REQUIRED_STRINGS: Record<string, string> = {
  respondent_name: "Respondent name",
  month_of_summons: "Month of summons",
  prepared_by: "Prepared by",
  barangay_secretary: "Barangay secretary",
  serving_month: "Serving month",
  respondents: "Respondent(s)",
};

// Required numeric fields and their labels.
const REQUIRED_NUMBERS: Record<string, string> = {
  day_of_summons: "Day of summons",
  year_of_summons: "Year of summons",
  serving_day: "Serving day",
  serving_year: "Serving year",
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optStr(value: unknown): string | null {
  const s = str(value);
  return s.length > 0 ? s : null;
}

function optDate(value: unknown): Date | null {
  const s = str(value);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
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

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 },
    );
  }
  const b = body as Record<string, unknown>;

  // Validate required string fields.
  const strings: Record<string, string> = {};
  for (const [key, label] of Object.entries(REQUIRED_STRINGS)) {
    const value = str(b[key]);
    if (!value) {
      return NextResponse.json(
        { ok: false, error: `${label} is required` },
        { status: 400 },
      );
    }
    strings[key] = value;
  }

  // Validate required numeric fields.
  const numbers: Record<string, number> = {};
  for (const [key, label] of Object.entries(REQUIRED_NUMBERS)) {
    const raw = str(b[key]);
    const n = parseInt(raw, 10);
    if (!raw || Number.isNaN(n)) {
      return NextResponse.json(
        { ok: false, error: `${label} must be a valid number` },
        { status: 400 },
      );
    }
    numbers[key] = n;
  }

  // Required issue date.
  const date = optDate(b.date);
  if (!date) {
    return NextResponse.json(
      { ok: false, error: "Issue date is required" },
      { status: 400 },
    );
  }

  const summons = await prisma.summons.create({
    data: {
      respondent_name: strings.respondent_name,
      date,
      day_of_summons: numbers.day_of_summons,
      month_of_summons: strings.month_of_summons,
      year_of_summons: numbers.year_of_summons,
      prepared_by: strings.prepared_by,
      barangay_secretary: strings.barangay_secretary,
      serving_day: numbers.serving_day,
      serving_month: strings.serving_month,
      serving_year: numbers.serving_year,
      respondents: strings.respondents,
      respondent1: optStr(b.respondent1),
      respondent2: optStr(b.respondent2),
      respondent3: optStr(b.respondent3),
      respondent4: optStr(b.respondent4),
      dwelling_person_name: optStr(b.dwelling_person_name),
      office_person_name: optStr(b.office_person_name),
      complainee1: optStr(b.complainee1),
      date1: optDate(b.date1),
      complainee2: optStr(b.complainee2),
      date2: optDate(b.date2),
    },
  });

  await logActivity(
    `${session.name} issued a summons for ${strings.respondent_name}`,
  );

  return NextResponse.json({ ok: true, id: summons.id });
}
