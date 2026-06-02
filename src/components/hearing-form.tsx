"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ACTION_OPTIONS, STATUS_OPTIONS } from "@/lib/incidents";

export interface HearingFormValues {
  date: string;
  time: string;
  action: string;
  status: string;
}

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

export function HearingForm({
  incidentId,
  initial,
}: {
  incidentId: number;
  initial: HearingFormValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<HearingFormValues>(initial);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof HearingFormValues>(
    key: K,
    value: HearingFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  const canSave = Boolean(v.date) && Boolean(v.time);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/hearing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Failed to save");
        return;
      }
      toast.success("Hearing saved");
      router.push("/hearings");
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
        <h2 className="mb-3 mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Hearing schedule
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hearing date *">
            <input
              type="date"
              value={v.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Hearing time *">
            <input
              type="time"
              value={v.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Action">
            <select
              value={v.action}
              onChange={(e) => set("action", e.target.value)}
              className={inputClass}
            >
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
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
          disabled={loading || !canSave}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <Link
          href="/hearings"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
