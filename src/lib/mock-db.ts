import bcrypt from "bcryptjs";

/**
 * In-memory mock "database" used when no real DATABASE_URL is configured
 * (e.g. a Vercel demo deploy). It implements the small subset of the Prisma
 * client API the app actually uses, backed by seeded sample data.
 *
 * Writes persist only for the life of the server process (and reset on each
 * serverless cold start) — fine for a demo, not for real data.
 */

type Row = Record<string, unknown>;

const date = (s: string) => new Date(s);

// ---------------------------------------------------------------- seed data
const admins: Row[] = [
  { admin_id: 150, admin_name: "Administrator", admin_email: "admin@barangay.gov.ph", admin_password: bcrypt.hashSync("admin123", 10), role: "ADMIN" },
  { admin_id: 151, admin_name: "Staff Member", admin_email: "staff@barangay.gov.ph", admin_password: bcrypt.hashSync("staff123", 10), role: "STAFF" },
];

const residents: Row[] = [
  { id: 52, name: "Juan Dela Cruz", gender: "Male", address: "Zone 1, Barangay San Juan", user: "resident", password: bcrypt.hashSync("resident123", 10), role: "resident" },
  { id: 53, name: "Maria Santos", gender: "Female", address: "Zone 2, Barangay San Juan", user: "maria", password: bcrypt.hashSync("resident123", 10), role: "resident" },
  { id: 54, name: "Pedro Reyes", gender: "Male", address: "Zone 3, Barangay San Juan", user: "pedro", password: bcrypt.hashSync("resident123", 10), role: "resident" },
];

const officials: Row[] = [
  { OfficialID: 1, Position: "Punong Barangay", LastName: "Yumul", FirstName: "Jose", MiddleName: "R", Contact: "09171234567", Address: "Zone 1", StartTerm: date("2023-01-01"), EndTerm: date("2026-12-31"), status: "Active" },
  { OfficialID: 2, Position: "Barangay Kagawad", LastName: "Cruz", FirstName: "Ana", MiddleName: "L", Contact: "09171234568", Address: "Zone 2", StartTerm: date("2023-01-01"), EndTerm: date("2026-12-31"), status: "Active" },
  { OfficialID: 3, Position: "Barangay Kagawad", LastName: "Santos", FirstName: "Ramon", MiddleName: "P", Contact: "09171234569", Address: "Zone 3", StartTerm: date("2023-01-01"), EndTerm: date("2026-12-31"), status: "Active" },
  { OfficialID: 4, Position: "Barangay Secretary", LastName: "Lopez", FirstName: "Elena", MiddleName: "M", Contact: "09171234570", Address: "Zone 1", StartTerm: date("2023-01-01"), EndTerm: date("2026-12-31"), status: "Active" },
  { OfficialID: 5, Position: "SK Chairman", LastName: "Garcia", FirstName: "Mark", MiddleName: "T", Contact: "09171234571", Address: "Zone 4", StartTerm: date("2020-01-01"), EndTerm: date("2023-12-31"), status: "Inactive" },
];

function inc(p: Row): Row {
  return {
    id: 0, caseNo: 0, date_recorded: new Date(),
    complaint: "", current_address: "", age: "", contact: "",
    complainee: "", ccontact: null, caddress: "", cage: null,
    status: "Pending", action: "none", incident: "Others", incident_details: "",
    datetime_incident: null, report_status: null,
    expected_arrival: null, time_hearing: null, date_of_arrival: null,
    punong_barangay: "Jose Yumul", archived: false,
    description: null, incident_involve: null, witnesses: null,
    user: "admin", img: null, failReason: null,
    ...p,
  };
}

