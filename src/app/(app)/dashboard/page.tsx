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

export default async function DashboardPage() {
  const session = await getSession();
  const isStaffOrAdmin =
    session?.role === "ADMIN" || session?.role === "STAFF";

  let stats: {
    residents: number;
    incidents: number;
    officials: number;
    pending: number;
    solved: number;
  } | null = null;

  if (isStaffOrAdmin) {
    const [residents, incidents, officials, pending, solved] =
      await Promise.all([
        prisma.residents.count(),
        prisma.incidents.count(),
        prisma.officials.count(),
        prisma.incidents.count({ where: { status: { in: ["Pending", "pending"] } } }),
        prisma.incidents.count({ where: { status: { in: ["Solved", "solved"] } } }),
      ]);
    stats = { residents, incidents, officials, pending, solved };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {session?.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Barangay San Juan — Information &amp; Complaint Management System
        </p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Residents" value={stats.residents} />
          <StatCard label="Incidents" value={stats.incidents} />
          <StatCard label="Officials" value={stats.officials} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Solved" value={stats.solved} />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You can file and track your complaints here. More features are on the
            way.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-300">
          v2 build in progress
        </p>
        <p className="mt-1">
          Auth &amp; the app shell are live. Modules in the sidebar marked{" "}
          <span className="font-medium">“soon”</span> are being built next
          (Incidents, Hearings, Cases, Summons, Directories, Reports).
        </p>
      </div>
    </div>
  );
}
