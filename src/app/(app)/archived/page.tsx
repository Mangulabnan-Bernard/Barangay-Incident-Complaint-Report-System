import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/incidents";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { RecoverIncidentButton } from "@/components/recover-incident-button";

const PAGE_SIZE = 8;

const TABS = [
  { key: "incidents", label: "Incidents" },
  { key: "records", label: "Records" },
];

export default async function ArchivedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const sp = await searchParams;
  const tab = sp.tab === "records" ? "records" : "incidents";
  const page = Math.max(1, Number(sp.page) || 1);

  let total = 0;
  let totalPages = 0;
  let incidents: Awaited<ReturnType<typeof prisma.incidents.findMany>> = [];
  let records: Awaited<ReturnType<typeof prisma.archived_records.findMany>> = [];

  if (tab === "records") {
    const where = {};
    [total, records] = await Promise.all([
      prisma.archived_records.count({ where }),
      prisma.archived_records.findMany({
        where,
        orderBy: { archived_at: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
  } else {
    const where = { OR: [{ archived: true }, { action: "archive" }] };
    [total, incidents] = await Promise.all([
      prisma.incidents.count({ where }),
      prisma.incidents.findMany({
        where,
        orderBy: { id: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
  }
  totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Archived</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total} {tab === "records" ? "record" : "incident"}
          {total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/archived?tab=${t.key}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          {tab === "records" ? (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Archived at</th>
                  <th className="px-4 py-3">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No archived records found.
                    </td>
                  </tr>
                )}
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-medium">{r.record_type}</td>
                    <td className="px-4 py-3">{formatDate(r.archived_at)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {r.archived_data.slice(0, 80)}
                      {r.archived_data.length > 80 ? "…" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Case #</th>
                  <th className="px-4 py-3">Complainant</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No archived incidents found.
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
                    <td className="px-4 py-3">{i.incident}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <RecoverIncidentButton id={i.id} caseNo={i.caseNo} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/archived"
        query={{ tab }}
      />
    </div>
  );
}
