export const BOOKING_STATUSES = [
  "pending",
  "assigned",
  "on_the_way",
  "completed",
  "cancelled",
] as const;

export const SERVICE_CATEGORIES = [
  "Oil Change",
  "Brake Repair",
  "Battery Replacement",
  "Tyre Replacement",
  "AC Service",
  "Engine Diagnostics",
  "General Checkup",
  "Denting & Painting",
  "Wheel Alignment",
  "Clutch & Gearbox",
];

export const MECHANIC_STATUSES = [
  "available",
  "on_job",
  "on_the_way",
  "off_duty",
] as const;
