"use client";

import { useEffect, useState, useCallback } from "react";
import { getDashboard } from "@/lib/api";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { ErrorState } from "@/components/ui/States";
import { BookingsOverTimeChart } from "@/components/charts/BookingsOverTimeChart";
import { RevenueOverTimeChart } from "@/components/charts/RevenueOverTimeChart";
import { StatusBreakdownChart } from "@/components/charts/StatusBreakdownChart";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { useLiveEvent } from "@/lib/live-context";
import type { DashboardResponse } from "@/lib/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getDashboard()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useLiveEvent("booking:created", load);
  useLiveEvent("booking:updated", load);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-text-primary">
          Analytics
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Trends and breakdowns across the last two weeks of activity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader title="Bookings over time" subtitle="Last 14 days" />
          <BookingsOverTimeChart data={data.analytics.bookingsOverTime} />
        </Panel>
        <Panel>
          <PanelHeader title="Revenue over time" subtitle="Completed bookings" />
          <RevenueOverTimeChart data={data.analytics.revenueOverTime} />
        </Panel>
        <Panel>
          <PanelHeader title="Booking status" subtitle="All-time distribution" />
          <StatusBreakdownChart data={data.analytics.statusBreakdown} />
        </Panel>
        <Panel>
          <PanelHeader title="Service category breakdown" subtitle="All-time volume" />
          <CategoryBreakdownChart data={data.analytics.categoryBreakdown} />
        </Panel>
      </div>
    </div>
  );
}
