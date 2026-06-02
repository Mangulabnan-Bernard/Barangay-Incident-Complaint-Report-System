import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { ResidentForm } from "@/components/resident-form";

export default async function NewResidentPage() {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Add Resident</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create a new resident account.
        </p>
      </div>
      <ResidentForm mode="create" cancelHref="/residents" />
    </div>
  );
}
