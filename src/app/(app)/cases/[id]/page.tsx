import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/incidents";
import { StatusBadge } from "@/components/status-badge";
import { CaseDecisionForm } from "@/components/case-decision-form";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="text-sm">{value || "—"}</dd>
    </div>
  );
}

export default async function CaseDecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const i = await prisma.incidents.findUnique({ where: { id } });
  if (!i) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Case #{i.caseNo}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <StatusBadge status={i.status} />
            <span>·</span>
            <span>{i.incident}</span>
            <span>·</span>
            <span>Filed {formatDate(i.date_recorded)}</span>
          </div>
        </div>
        <Link
          href="/cases"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Back
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Case summary
        </h2>
        <dl className="grid gap-x-6 sm:grid-cols-2">
          <Row label="Case #" value={`#${i.caseNo}`} />
          <Row label="Type" value={i.incident} />
          <Row label="Complainant" value={i.complaint} />
          <Row label="Respondent" value={i.complainee} />
          <div className="sm:col-span-2">
            <Row label="Details" value={i.incident_details} />
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Decision
        </h2>
        <CaseDecisionForm
          incidentId={i.id}
          initial={{
            status: i.status ?? "",
            description: i.description ?? "",
            incident_involve: i.incident_involve ?? "",
            failReason: i.failReason ?? "",
            punong_barangay: i.punong_barangay ?? "",
          }}
        />
      </section>
    </div>
  );
}
