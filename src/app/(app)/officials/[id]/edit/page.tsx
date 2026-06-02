import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { OfficialForm } from "@/components/official-form";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function EditOfficialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/officials/gallery");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const o = await prisma.officials.findUnique({ where: { OfficialID: id } });
  if (!o) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Official</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update official details and term.
        </p>
      </div>
      <OfficialForm
        mode="edit"
        officialId={o.OfficialID}
        cancelHref="/officials"
        initial={{
          Position: o.Position,
          LastName: o.LastName,
          FirstName: o.FirstName,
          MiddleName: o.MiddleName,
          Contact: o.Contact,
          Address: o.Address,
          startTerm: toDateInput(o.StartTerm),
          endTerm: toDateInput(o.EndTerm),
          status: o.status,
        }}
      />
    </div>
  );
}
