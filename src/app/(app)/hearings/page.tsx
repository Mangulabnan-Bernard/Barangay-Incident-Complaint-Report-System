import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/incidents";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 8;

function formatTime(value: Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function HearingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where = {
    AND: [
      { status: { in: ["Pending", "pending"] } },
      { action: { not: "archive" } },
    ],
  };

  const [total, incidents] = await Promise.all([
    prisma.incidents.count({ where }),
    prisma.incidents.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Hearings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total} pending hearing{total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Case #</th>
                <th className="px-4 py-3">Complainant</th>
                <th className="px-4 py-3">Respondent</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Current action</th>
                <th className="px-4 py-3">Hearing date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {incidents.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No pending hearings.
                  </td>
                </tr>
              )}
              {incidents.map((i) => (
                <tr
                  key={i.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-mono text-xs">#{i.caseNo}</td>
                  <td className="px-4 py-3 font-medium">{i.complaint}</td>
                  <td className="px-4 py-3">{i.complainee}</td>
                  <td className="px-4 py-3">{i.incident}</td>
                  <td className="px-4 py-3">{i.action}</td>
                  <td className="px-4 py-3">{formatDate(i.expected_arrival)}</td>
                  <td className="px-4 py-3">{formatTime(i.time_hearing)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/hearings/${i.id}`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                      >
                        Schedule
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/hearings" />
    </div>
  );
}
