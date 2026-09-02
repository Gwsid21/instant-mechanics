const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    joinedAt: { type: Date, required: true, default: Date.now },
    totalBookings: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', email: 'text' });
customerSchema.index({ joinedAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);
