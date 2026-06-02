import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { OfficialForm } from "@/components/official-form";

export default async function NewOfficialPage() {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/officials/gallery");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Add Official</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record a new barangay official.
        </p>
      </div>
      <OfficialForm mode="create" cancelHref="/officials" />
    </div>
  );
}
