import { getSession } from "@/lib/current-user";
import { IncidentForm } from "@/components/incident-form";

export default async function NewIncidentPage() {
  const session = await getSession();
  const cancelHref =
    session?.role === "RESIDENT" ? "/incidents/mine" : "/incidents";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">File a Complaint</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record a new incident / blotter complaint.
        </p>
      </div>
      <IncidentForm mode="create" cancelHref={cancelHref} />
    </div>
  );
}
