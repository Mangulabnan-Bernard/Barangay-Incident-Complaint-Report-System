"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export interface SummonFormValues {
  // Respondent
  respondent_name: string;
  respondents: string;
  respondent1: string;
  respondent2: string;
  respondent3: string;
  respondent4: string;
  // Appearance
  date: string;
  day_of_summons: string;
  month_of_summons: string;
  year_of_summons: string;
  // Serving
  serving_day: string;
  serving_month: string;
  serving_year: string;
  // Officials
  prepared_by: string;
  barangay_secretary: string;
  // Optional
  dwelling_person_name: string;
  office_person_name: string;
  complainee1: string;
  date1: string;
  complainee2: string;
  date2: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const EMPTY: SummonFormValues = {
  respondent_name: "",
  respondents: "",
  respondent1: "",
  respondent2: "",
  respondent3: "",
  respondent4: "",
  date: "",
  day_of_summons: "",
  month_of_summons: "",
  year_of_summons: "",
  serving_day: "",
  serving_month: "",
  serving_year: "",
  prepared_by: "",
  barangay_secretary: "",
  dwelling_person_name: "",
  office_person_name: "",
  complainee1: "",
  date1: "",
  complainee2: "",
  date2: "",
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

export function SummonForm() {
  const router = useRouter();
  const [v, setV] = useState<SummonFormValues>(EMPTY);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof SummonFormValues>(
    key: K,
    value: SummonFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/summons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Failed to save");
        return;
      }
      toast.success("Summons issued");
      router.push(`/summons/${data.id}`);
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
        <SectionTitle>Respondent</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Respondent name *">
            <input
              required
              value={v.respondent_name}
              onChange={(e) => set("respondent_name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Respondent(s) text *">
            <input
              required
              value={v.respondents}
              onChange={(e) => set("respondents", e.target.value)}
              placeholder="e.g. Juan Dela Cruz, et al."
              className={inputClass}
            />
          </Field>
          <Field label="Respondent 1">
            <input
              value={v.respondent1}
              onChange={(e) => set("respondent1", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Respondent 2">
            <input
              value={v.respondent2}
              onChange={(e) => set("respondent2", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Respondent 3">
            <input
              value={v.respondent3}
              onChange={(e) => set("respondent3", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Respondent 4">
            <input
              value={v.respondent4}
              onChange={(e) => set("respondent4", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionTitle>Appearance</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Issue date *">
            <input
              required
              type="date"
              value={v.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Day of summons *">
            <input
              required
              type="number"
              min={1}
              max={31}
              value={v.day_of_summons}
              onChange={(e) => set("day_of_summons", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Month of summons *">
            <select
              required
              value={v.month_of_summons}
              onChange={(e) => set("month_of_summons", e.target.value)}
              className={inputClass}
            >
              <option value="">Select month…</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Year of summons *">
            <input
              required
              type="number"
              value={v.year_of_summons}
              onChange={(e) => set("year_of_summons", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionTitle>Serving</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Serving day *">
            <input
              required
              type="number"
              min={1}
              max={31}
              value={v.serving_day}
              onChange={(e) => set("serving_day", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Serving month *">
            <select
              required
              value={v.serving_month}
              onChange={(e) => set("serving_month", e.target.value)}
              className={inputClass}
            >
              <option value="">Select month…</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Serving year *">
            <input
              required
              type="number"
              value={v.serving_year}
              onChange={(e) => set("serving_year", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionTitle>Officials</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prepared by *">
            <input
              required
              value={v.prepared_by}
              onChange={(e) => set("prepared_by", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Barangay secretary *">
            <input
              required
              value={v.barangay_secretary}
              onChange={(e) => set("barangay_secretary", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionTitle>Officer&apos;s Return (optional)</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dwelling — person served">
            <input
              value={v.dwelling_person_name}
              onChange={(e) => set("dwelling_person_name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Office — person served">
            <input
              value={v.office_person_name}
              onChange={(e) => set("office_person_name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Complainee 1">
            <input
              value={v.complainee1}
              onChange={(e) => set("complainee1", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Date 1">
            <input
              type="date"
              value={v.date1}
              onChange={(e) => set("date1", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Complainee 2">
            <input
              value={v.complainee2}
              onChange={(e) => set("complainee2", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Date 2">
            <input
              type="date"
              value={v.date2}
              onChange={(e) => set("date2", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Issue summons"}
        </button>
        <Link
          href="/summons"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
