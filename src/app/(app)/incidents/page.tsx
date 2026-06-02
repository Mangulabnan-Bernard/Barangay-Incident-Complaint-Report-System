import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/incidents";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { DeleteIncidentButton } from "@/components/delete-incident-button";

const PAGE_SIZE = 8;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "solved", label: "Solved" },
  { key: "unsolved", label: "Unsolved" },
];

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/incidents/mine");
  const isAdmin = session?.role === "ADMIN";

  const sp = await searchParams;
  const status = (sp.status ?? "all").toLowerCase();
  const page = Math.max(1, Number(sp.page) || 1);

  const and: Record<string, unknown>[] = [{ action: { not: "archive" } }];
  if (status === "pending") and.push({ status: { in: ["Pending", "pending"] } });
  else if (status === "solved") and.push({ status: { in: ["Solved", "solved"] } });
  else if (status === "unsolved")
    and.push({ status: { in: ["Unsolved", "unsolved"] } });

  const where = { AND: and };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Incidents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} complaint{total === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/incidents/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Add Complaint
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <Link
              key={f.key}
              href={`/incidents?status=${f.key}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Case #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Complainant</th>
                <th className="px-4 py-3">Respondent</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {incidents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No incidents found.
                  </td>
                </tr>
              )}
              {incidents.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-xs">#{i.caseNo}</td>
                  <td className="px-4 py-3">{formatDate(i.date_recorded)}</td>
                  <td className="px-4 py-3 font-medium">{i.complaint}</td>
                  <td className="px-4 py-3">{i.complainee}</td>
                  <td className="px-4 py-3">{i.incident}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/incidents/${i.id}`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        View
                      </Link>
                      <Link
                        href={`/incidents/${i.id}/edit`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                      >
                        Edit
                      </Link>
                      {isAdmin && (
                        <DeleteIncidentButton id={i.id} caseNo={i.caseNo} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/incidents"
        query={{ status }}
      />
    </div>
  );
}
