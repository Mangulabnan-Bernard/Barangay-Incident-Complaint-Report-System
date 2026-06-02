import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function initials(first: string, last: string): string {
  return `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase();
}

function fullName(o: {
  FirstName: string;
  MiddleName: string;
  LastName: string;
}): string {
  return [o.FirstName, o.MiddleName, o.LastName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

export default async function OfficialsGalleryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const officials = await prisma.officials.findMany({
    orderBy: { OfficialID: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Barangay Officials</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Meet the officials serving the barangay.
        </p>
      </div>

      {officials.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          No officials found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {officials.map((o) => {
            const active = today <= o.EndTerm;
            return (
              <div
                key={o.OfficialID}
                className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  {initials(o.FirstName, o.LastName)}
                </div>
                <h2 className="mt-3 text-base font-semibold">{fullName(o)}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {o.Position}
                </p>
                <span
                  className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  }`}
                >
                  {active ? "Active" : "Not Active"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
