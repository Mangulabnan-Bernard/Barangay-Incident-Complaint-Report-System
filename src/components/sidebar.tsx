"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  FolderOpen,
  FileText,
  Gavel,
  Scale,
  ScrollText,
  Landmark,
  Users,
  MapPin,
  UserCog,
  BarChart3,
  Archive,
  History,
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/session";
import { useNav } from "./nav-context";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Grouped navigation. Items render only for the current role; empty groups are
// hidden automatically.
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "RESIDENT"] },
    ],
  },
  {
    label: "Case Management",
    items: [
      { label: "File a Complaint", href: "/incidents/new", icon: FilePlus2, roles: ["RESIDENT"] },
      { label: "My Complaints", href: "/incidents/mine", icon: FolderOpen, roles: ["RESIDENT"] },
      { label: "Incidents", href: "/incidents", icon: FileText, roles: ["ADMIN"] },
      { label: "Hearings", href: "/hearings", icon: Gavel, roles: ["ADMIN", "STAFF"] },
      { label: "Cases", href: "/cases", icon: Scale, roles: ["ADMIN"] },
      { label: "Summons", href: "/summons", icon: ScrollText, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Directory",
    items: [
      { label: "Officials", href: "/officials", icon: Landmark, roles: ["ADMIN", "STAFF", "RESIDENT"] },
      { label: "Residents", href: "/residents", icon: Users, roles: ["ADMIN", "STAFF"] },
      { label: "Zone Leaders", href: "/zone", icon: MapPin, roles: ["ADMIN", "STAFF"] },
      { label: "User Accounts", href: "/users", icon: UserCog, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Insights & System",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "RESIDENT"] },
      { label: "Archived", href: "/archived", icon: Archive, roles: ["ADMIN"] },
      { label: "Activity Logs", href: "/logs", icon: History, roles: ["ADMIN"] },
    ],
  },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const { open, setOpen } = useNav();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  const toggle = (label: string) =>
    setCollapsed((c) => ({ ...c, [label]: !c[label] }));

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(role)),
  })).filter((g) => g.items.length > 0);

  const content = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
          BIS
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Barangay San Juan</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Information System
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((group) => {
          const isCollapsed = !!collapsed[group.label];
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggle(group.label)}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              >
                {group.label}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>

              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active
                              ? "text-white"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-600">
        Barangay v2
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex dark:border-slate-800 dark:bg-slate-900">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
