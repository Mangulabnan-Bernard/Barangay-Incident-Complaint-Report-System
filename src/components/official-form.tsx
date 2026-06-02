"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export interface OfficialFormValues {
  Position: string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  Contact: string;
  Address: string;
  startTerm: string;
  endTerm: string;
  status: string;
}

const EMPTY: OfficialFormValues = {
  Position: "",
  LastName: "",
  FirstName: "",
  MiddleName: "",
  Contact: "",
  Address: "",
  startTerm: "",
  endTerm: "",
  status: "Active",
};

const STATUS_OPTIONS = ["Active", "Inactive"];

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </h2>
  );
}

export function OfficialForm({
  mode,
  officialId,
  initial,
  cancelHref,
}: {
  mode: "create" | "edit";
  officialId?: number;
  initial?: Partial<OfficialFormValues>;
  cancelHref: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<OfficialFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof OfficialFormValues>(
    key: K,
    value: OfficialFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        mode === "create" ? "/api/officials" : `/api/officials/${officialId}`;
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
        mode === "create" ? "Official added" : "Official updated",
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
        <SectionTitle>Official</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Position *">
            <input
              required
              value={v.Position}
              onChange={(e) => set("Position", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Contact *">
            <input
              required
              value={v.Contact}
              onChange={(e) => set("Contact", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="First name *">
            <input
              required
              value={v.FirstName}
              onChange={(e) => set("FirstName", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Middle name">
            <input
              value={v.MiddleName}
              onChange={(e) => set("MiddleName", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Last name *">
            <input
              required
              value={v.LastName}
              onChange={(e) => set("LastName", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Address *">
            <input
              required
              value={v.Address}
              onChange={(e) => set("Address", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionTitle>Term</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start term *">
            <input
              required
              type="date"
              value={v.startTerm}
              onChange={(e) => set("startTerm", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="End term *">
            <input
              required
              type="date"
              value={v.endTerm}
              onChange={(e) => set("endTerm", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Status">
            <select
              value={v.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
              ? "Add official"
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
