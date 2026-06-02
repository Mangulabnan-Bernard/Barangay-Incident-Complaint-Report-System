"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { STATUS_OPTIONS } from "@/lib/incidents";

export interface CaseDecisionValues {
  status: string;
  description: string;
  incident_involve: string;
  failReason: string;
  punong_barangay: string;
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

export function CaseDecisionForm({
  incidentId,
  initial,
}: {
  incidentId: number;
  initial: CaseDecisionValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<CaseDecisionValues>(initial);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CaseDecisionValues>(
    key: K,
    value: CaseDecisionValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Failed to save");
        return;
      }
      toast.success("Decision recorded");
      router.push("/cases");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
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
        <Field label="Parties involved">
          <input
            value={v.incident_involve}
            onChange={(e) => set("incident_involve", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Decision / Resolution *">
        <textarea
          rows={4}
          required
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
          placeholder="Describe how the case was resolved (required)"
        />
      </Field>

      {v.status === "Unsolved" && (
        <Field label="Reason unsolved *">
          <input
            required
            value={v.failReason}
            onChange={(e) => set("failReason", e.target.value)}
            className={inputClass}
            placeholder="Why was this case not resolved? (required)"
          />
        </Field>
      )}

      <Field label="Prepared by / Punong Barangay">
        <input
          value={v.punong_barangay}
          onChange={(e) => set("punong_barangay", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save decision"}
        </button>
        <Link
          href="/cases"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
