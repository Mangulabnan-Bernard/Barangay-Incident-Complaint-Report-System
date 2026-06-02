import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ResidentForm } from "@/components/resident-form";

export default async function EditResidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/dashboard");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const r = await prisma.residents.findUnique({ where: { id } });
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Resident</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update resident details.
        </p>
      </div>
      <ResidentForm
        mode="edit"
        residentId={r.id}
        cancelHref="/residents"
        initial={{
          name: r.name,
          gender: r.gender,
          address: r.address,
          user: r.user,
          password: "",
        }}
      />
    </div>
  );
}
