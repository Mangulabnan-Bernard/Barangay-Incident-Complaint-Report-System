"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm({ demoMode = false }: { demoMode?: boolean }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function doLogin(id: string, pw: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id.trim(), password: pw.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      const dest =
        next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      // Full navigation (not router.push) so the freshly-set auth cookie is
      // sent on the request — a client-side push can bounce back to /login.
      window.location.assign(dest);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doLogin(identifier, password);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      {demoMode && (
        <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            For testing — one-click demo login
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => doLogin("admin@barangay.gov.ph", "admin123")}
              className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Demo Admin
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => doLogin("resident", "resident123")}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Demo Resident
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-emerald-600 hover:underline"
        >
          Register as a resident
        </Link>
      </p>
    </form>
  );
}
