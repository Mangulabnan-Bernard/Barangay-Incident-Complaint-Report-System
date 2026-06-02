import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ZoneForm } from "@/components/zone-form";

export default async function EditZoneLeaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/zone");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const leader = await prisma.zone_leaders.findUnique({ where: { id } });
  if (!leader) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Zone Leader</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update zone leader details.
        </p>
      </div>
      <ZoneForm
        mode="edit"
        zoneId={leader.id}
        cancelHref="/zone"
        initial={{
          zone: leader.zone,
          username: leader.username,
          password: "",
        }}
      />
    </div>
  );
}
