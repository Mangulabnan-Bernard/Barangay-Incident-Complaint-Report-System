"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import type { Role } from "@/lib/session";
import { ThemeToggle } from "./theme-toggle";
import { useNav } from "./nav-context";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  STAFF: "Staff",
  RESIDENT: "Resident",
};

export function Header({ name, role }: { name: string; role: Role }) {
  const router = useRouter();
  const { setOpen } = useNav();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold md:hidden">Barangay San Juan</span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {ROLE_LABEL[role]}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {loggingOut ? "…" : "Sign out"}
        </button>
      </div>
    </header>
  );
}
