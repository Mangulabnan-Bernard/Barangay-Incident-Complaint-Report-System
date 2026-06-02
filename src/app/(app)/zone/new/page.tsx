import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { ZoneForm } from "@/components/zone-form";

export default async function NewZoneLeaderPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/zone");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Add Zone Leader</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create a new zone leader account.
        </p>
      </div>
      <ZoneForm mode="create" cancelHref="/zone" />
    </div>
  );
}
