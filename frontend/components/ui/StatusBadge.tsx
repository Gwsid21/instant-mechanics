import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_COLOR_VAR,
  MECHANIC_STATUS_LABEL,
  MECHANIC_STATUS_COLOR_VAR,
} from "@/lib/format";
import type { BookingStatus, MechanicStatus } from "@/lib/types";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const color = BOOKING_STATUS_COLOR_VAR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}

export function MechanicStatusBadge({ status }: { status: MechanicStatus }) {
  const color = MECHANIC_STATUS_COLOR_VAR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {MECHANIC_STATUS_LABEL[status]}
    </span>
  );
}