const incidents: Row[] = [
  inc({ id: 1, caseNo: 10231, complaint: "Juan Dela Cruz", current_address: "Zone 1", complainee: "Carlos Mendoza", caddress: "Zone 5", incident: "Theft", incident_details: "Reported a missing bicycle.", status: "Pending", action: "none", user: "resident", date_recorded: date("2026-05-20") }),
  inc({ id: 2, caseNo: 10544, complaint: "Maria Santos", current_address: "Zone 2", complainee: "Noisy Neighbor", caddress: "Zone 2", incident: "Disturbance / Noise", incident_details: "Loud videoke late at night.", status: "Pending", action: "1st action", expected_arrival: date("2026-06-10"), time_hearing: date("1970-01-01T14:30:00"), user: "maria", date_recorded: date("2026-05-25") }),
  inc({ id: 3, caseNo: 10890, complaint: "Pedro Reyes", current_address: "Zone 3", complainee: "Luis Tan", caddress: "Zone 1", incident: "Harassment", incident_details: "Verbal harassment dispute.", status: "Solved", action: "1st action", description: "Amicably settled between parties.", incident_involve: "Both parties", user: "pedro", date_recorded: date("2026-04-18") }),
  inc({ id: 4, caseNo: 11002, complaint: "Ana Cruz", current_address: "Zone 2", complainee: "Unknown", caddress: "N/A", incident: "Estafa / Deception", incident_details: "Alleged online selling scam.", status: "Unsolved", action: "3rd action", failReason: "Respondent could not be located.", user: "admin", date_recorded: date("2026-03-30") }),
  inc({ id: 5, caseNo: 11210, complaint: "Roberto Lim", current_address: "Zone 4", complainee: "Mario Yu", caddress: "Zone 4", incident: "Physical Injury", incident_details: "Minor altercation at the market.", status: "Pending", action: "none", user: "admin", date_recorded: date("2026-05-28") }),
  inc({ id: 6, caseNo: 11455, complaint: "Old Case", current_address: "Zone 1", complainee: "Someone", caddress: "Zone 1", incident: "Gambling", incident_details: "Archived sample record.", status: "Pending", action: "archive", archived: true, user: "admin", date_recorded: date("2026-02-10") }),
];

const zone_leaders: Row[] = [
  { id: 1, zone: "Zone 1", username: "zone1", password: bcrypt.hashSync("zone123", 10) },
  { id: 2, zone: "Zone 2", username: "zone2", password: bcrypt.hashSync("zone123", 10) },
];

const summons: Row[] = [
  { id: 1, respondent_name: "Carlos Mendoza", date: date("2026-05-22"), day_of_summons: 28, month_of_summons: "May", year_of_summons: 2026, prepared_by: "Elena Lopez", barangay_secretary: "Elena Lopez", serving_day: 23, serving_month: "May", serving_year: 2026, respondents: "Carlos Mendoza", respondent1: "Carlos Mendoza", respondent2: null, respondent3: null, respondent4: null, dwelling_person_name: null, office_person_name: null, complainee1: null, date1: null, complainee2: null, date2: null },
];

const activity_logs: Row[] = [
  { id: 1, timestamp: date("2026-05-28T09:15:00"), message: "Administrator filed complaint #11210 (Physical Injury)" },
  { id: 2, timestamp: date("2026-05-25T16:40:00"), message: "Maria Santos filed complaint #10544 (Disturbance / Noise)" },
  { id: 3, timestamp: date("2026-04-18T11:05:00"), message: "Administrator recorded decision for case #10890 (Solved)" },
];

const archived_records: Row[] = [
  { id: 1, record_type: "incident", archived_data: JSON.stringify({ caseNo: 11455, incident: "Gambling" }), archived_at: date("2026-02-11T08:00:00") },
];

// ---------------------------------------------------------------- query engine
function isDate(x: unknown): x is Date {
  return (
    typeof x === "object" &&
    x !== null &&
    Object.prototype.toString.call(x) === "[object Date]"
  );
}

function matchCond(val: unknown, cond: unknown): boolean {
  if (cond === null || cond === undefined) return val === cond;
  if (isDate(cond)) return isDate(val) ? val.getTime() === cond.getTime() : val === cond;
  if (typeof cond === "object") {
    const c = cond as Record<string, unknown>;
    if ("in" in c) return (c.in as unknown[]).includes(val);
    if ("notIn" in c) return !(c.notIn as unknown[]).includes(val);
    if ("not" in c) return val !== c.not;
    if ("contains" in c) return String(val ?? "").toLowerCase().includes(String(c.contains).toLowerCase());
    if ("equals" in c) return val === c.equals;
    if ("gt" in c) return (val as number) > (c.gt as number);
    if ("gte" in c) return (val as number) >= (c.gte as number);
    if ("lt" in c) return (val as number) < (c.lt as number);
    if ("lte" in c) return (val as number) <= (c.lte as number);
    return false;
  }
  return val === cond;
}

