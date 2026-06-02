import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { UserForm } from "@/components/user-form";

export default async function NewUserPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Add User</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create a new admin or staff account.
        </p>
      </div>
      <UserForm mode="create" cancelHref="/users" />
    </div>
  );
}
