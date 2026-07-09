"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/lib/session";
import { LogoLockup, FlameDroplet } from "@/components/Logo";

type NavItem = { href: string; label: string; roles: Role[]; icon: string };

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["ADMIN", "USER", "CEO"],
    icon: "M4 5a1 1 0 011-1h5a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm9 0a1 1 0 011-1h5a1 1 0 011 1v3a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h5a1 1 0 011 1v6a1 1 0 01-1 1h-5a1 1 0 01-1-1v-6zm-9 3a1 1 0 011-1h5a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3z",
  },
  { href: "/entry", label: "Daily Entry", roles: ["ADMIN", "USER"], icon: "M12 4v16m8-8H4" },
  {
    href: "/calendar",
    label: "Calendar",
    roles: ["ADMIN", "USER", "CEO"],
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    href: "/reports",
    label: "Reports",
    roles: ["ADMIN", "USER", "CEO"],
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    href: "/admin/users",
    label: "Users",
    roles: ["ADMIN"],
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  USER: "Counter Staff",
  CEO: "CEO · read-only",
};

export function AppShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  // Rail by default; opens on hover (no manual toggle).
  const [open, setOpen] = useState(false);
  const collapsed = !open;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const items = NAV.filter((n) => n.roles.includes(user.role));
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background p-0 sm:p-3">
      {/* Sidebar */}
      {/* Sidebar: a rail that reserves 4.75rem and opens to 15rem on hover (overlays, no reflow) */}
      <aside className="relative hidden w-[4.75rem] shrink-0 sm:block">
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[width] duration-200 ${
            open ? "z-30 w-60 shadow-[var(--shadow-lg)]" : "w-[4.75rem] shadow-[var(--shadow-sm)]"
          }`}
        >
          <div className={`flex items-center py-5 ${collapsed ? "justify-center px-2" : "px-4"}`}>
            {collapsed ? <FlameDroplet className="h-9 w-9" /> : <LogoLockup />}
          </div>

          {!collapsed && (
            <span className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted/70">Menu</span>
          )}

          <nav className={`flex flex-1 flex-col gap-1 overflow-y-auto px-3 ${collapsed ? "pt-2" : ""}`}>
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-foreground"}`}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
                  <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="m-3 rounded-xl bg-gradient-to-br from-primary to-primary-dark p-4 text-primary-foreground">
              <p className="text-sm font-semibold">May 2026</p>
              <p className="mt-0.5 text-xs text-primary-foreground/80">Live operations ledger</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden sm:pl-3">
        {/* Top header */}
        <header className="flex shrink-0 items-center justify-between gap-3 rounded-none border-b border-border bg-surface px-4 py-2.5 sm:rounded-2xl sm:border sm:px-4 sm:shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 sm:hidden">
            <FlameDroplet className="h-8 w-8" />
            <span className="text-sm font-bold text-foreground">Kargil Gas</span>
          </div>

          <div className="hidden items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 sm:flex sm:w-80">
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              placeholder="Search suppliers, tie-ups, dates…"
              aria-label="Search"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:bg-surface-2"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 text-sm transition hover:bg-surface-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden font-semibold text-foreground sm:inline">{user.name}</span>
                <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-lg)]">
                    <div className="flex items-center gap-2.5 px-2.5 py-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {initials}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted">{ROLE_LABEL[user.role]}</p>
                      </div>
                    </div>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-danger hover:bg-danger-bg"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="mt-2 flex shrink-0 gap-1.5 overflow-x-auto px-1 pb-1 sm:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Scroll area */}
        <main className="scroll-slim mt-2 flex-1 overflow-y-auto px-1 pb-4 sm:mt-3 sm:px-1">{children}</main>
      </div>
    </div>
  );
}
