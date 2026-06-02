import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { SummonForm } from "@/components/summon-form";

export default async function NewSummonsPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">New Summons</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Issue a KP Form 7 summons to a respondent.
        </p>
      </div>
      <SummonForm />
    </div>
  );
}
