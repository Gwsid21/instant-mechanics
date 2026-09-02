"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Wrench, MapPin } from "lucide-react";
import { getMechanic } from "@/lib/api";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { MechanicStatusBadge } from "@/components/ui/StatusBadge";
import { BookingStatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useLiveEvent } from "@/lib/live-context";
import type { Booking, Mechanic } from "@/lib/types";

type MechanicDetail = Mechanic & { recentJobs: Booking[] };

export default function MechanicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [mechanic, setMechanic] = useState<MechanicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getMechanic(id)
      .then((res) => {
        setMechanic(res);
        setError(null);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useLiveEvent<Mechanic>("mechanic:updated", (updated) => {
    if (updated._id === id) load();
  });

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!mechanic) return null;

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary w-fit"
      >
        <ArrowLeft size={14} />
        Back to mechanics
      </button>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-text-primary">
            {mechanic.name}
          </h1>
          <p className="flex items-center gap-1 text-sm text-text-muted mt-0.5">
            <MapPin size={13} />
            {mechanic.city}
          </p>
        </div>
        <MechanicStatusBadge status={mechanic.status} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Panel className="text-center">
          <div className="text-xs text-text-muted mb-1">Jobs completed</div>
          <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">
            {mechanic.jobsCompleted}
          </div>
        </Panel>
        <Panel className="text-center">
          <div className="text-xs text-text-muted mb-1">Rating</div>
          <div className="flex items-center justify-center gap-1 font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">
            <Star size={15} className="text-status-on-the-way" fill="currentColor" />
            {mechanic.rating.toFixed(1)}
          </div>
        </Panel>
        <Panel className="text-center">
          <div className="text-xs text-text-muted mb-1">Specialties</div>
          <div className="text-sm text-text-primary">{mechanic.specialties.join(", ")}</div>
        </Panel>
      </div>

      {mechanic.currentBookingId && (
        <Panel>
          <PanelHeader title="Current booking" />
          <Link
            href={`/bookings/${mechanic.currentBookingId._id}`}
            className="flex items-center gap-2.5 text-sm text-accent hover:underline"
          >
            <Wrench size={14} />
            {mechanic.currentBookingId.bookingCode}
          </Link>
        </Panel>
      )}

      <Panel>
        <PanelHeader title="Recent jobs" />
        {mechanic.recentJobs.length === 0 ? (
          <EmptyState title="No job history yet" />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {mechanic.recentJobs.map((j) => (
              <li key={j._id} className="flex items-center justify-between gap-3 text-sm">
                <Link
                  href={`/bookings/${j._id}`}
                  className="font-[family-name:var(--font-data)] text-xs text-accent hover:underline"
                >
                  {j.bookingCode}
                </Link>
                <span className="text-text-muted flex-1">{j.service.category}</span>
                <BookingStatusBadge status={j.status} />
                <span className="text-text-primary tabular-nums w-20 text-right">
                  {formatCurrency(j.amount)}
                </span>
                <span className="text-text-faint text-xs tabular-nums hidden sm:block">
                  {formatDateTime(j.scheduledAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
