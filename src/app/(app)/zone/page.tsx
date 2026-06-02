import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/components/pagination";
import { DeleteZoneButton } from "@/components/delete-zone-button";

const PAGE_SIZE = 8;

export default async function ZonePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (session?.role === "RESIDENT") redirect("/dashboard");
  const isAdmin = session?.role === "ADMIN";

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [total, leaders] = await Promise.all([
    prisma.zone_leaders.count(),
    prisma.zone_leaders.findMany({
      orderBy: { id: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Zone Leaders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} zone leader{total === 1 ? "" : "s"}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/zone/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Add Zone Leader
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Username</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaders.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 3 : 2}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No zone leaders found.
                  </td>
                </tr>
              )}
              {leaders.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium">{l.zone}</td>
                  <td className="px-4 py-3">{l.username}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/zone/${l.id}/edit`}
                          className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                        >
                          Edit
                        </Link>
                        <DeleteZoneButton id={l.id} username={l.username} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/zone" />
    </div>
  );
}
