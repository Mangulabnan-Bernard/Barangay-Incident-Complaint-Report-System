// Pure, client-safe constants & helpers for the Incidents module.
// No Prisma imports here, so this is safe to import from client components.

export const INCIDENT_TYPES = [
  "Theft",
  "Estafa / Deception",
  "Physical Injury",
  "Harassment",
  "Defamation / Slander",
  "Grave Threats",
  "Bullying",
  "Gambling",
  "Drug Abuse",
  "Domestic Dispute",
  "Property Damage",
  "Trespassing",
  "Disturbance / Noise",
  "Unpaid Debt",
  "Boundary Dispute",
  "Others",
] as const;

export const STATUS_OPTIONS = ["Pending", "Solved", "Unsolved"] as const;
export type IncidentStatus = (typeof STATUS_OPTIONS)[number];

export const ACTION_OPTIONS = [
  "none",
  "1st action",
  "2nd action",
  "3rd action",
] as const;

export function statusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "solved")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (s === "unsolved")
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"; // pending
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
