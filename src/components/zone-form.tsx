"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface ZoneFormValues {
  zone: string;
  username: string;
  password: string;
}

const EMPTY: ZoneFormValues = {
  zone: "",
  username: "",
  password: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800";
const labelClass = "mb-1 block text-sm font-medium";

type AvailState = "idle" | "checking" | "available" | "taken";

export function ZoneForm({
  mode,
  zoneId,
  initial,
  cancelHref,
}: {
  mode: "create" | "edit";
  zoneId?: number;
  initial?: Partial<ZoneFormValues>;
  cancelHref: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<ZoneFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [avail, setAvail] = useState<AvailState>("idle");
  const ownUsername = useRef(initial?.username ?? "");

  function set<K extends keyof ZoneFormValues>(
    key: K,
    value: ZoneFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  // Debounced live username availability check.
  useEffect(() => {
    const username = v.username.trim();
    if (!username) {
      setAvail("idle");
      return;
    }
    // In edit mode, the record's own current username is always fine.
    if (mode === "edit" && username === ownUsername.current.trim()) {
      setAvail("available");
      return;
    }

    setAvail("checking");
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/zone-leaders/check-username?username=${encodeURIComponent(username)}`,
          { signal: ctrl.signal },
        );
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setAvail("idle");
          return;
        }
        setAvail(data.available ? "available" : "taken");
      } catch {
        // Ignore aborted/failed checks; leave hint as-is.
      }
    }, 400);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [v.username, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/zone-leaders"
          : `/api/zone-leaders/${zoneId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Failed to save");
        return;
      }
      toast.success(
        mode === "create" ? "Zone leader added" : "Zone leader updated",
      );
      router.push(cancelHref);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Zone *</label>
            <input
              required
              value={v.zone}
              onChange={(e) => set("zone", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Username *</label>
            <input
              required
              value={v.username}
              onChange={(e) => set("username", e.target.value)}
              className={inputClass}
            />
            {avail === "checking" && (
              <p className="mt-1 text-xs text-slate-400">Checking…</p>
            )}
            {avail === "available" && (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                available
              </p>
            )}
            {avail === "taken" && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                taken
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              {mode === "create" ? "Password *" : "Password"}
            </label>
            <input
              type="password"
              required={mode === "create"}
              value={v.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={
                mode === "edit" ? "Leave blank to keep current" : undefined
              }
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || avail === "taken"}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Add zone leader"
              : "Save changes"}
        </button>
        <Link
          href={cancelHref}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
