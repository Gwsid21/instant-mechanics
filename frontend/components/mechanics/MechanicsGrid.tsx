import Link from "next/link";
import { Star, Wrench } from "lucide-react";
import { MechanicStatusBadge } from "@/components/ui/StatusBadge";
import type { Mechanic } from "@/lib/types";

export function MechanicsGrid({ mechanics }: { mechanics: Mechanic[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {mechanics.map((m) => (
        <Link
          key={m._id}
          href={`/mechanics/${m._id}`}
          className="rounded-lg border border-border bg-surface p-4 hover:border-text-faint transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-text-primary">{m.name}</div>
              <div className="text-xs text-text-faint mt-0.5">{m.city}</div>
            </div>
            <MechanicStatusBadge status={m.status} />
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
            {m.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded border border-border-soft bg-graphite-950/40 px-1.5 py-0.5 text-[10.5px] text-text-muted"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-soft text-xs">
            <div className="flex items-center gap-1 text-text-muted">
              <Wrench size={12} />
              {m.jobsCompleted} jobs
            </div>
            <div className="flex items-center gap-1 text-text-muted">
              <Star size={12} className="text-status-on-the-way" fill="currentColor" />
              {m.rating.toFixed(1)}
            </div>
          </div>

          {m.currentBookingId && (
            <div className="mt-2 font-[family-name:var(--font-data)] text-[11px] text-accent">
              On {m.currentBookingId.bookingCode}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
