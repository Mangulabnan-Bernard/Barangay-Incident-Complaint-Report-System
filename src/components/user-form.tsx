"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export interface UserFormValues {
  admin_name: string;
  admin_email: string;
  password: string;
  role: string;
}

const EMPTY: UserFormValues = {
  admin_name: "",
  admin_email: "",
  password: "",
  role: "ADMIN",
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

export function UserForm({
  mode,
  userId,
  initial,
  cancelHref,
}: {
  mode: "create" | "edit";
  userId?: number;
  initial?: Partial<UserFormValues>;
  cancelHref: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<UserFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K],
  ) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/users" : `/api/users/${userId}`;
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
      toast.success(mode === "create" ? "User created" : "User updated");
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
              value={v.admin_name}
              onChange={(e) => set("admin_name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Email *">
            <input
              required
              type="email"
              value={v.admin_email}
              onChange={(e) => set("admin_email", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label={
              mode === "create"
                ? "Password *"
                : "Password (leave blank to keep current)"
            }
          >
            <input
              type="password"
              required={mode === "create"}
              value={v.password}
              onChange={(e) => set("password", e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Role">
            <select
              value={v.role}
              onChange={(e) => set("role", e.target.value)}
              className={inputClass}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
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
              ? "Create user"
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
