"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  INCIDENT_TYPES,
  STATUS_OPTIONS,
  ACTION_OPTIONS,
} from "@/lib/incidents";

export interface IncidentFormValues {
  complaint: string;
  age: string;
  current_address: string;
  contact: string;
  complainee: string;
  cage: string;
  caddress: string;
  ccontact: string;
  incident: string;
  incident_details: string;
  datetime_incident: string;
  status: string;
  action: string;
  description: string;
  incident_involve: string;
  failReason: string;
}

const EMPTY: IncidentFormValues = {
  complaint: "",
  age: "",
  current_address: "",
  contact: "",
  complainee: "",
  cage: "",
  caddress: "",
  ccontact: "",
  incident: "",
  incident_details: "",
  datetime_incident: "",
  status: "Pending",
  action: "none",
  description: "",
  incident_involve: "",
  failReason: "",
};

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

export function IncidentForm({
  mode,
  incidentId,
  initial,
  canSetStatus = false,
  cancelHref,
}: {
  mode: "create" | "edit";
  incidentId?: number;
  initial?: Partial<IncidentFormValues>;
  canSetStatus?: boolean;
  cancelHref: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<IncidentFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof IncidentFormValues>(
    key: K,
    value: IncidentFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        mode === "create" ? "/api/incidents" : `/api/incidents/${incidentId}`;
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
        mode === "create"
          ? `Complaint filed${data.caseNo ? ` (#${data.caseNo})` : ""}`
          : "Complaint updated",
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
        <SectionTitle>Complainant</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name *">
            <input
              required
              value={v.complaint}
              onChange={(e) => set("complaint", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Age">
            <input
              value={v.age}
              onChange={(e) => set("age", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Address *">
            <input
              required
              value={v.current_address}
              onChange={(e) => set("current_address", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Contact number">
            <input
              value={v.contact}
              onChange={(e) => set("contact", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionTitle>Respondent</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name *">
            <input
              required
              value={v.complainee}
              onChange={(e) => set("complainee", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Age">
            <input
              value={v.cage}
              onChange={(e) => set("cage", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Address">
            <input
              value={v.caddress}
              onChange={(e) => set("caddress", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Contact number">
            <input
              value={v.ccontact}
              onChange={(e) => set("ccontact", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionTitle>Incident</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type *">
            <select
              required
              value={v.incident}
              onChange={(e) => set("incident", e.target.value)}
              className={inputClass}
            >
              <option value="">Select type…</option>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date & time of incident">
            <input
              type="datetime-local"
              value={v.datetime_incident}
              onChange={(e) => set("datetime_incident", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Details *">
            <textarea
              required
              rows={4}
              value={v.incident_details}
              onChange={(e) => set("incident_details", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {canSetStatus && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <SectionTitle>Case status</SectionTitle>
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
            <Field
              label={`Resolution / decision${
                v.status !== "Pending" ? " *" : ""
              }`}
            >
              <input
                value={v.description}
                onChange={(e) => set("description", e.target.value)}
                required={v.status !== "Pending"}
                className={inputClass}
                placeholder={
                  v.status !== "Pending"
                    ? "Required when Solved/Unsolved"
                    : undefined
                }
              />
            </Field>
            <Field label="Parties involved">
              <input
                value={v.incident_involve}
                onChange={(e) => set("incident_involve", e.target.value)}
                className={inputClass}
              />
            </Field>
            {v.status === "Unsolved" && (
              <div className="sm:col-span-2">
                <Field label="Reason unsolved *">
                  <input
                    value={v.failReason}
                    onChange={(e) => set("failReason", e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "create"
              ? "File complaint"
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