function matchWhere(row: Row, where: unknown): boolean {
  if (!where) return true;
  const w = where as Record<string, unknown>;
  for (const key of Object.keys(w)) {
    const cond = w[key];
    if (key === "AND") { if (!(cond as unknown[]).every((x) => matchWhere(row, x))) return false; continue; }
    if (key === "OR") { if (!(cond as unknown[]).some((x) => matchWhere(row, x))) return false; continue; }
    if (key === "NOT") { if (matchWhere(row, cond)) return false; continue; }
    if (!matchCond(row[key], cond)) return false;
  }
  return true;
}

function comparable(v: unknown): number | string {
  if (v == null) return "";
  if (isDate(v)) return v.getTime();
  return typeof v === "number" ? v : String(v);
}

function sortRows(rows: Row[], orderBy: unknown): Row[] {
  if (!orderBy) return rows;
  const key = Object.keys(orderBy as object)[0];
  const dir = (orderBy as Record<string, string>)[key] === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = comparable(a[key]);
    const bv = comparable(b[key]);
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * dir;
    }
    return String(av).localeCompare(String(bv)) * dir;
  });
}

function nextId(rows: Row[], pk: string): number {
  return rows.reduce((m, r) => Math.max(m, Number(r[pk]) || 0), 0) + 1;
}

function delegate(rows: Row[], pk: string, defaults: () => Row = () => ({})) {
  return {
    findMany: async (args: Record<string, unknown> = {}) => {
      let res = rows.filter((r) => matchWhere(r, args.where));
      res = sortRows(res, args.orderBy);
      if (typeof args.skip === "number") res = res.slice(args.skip);
      if (typeof args.take === "number") res = res.slice(0, args.take);
      return res.map((r) => ({ ...r }));
    },
    findFirst: async (args: Record<string, unknown> = {}) => {
      const r = rows.find((x) => matchWhere(x, args.where));
      return r ? { ...r } : null;
    },
    findUnique: async (args: Record<string, unknown> = {}) => {
      const r = rows.find((x) => matchWhere(x, args.where));
      return r ? { ...r } : null;
    },
    count: async (args: Record<string, unknown> = {}) =>
      rows.filter((r) => matchWhere(r, args.where)).length,
    create: async (args: { data: Row }) => {
      const row: Row = { ...defaults(), [pk]: nextId(rows, pk), ...args.data };
      rows.push(row);
      return { ...row };
    },
    update: async (args: { where: unknown; data: Row }) => {
      const r = rows.find((x) => matchWhere(x, args.where));
      if (r) Object.assign(r, args.data);
      return r ? { ...r } : null;
    },
    delete: async (args: { where: unknown }) => {
      const i = rows.findIndex((x) => matchWhere(x, args.where));
      return i >= 0 ? rows.splice(i, 1)[0] : null;
    },
    groupBy: async (args: { by: string[]; where?: unknown }) => {
      const filtered = rows.filter((r) => matchWhere(r, args.where));
      const map = new Map<string, Row>();
      for (const r of filtered) {
        const k = args.by.map((b) => r[b]).join("|||");
        if (!map.has(k)) {
          const g: Row = {};
          args.by.forEach((b) => (g[b] = r[b]));
          g._count = { _all: 0 };
          map.set(k, g);
        }
        (map.get(k)!._count as { _all: number })._all++;
      }
      return [...map.values()];
    },
  };
}

export const mockPrisma = {
  admin: delegate(admins, "admin_id"),
  residents: delegate(residents, "id"),
  officials: delegate(officials, "OfficialID"),
  incidents: delegate(incidents, "id", () => ({ date_recorded: new Date(), archived: false, action: "none", status: "Pending" })),
  zone_leaders: delegate(zone_leaders, "id"),
  summons: delegate(summons, "id", () => ({ created_at: new Date() })),
  activity_logs: delegate(activity_logs, "id", () => ({ timestamp: new Date() })),
  archived_records: delegate(archived_records, "id", () => ({ archived_at: new Date() })),
};
