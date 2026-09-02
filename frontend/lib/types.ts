export type BookingStatus =
  | "pending"
  | "assigned"
  | "on_the_way"
  | "completed"
  | "cancelled";

export type MechanicStatus = "available" | "on_job" | "on_the_way" | "off_duty";

export interface CustomerRef {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
}

export interface MechanicRef {
  _id: string;
  name: string;
  status?: MechanicStatus;
  rating?: number;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  customer: CustomerRef | string;
  mechanic: MechanicRef | string | null;
  vehicle: { make: string; model: string; plate: string };
  service: { category: string; notes?: string };
  status: BookingStatus;
  amount: number;
  scheduledAt: string;
  completedAt: string | null;
  city: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: BookingStatus; at: string }[];
}

export interface Mechanic {
  _id: string;
  name: string;
  avatarSeed: string;
  specialties: string[];
  status: MechanicStatus;
  rating: number;
  jobsCompleted: number;
  city: string;
  joinedAt: string;
  currentBookingId: { _id: string; bookingCode: string; status: BookingStatus } | null;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedAt: string;
  totalBookings: number;
  totalSpend: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardOverview {
  totalBookings: number;
  todaysBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  activeMechanics: number;
  newCustomers: number;
}

export interface DashboardAnalytics {
  bookingsOverTime: { date: string; count: number }[];
  revenueOverTime: { date: string; total: number }[];
  statusBreakdown: { status: BookingStatus; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

export interface DashboardResponse {
  overview: DashboardOverview;
  analytics: DashboardAnalytics;
}
