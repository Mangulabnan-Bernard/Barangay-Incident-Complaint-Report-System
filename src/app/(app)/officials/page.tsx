import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/components/pagination";
import { DeleteOfficialButton } from "@/components/delete-official-button";

const PAGE_SIZE = 8;

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString();
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

export default async function OfficialsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/officials/gallery");
  const isAdmin = session?.role === "ADMIN";

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [total, officials] = await Promise.all([
    prisma.officials.count(),
    prisma.officials.findMany({
      orderBy: { OfficialID: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Officials</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} official{total === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/officials/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Add Official
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {officials.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No officials found.
                  </td>
                </tr>
              )}
              {officials.map((o) => {
                const active = today <= o.EndTerm;
                return (
                  <tr
                    key={o.OfficialID}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-medium">{o.Position}</td>
                    <td className="px-4 py-3">{fullName(o)}</td>
                    <td className="px-4 py-3">{o.Contact}</td>
                    <td className="px-4 py-3">
                      {formatDate(o.StartTerm)} – {formatDate(o.EndTerm)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                        }`}
                      >
                        {active ? "Active" : "Not Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/officials/${o.OfficialID}/edit`}
                          className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                        >
                          Edit
                        </Link>
                        {isAdmin && (
                          <DeleteOfficialButton
                            id={o.OfficialID}
                            name={fullName(o)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/officials" />
    </div>
  );
}
