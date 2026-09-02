import type { BookingStatus, MechanicStatus } from "./types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function formatCompactNumber(n: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact" }).format(n);
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  on_the_way: "Mechanic On The Way",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_COLOR_VAR: Record<BookingStatus, string> = {
  pending: "var(--color-status-pending)",
  assigned: "var(--color-status-assigned)",
  on_the_way: "var(--color-status-on-the-way)",
  completed: "var(--color-status-completed)",
  cancelled: "var(--color-status-cancelled)",
};

export const MECHANIC_STATUS_LABEL: Record<MechanicStatus, string> = {
  available: "Available",
  on_job: "On Job",
  on_the_way: "On The Way",
  off_duty: "Off Duty",
};

export const MECHANIC_STATUS_COLOR_VAR: Record<MechanicStatus, string> = {
  available: "var(--color-status-completed)",
  on_job: "var(--color-status-assigned)",
  on_the_way: "var(--color-status-on-the-way)",
  off_duty: "var(--color-text-faint)",
};
