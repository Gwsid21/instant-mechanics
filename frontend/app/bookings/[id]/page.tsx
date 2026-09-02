"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Car, User, Wrench, Calendar, IndianRupee } from "lucide-react";
import { getBooking } from "@/lib/api";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { BookingStatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/States";
import { formatCurrency, formatDateTime, BOOKING_STATUS_LABEL } from "@/lib/format";
import { useLiveEvent } from "@/lib/live-context";
import type { Booking, Customer, Mechanic } from "@/lib/types";

type BookingDetail = Booking & { customer: Customer; mechanic: Mechanic | null };

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getBooking(id)
      .then((res) => {
        setBooking(res);
        setError(null);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useLiveEvent<Booking>("booking:updated", (updated) => {
    if (updated._id === id) load();
  });

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!booking) return null;

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary w-fit"
      >
        <ArrowLeft size={14} />
        Back to bookings
      </button>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-text-primary font-[family-name:var(--font-data)]">
            {booking.bookingCode}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Scheduled for {formatDateTime(booking.scheduledAt)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader title="Customer" />
          <div className="flex items-start gap-2.5">
            <User size={16} className="text-text-faint mt-0.5" />
            <div>
              <div className="text-sm text-text-primary">{booking.customer?.name}</div>
              <div className="text-xs text-text-muted">{booking.customer?.email}</div>
              <div className="text-xs text-text-muted">{booking.customer?.phone}</div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Mechanic" />
          {booking.mechanic ? (
            <div className="flex items-start gap-2.5">
              <Wrench size={16} className="text-text-faint mt-0.5" />
              <div>
                <div className="text-sm text-text-primary">{booking.mechanic.name}</div>
                <div className="text-xs text-text-muted">
                  Rating {booking.mechanic.rating?.toFixed(1)} · {booking.mechanic.jobsCompleted} jobs
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Not yet assigned</p>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Vehicle" />
          <div className="flex items-start gap-2.5">
            <Car size={16} className="text-text-faint mt-0.5" />
            <div>
              <div className="text-sm text-text-primary">
                {booking.vehicle.make} {booking.vehicle.model}
              </div>
              <div className="font-[family-name:var(--font-data)] text-xs text-text-muted">
                {booking.vehicle.plate}
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Service & amount" />
          <div className="flex items-start gap-2.5 mb-2">
            <Wrench size={16} className="text-text-faint mt-0.5" />
            <div className="text-sm text-text-primary">{booking.service.category}</div>
          </div>
          <div className="flex items-start gap-2.5">
            <IndianRupee size={16} className="text-text-faint mt-0.5" />
            <div className="text-sm text-text-primary tabular-nums">
              {formatCurrency(booking.amount)}
            </div>
          </div>
          {booking.service.notes && (
            <p className="text-xs text-text-muted mt-2 pl-6">{booking.service.notes}</p>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Status timeline" />
        <ol className="flex flex-col gap-3">
          {booking.statusHistory?.map((h, i) => (
            <li key={i} className="flex items-center gap-3">
              <Calendar size={14} className="text-text-faint" />
              <span className="text-sm text-text-primary">
                {BOOKING_STATUS_LABEL[h.status]}
              </span>
              <span className="text-xs text-text-faint ml-auto tabular-nums">
                {formatDateTime(h.at)}
              </span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
