"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { BookingStatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";

const COLUMNS: { key: string; label: string; sortable?: boolean }[] = [
  { key: "bookingCode", label: "Booking ID" },
  { key: "customer", label: "Customer" },
  { key: "vehicle", label: "Vehicle" },
  { key: "service", label: "Service" },
  { key: "mechanic", label: "Mechanic" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", sortable: true },
  { key: "scheduledAt", label: "Date / Time", sortable: true },
];

export function BookingsTable({
  bookings,
  sort,
  onSortChange,
  recentlyUpdatedIds,
}: {
  bookings: Booking[];
  sort: string;
  onSortChange: (field: string) => void;
  recentlyUpdatedIds: Set<string>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-graphite-950/40 text-left">
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-3.5 py-2.5 font-medium text-text-muted whitespace-nowrap">
                {col.sortable ? (
                  <button
                    className="flex items-center gap-1 hover:text-text-primary"
                    onClick={() => onSortChange(col.key)}
                  >
                    {col.label}
                    <ArrowUpDown
                      size={11}
                      className={
                        sort.replace("-", "") === col.key ? "text-accent" : "text-text-faint"
                      }
                    />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const customer = typeof b.customer === "object" ? b.customer : null;
            const mechanic = typeof b.mechanic === "object" ? b.mechanic : null;
            return (
              <tr
                key={b._id}
                className={`border-b border-border-soft last:border-b-0 hover:bg-surface-raised/60 ${
                  recentlyUpdatedIds.has(b._id) ? "row-flash" : ""
                }`}
              >
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <Link
                    href={`/bookings/${b._id}`}
                    className="font-[family-name:var(--font-data)] text-[12.5px] text-accent hover:underline"
                  >
                    {b.bookingCode}
                  </Link>
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap text-text-primary">
                  {customer?.name ?? "—"}
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap text-text-muted">
                  {b.vehicle.make} {b.vehicle.model}
                  <span className="ml-1.5 font-[family-name:var(--font-data)] text-[11px] text-text-faint">
                    {b.vehicle.plate}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap text-text-muted">
                  {b.service.category}
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap text-text-muted">
                  {mechanic?.name ?? "Unassigned"}
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap text-text-primary tabular-nums">
                  {formatCurrency(b.amount)}
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap text-text-muted tabular-nums">
                  {formatDateTime(b.scheduledAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tracks which booking ids have changed in the last few seconds so rows can
 * flash briefly to draw the eye to what just updated live.
 */
export function useRecentlyUpdated(ids: string[]) {
  const [recent, setRecent] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!ids.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    setRecent((prev) => new Set([...prev, ...ids]));
    const timer = setTimeout(() => {
      setRecent((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, 1600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  return recent;
}
