import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const u = await prisma.admin.findFirst({ where: { admin_id: id } });
  if (!u) notFound();

  const role = u.role === "STAFF" ? "STAFF" : "ADMIN";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit User</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update account details. Leave the password blank to keep it
          unchanged.
        </p>
      </div>
      <UserForm
        mode="edit"
        userId={u.admin_id}
        cancelHref="/users"
        initial={{
          admin_name: u.admin_name,
          admin_email: u.admin_email,
          password: "",
          role,
        }}
      />
    </div>
  );
}
