import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  query,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    if (query) {
      for (const [k, val] of Object.entries(query)) {
        if (val) sp.set(k, val);
      }
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const linkClass =
    "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800";

  return (
    <div className="flex items-center justify-between pt-2 text-sm text-slate-500 dark:text-slate-400">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className={linkClass}>
            ← Previous
          </Link>
        )}
        {page < totalPages && (
          <Link href={href(page + 1)} className={linkClass}>
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
