"use client";

import { Search, Download } from "lucide-react";
import { SERVICE_CATEGORIES, BOOKING_STATUSES } from "@/lib/constants";
import { BOOKING_STATUS_LABEL } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

export function BookingsFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  onExport,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
      <div className="relative flex-1 min-w-0">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search booking ID, plate, make, model…"
          className="w-full rounded-md border border-border bg-graphite-950/40 py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-accent"
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border border-border bg-graphite-950/40 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
      >
        <option value="">All statuses</option>
        {BOOKING_STATUSES.map((s) => (
          <option key={s} value={s}>
            {BOOKING_STATUS_LABEL[s as BookingStatus]}
          </option>
        ))}
      </select>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-md border border-border bg-graphite-950/40 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
      >
        <option value="">All categories</option>
        {SERVICE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button
        onClick={onExport}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-graphite-950/40 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-surface-raised whitespace-nowrap"
      >
        <Download size={14} />
        Export CSV
      </button>
    </div>
  );
}
