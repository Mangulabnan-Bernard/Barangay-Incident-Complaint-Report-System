import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/incidents";
import { StatusBadge } from "@/components/status-badge";

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

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      <dl className="divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </dl>
    </section>
  );
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const i = await prisma.incidents.findUnique({ where: { id } });
  if (!i) notFound();
  if (session?.role === "RESIDENT" && i.user !== session.username) {
    redirect("/incidents/mine");
  }
  const canEdit = session?.role === "ADMIN" || session?.role === "STAFF";
  const backHref = session?.role === "RESIDENT" ? "/incidents/mine" : "/incidents";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Complaint #{i.caseNo}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <StatusBadge status={i.status} />
            <span>·</span>
            <span>{i.incident}</span>
            <span>·</span>
            <span>Filed {formatDate(i.date_recorded)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              href={`/incidents/${i.id}/edit`}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Edit
            </Link>
          )}
          <Link
            href={backHref}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Complainant">
          <Row label="Name" value={i.complaint} />
          <Row label="Age" value={i.age} />
          <Row label="Address" value={i.current_address} />
          <Row label="Contact" value={i.contact} />
        </Card>
        <Card title="Respondent">
          <Row label="Name" value={i.complainee} />
          <Row label="Age" value={i.cage?.toString()} />
          <Row label="Address" value={i.caddress} />
          <Row label="Contact" value={i.ccontact} />
        </Card>
      </div>

      <Card title="Incident">
        <Row label="Type" value={i.incident} />
        <Row
          label="Date & time of incident"
          value={
            i.datetime_incident
              ? new Date(i.datetime_incident).toLocaleString("en-PH")
              : "—"
          }
        />
        <Row label="Details" value={i.incident_details} />
        <Row label="Action" value={i.action} />
      </Card>

      {(i.description || i.incident_involve || i.failReason) && (
        <Card title="Resolution">
          <Row label="Decision" value={i.description} />
          <Row label="Parties involved" value={i.incident_involve} />
          {i.failReason && <Row label="Reason unsolved" value={i.failReason} />}
        </Card>
      )}
    </div>
  );
}
