const mongoose = require('mongoose');

// Lifecycle: pending -> assigned -> on_the_way -> completed
// Can also branch to: cancelled (from pending/assigned/on_the_way)
const BOOKING_STATUSES = [
  'pending',
  'assigned',
  'on_the_way',
  'completed',
  'cancelled',
];

const SERVICE_CATEGORIES = [
  'Oil Change',
  'Brake Repair',
  'Battery Replacement',
  'Tyre Replacement',
  'AC Service',
  'Engine Diagnostics',
  'General Checkup',
  'Denting & Painting',
  'Wheel Alignment',
  'Clutch & Gearbox',
];

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true }, // human-friendly ID e.g. IM-10231
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mechanic',
      default: null,
    },
    vehicle: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      plate: { type: String, required: true },
    },
    service: {
      category: { type: String, enum: SERVICE_CATEGORIES, required: true },
      notes: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending',
      index: true,
    },
    amount: { type: Number, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    completedAt: { type: Date, default: null },
    city: { type: String, required: true },
    statusHistory: [
      {
        status: { type: String, enum: BOOKING_STATUSES },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ scheduledAt: -1 });
bookingSchema.index({ 'vehicle.plate': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
module.exports.SERVICE_CATEGORIES = SERVICE_CATEGORIES;
