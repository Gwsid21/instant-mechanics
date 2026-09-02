"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  CalendarClock,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Wrench,
  UserPlus,
} from "lucide-react";
import { getDashboard } from "@/lib/api";
import { formatCurrency, formatCompactNumber } from "@/lib/format";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton, ErrorState } from "@/components/ui/States";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { BookingsOverTimeChart } from "@/components/charts/BookingsOverTimeChart";
import { RevenueOverTimeChart } from "@/components/charts/RevenueOverTimeChart";
import { useLiveEvent } from "@/lib/live-context";
import type { DashboardResponse } from "@/lib/types";

export default function OverviewPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getDashboard()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    load();
  }, [load]);

  // Any live booking event can shift the overview counters — refetch the
  // (cheap) aggregate rather than trying to patch nine derived numbers by hand.
  useLiveEvent("booking:created", load);
  useLiveEvent("booking:updated", load);

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const overview = data?.overview;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-text-primary">
          Overview
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Live snapshot of bookings, revenue and mechanic availability.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading || !overview ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Bookings"
              value={formatCompactNumber(overview.totalBookings)}
              icon={ClipboardList}
              accentVar="var(--color-accent)"
            />
            <StatCard
              label="Today's Bookings"
              value={formatCompactNumber(overview.todaysBookings)}
              icon={CalendarClock}
              accentVar="var(--color-accent)"
            />
            <StatCard
              label="Completed"
              value={formatCompactNumber(overview.completedBookings)}
              icon={CheckCircle2}
              accentVar="var(--color-status-completed)"
            />
            <StatCard
              label="Pending"
              value={formatCompactNumber(overview.pendingBookings)}
              icon={Clock}
              accentVar="var(--color-status-pending)"
            />
            <StatCard
              label="Cancelled"
              value={formatCompactNumber(overview.cancelledBookings)}
              icon={XCircle}
              accentVar="var(--color-status-cancelled)"
            />
            <StatCard
              label="Total Revenue"
              value={formatCurrency(overview.totalRevenue)}
              icon={Wallet}
              accentVar="var(--color-status-completed)"
            />
            <StatCard
              label="Active Mechanics"
              value={formatCompactNumber(overview.activeMechanics)}
              icon={Wrench}
              accentVar="var(--color-status-assigned)"
            />
            <StatCard
              label="New Customers"
              value={formatCompactNumber(overview.newCustomers)}
              icon={UserPlus}
              accentVar="var(--color-status-on-the-way)"
              hint="Last 30 days"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader title="Bookings over time" subtitle="Last 14 days" />
          {data ? (
            <BookingsOverTimeChart data={data.analytics.bookingsOverTime} />
          ) : (
            <div className="h-[260px]" />
          )}
        </Panel>
        <Panel>
          <PanelHeader title="Revenue over time" subtitle="Completed bookings, last 14 days" />
          {data ? (
            <RevenueOverTimeChart data={data.analytics.revenueOverTime} />
          ) : (
            <div className="h-[260px]" />
          )}
        </Panel>
      </div>
    </div>
  );
}
