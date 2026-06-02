import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/incidents";
import { StatusBadge } from "@/components/status-badge";
import { RecomplaintButton } from "@/components/recomplaint-button";

const TABS = [
  { key: "active", label: "Active" },
  { key: "solved", label: "Solved" },
  { key: "unsolved", label: "Unsolved" },
];

export default async function MyIncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "RESIDENT") redirect("/incidents");

  const sp = await searchParams;
  const tab = (sp.tab ?? "active").toLowerCase();

  const and: Record<string, unknown>[] = [{ user: session.username }];
  if (tab === "active") and.push({ status: { in: ["Pending", "pending"] } });
  else if (tab === "solved") and.push({ status: { in: ["Solved", "solved"] } });
  else if (tab === "unsolved")
    and.push({ status: { in: ["Unsolved", "unsolved"] } });

  const incidents = await prisma.incidents.findMany({
    where: { AND: and },
    orderBy: { id: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Complaints</h1>
        <Link
          href="/incidents/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + File a Complaint
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/incidents/mine?tab=${t.key}`}
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

      {incidents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No {tab} complaints.
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((i) => (
            <div
              key={i.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">
                      #{i.caseNo}
                    </span>
                    <StatusBadge status={i.status} />
                  </div>
                  <p className="mt-1 font-medium">{i.incident}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {i.incident_details}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Filed {formatDate(i.date_recorded)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    href={`/incidents/${i.id}`}
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    View
                  </Link>
                  {i.status?.toLowerCase() !== "pending" && (
                    <RecomplaintButton id={i.id} caseNo={i.caseNo} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
