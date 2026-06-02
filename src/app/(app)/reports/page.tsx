import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "STAFF") redirect("/dashboard");

  // ADMIN sees everything; RESIDENT is scoped to their own incidents.
  const scope: Record<string, unknown> =
    session.role === "RESIDENT" ? { user: session.username } : {};

  const [total, solved, pending, unsolved, byType] = await Promise.all([
    prisma.incidents.count({ where: scope }),
    prisma.incidents.count({
      where: { ...scope, status: { in: ["Solved", "solved"] } },
    }),
    prisma.incidents.count({
      where: { ...scope, status: { in: ["Pending", "pending"] } },
    }),
    prisma.incidents.count({
      where: { ...scope, status: { in: ["Unsolved", "unsolved"] } },
    }),
    prisma.incidents.groupBy({
      by: ["incident"],
      where: scope,
      _count: { _all: true },
    }),
  ]);

  const typeRows = byType
    .map((row) => ({
      type: row.incident || "Unspecified",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = typeRows.length ? typeRows[0].count : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {session.role === "RESIDENT"
            ? "Overview of the complaints you have filed."
            : "Overview of incident records across the barangay."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total incidents" value={total} />
        <StatCard label="Solved" value={solved} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Unsolved" value={unsolved} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Incidents by type</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Distribution of records grouped by incident type.
        </p>

        {typeRows.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">No data yet.</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {typeRows.map((row) => {
              const pct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
              return (
                <li key={row.type}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {row.type}
                    </span>
                    <span className="tabular-nums text-slate-500 dark:text-slate-400">
                      {row.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
