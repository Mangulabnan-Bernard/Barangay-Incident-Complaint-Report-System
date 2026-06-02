import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { IncidentForm } from "@/components/incident-form";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default async function EditIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/incidents/mine");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const i = await prisma.incidents.findUnique({ where: { id } });
  if (!i) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Complaint #{i.caseNo}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update complaint details and case status.
        </p>
      </div>
      <IncidentForm
        mode="edit"
        incidentId={i.id}
        canSetStatus
        cancelHref={`/incidents/${i.id}`}
        initial={{
          complaint: i.complaint,
          age: i.age,
          current_address: i.current_address,
          contact: i.contact,
          complainee: i.complainee,
          cage: i.cage?.toString() ?? "",
          caddress: i.caddress,
          ccontact: i.ccontact ?? "",
          incident: i.incident,
          incident_details: i.incident_details,
          datetime_incident: toLocalInput(i.datetime_incident),
          status: i.status,
          action: i.action,
          description: i.description ?? "",
          incident_involve: i.incident_involve ?? "",
          failReason: i.failReason ?? "",
        }}
      />
    </div>
  );
}
