const mongoose = require('mongoose');

const MECHANIC_STATUSES = ['available', 'on_job', 'on_the_way', 'off_duty'];

const mechanicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    avatarSeed: { type: String, required: true },
    specialties: { type: [String], default: [] },
    status: {
      type: String,
      enum: MECHANIC_STATUSES,
      default: 'available',
    },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    jobsCompleted: { type: Number, default: 0 },
    city: { type: String, required: true },
    joinedAt: { type: Date, required: true, default: Date.now },
    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

mechanicSchema.index({ status: 1 });

module.exports = mongoose.model('Mechanic', mechanicSchema);
module.exports.MECHANIC_STATUSES = MECHANIC_STATUSES;
