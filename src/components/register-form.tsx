"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const initial = {
  name: "",
  gender: "Male",
  address: "",
  user: "",
  password: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof initial, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }
      toast.success("Account created — please sign in.");
      router.replace("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="gender" className="mb-1 block text-sm font-medium">
          Gender
        </label>
        <select
          id="gender"
          value={form.gender}
          onChange={(e) => update("gender", e.target.value)}
          className={inputClass}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">
          Address
        </label>
        <input
          id="address"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="user" className="mb-1 block text-sm font-medium">
          Username
        </label>
        <input
          id="user"
          value={form.user}
          onChange={(e) => update("user", e.target.value)}
          autoComplete="username"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
