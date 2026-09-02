import type {
  Booking,
  Customer,
  DashboardResponse,
  Mechanic,
  Paginated,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `Request failed: ${res.status}`, res.status);
  }
  return res.json();
}

export function getDashboard() {
  return request<DashboardResponse>("/api/dashboard");
}

export interface BookingsQuery {
  search?: string;
  status?: string;
  category?: string;
  city?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

function toQueryString(params: object) {
  const qs = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function getBookings(query: BookingsQuery = {}) {
  return request<Paginated<Booking>>(`/api/bookings${toQueryString(query)}`);
}

export function getBooking(id: string) {
  return request<Booking & { customer: Customer; mechanic: Mechanic | null }>(
    `/api/bookings/${id}`
  );
}

export function advanceBookingStatus(id: string, status?: string) {
  return request<Booking>(`/api/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(status ? { status } : {}),
  });
}

export function exportBookingsCsvUrl(query: BookingsQuery = {}) {
  return `${API_BASE_URL}/api/bookings/export.csv${toQueryString(query)}`;
}

export interface MechanicsQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function getMechanics(query: MechanicsQuery = {}) {
  return request<Paginated<Mechanic>>(`/api/mechanics${toQueryString(query)}`);
}

export function getMechanic(id: string) {
  return request<Mechanic & { recentJobs: Booking[] }>(`/api/mechanics/${id}`);
}

export function getCustomers(query: { search?: string; page?: number; limit?: number } = {}) {
  return request<Paginated<Customer>>(`/api/customers${toQueryString(query)}`);
}

export { ApiError };
