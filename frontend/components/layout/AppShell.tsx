"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  ClipboardList,
  Wrench,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useLive } from "@/lib/live-context";
import { ThemeToggle } from "./ThemeToggle";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/mechanics", label: "Mechanics", icon: Wrench },
  { href: "/customers", label: "Customers", icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { connected } = useLive();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-graphite-950/40 px-3 py-5">
        <div className="px-3 pb-6">
          <div className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-tight text-text-primary">
            Instant Mechanic
          </div>
          <div className="text-xs text-text-faint mt-0.5">Operations Console</div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] transition-colors",
                  active
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-muted hover:bg-surface hover:text-text-primary"
                )}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pt-6 text-xs text-text-faint">
          Live Ops Dashboard v1.0
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3">
          <div className="md:hidden font-[family-name:var(--font-display)] font-semibold text-text-primary">
            Instant Mechanic
          </div>
          <div className="hidden md:block text-sm text-text-muted">
            Vehicle Service Operations
          </div>
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                connected
                  ? "border-[color-mix(in_srgb,var(--color-status-completed)_40%,transparent)] text-status-completed"
                  : "border-border text-text-faint"
              )}
            >
              {connected ? (
                <>
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-status-completed" />
                  <span>Live</span>
                  <Wifi size={12} />
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-text-faint" />
                  <span>Connecting…</span>
                  <WifiOff size={12} />
                </>
              )}
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 py-5 min-w-0">{children}</main>

        <nav className="md:hidden flex items-center justify-around border-t border-border bg-graphite-950/60 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                  active ? "text-text-primary" : "text-text-faint"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
