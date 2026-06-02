"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export interface ResidentFormValues {
  name: string;
  gender: string;
  address: string;
  user: string;
  password: string;
}

const EMPTY: ResidentFormValues = {
  name: "",
  gender: "Male",
  address: "",
  user: "",
  password: "",
};

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800";
const labelClass = "mb-1 block text-sm font-medium";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function ResidentForm({
  mode,
  residentId,
  initial,
  cancelHref,
}: {
  mode: "create" | "edit";
  residentId?: number;
  initial?: Partial<ResidentFormValues>;
  cancelHref: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<ResidentFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ResidentFormValues>(
    key: K,
    value: ResidentFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        mode === "create" ? "/api/residents" : `/api/residents/${residentId}`;
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
      toast.success(mode === "create" ? "Resident added" : "Resident updated");
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
          <Field label="Full name *">
            <input
              required
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Gender">
            <select
              value={v.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={inputClass}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address *">
              <input
                required
                value={v.address}
                onChange={(e) => set("address", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Username *">
            <input
              required
              value={v.user}
              onChange={(e) => set("user", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label={mode === "create" ? "Password *" : "Password"}
          >
            <input
              type="password"
              required={mode === "create"}
              value={v.password}
              onChange={(e) => set("password", e.target.value)}
              className={inputClass}
            />
            {mode === "edit" && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Leave blank to keep current password.
              </p>
            )}
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Add resident"
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
