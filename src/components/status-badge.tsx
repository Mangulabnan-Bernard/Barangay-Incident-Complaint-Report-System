import { statusBadgeClass } from "@/lib/incidents";

export function StatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(status)}`}
    >
      {status || "—"}
    </span>
  );
}
