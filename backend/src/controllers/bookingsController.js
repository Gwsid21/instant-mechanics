const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const { BOOKING_STATUSES } = require('../models/Booking');
const {
  emitBookingUpdated,
  emitMechanicUpdated,
} = require('../sockets');

const SORTABLE_FIELDS = ['createdAt', 'scheduledAt', 'amount', 'status'];

// GET /api/bookings?search=&status=&category=&city=&sort=-createdAt&page=1&limit=20
async function listBookings(req, res, next) {
  try {
    const {
      search = '',
      status,
      category,
      city,
      dateFrom,
      dateTo,
      sort = '-createdAt',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status && BOOKING_STATUSES.includes(status)) query.status = status;
    if (category) query['service.category'] = category;
    if (city) query.city = city;
    if (dateFrom || dateTo) {
      query.scheduledAt = {};
      if (dateFrom) query.scheduledAt.$gte = new Date(dateFrom);
      if (dateTo) query.scheduledAt.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { 'vehicle.plate': { $regex: search, $options: 'i' } },
        { 'vehicle.make': { $regex: search, $options: 'i' } },
        { 'vehicle.model': { $regex: search, $options: 'i' } },
      ];
    }

    const sortField = sort.replace('-', '');
    const sortDir = sort.startsWith('-') ? -1 : 1;
    const sortObj = SORTABLE_FIELDS.includes(sortField)
      ? { [sortField]: sortDir }
      : { createdAt: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Booking.find(query)
        .populate('customer', 'name email phone city')
        .populate('mechanic', 'name status rating')
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/export.csv - same filters as listBookings, unpaginated
async function exportBookingsCsv(req, res, next) {
  try {
    const { search = '', status, category, city } = req.query;
    const query = {};
    if (status && BOOKING_STATUSES.includes(status)) query.status = status;
    if (category) query['service.category'] = category;
    if (city) query.city = city;
    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { 'vehicle.plate': { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Booking.find(query)
      .populate('customer', 'name')
      .populate('mechanic', 'name')
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const header = [
      'Booking ID',
      'Customer',
      'Vehicle',
      'Service',
      'Mechanic',
      'Status',
      'Amount',
      'Scheduled At',
    ];
    const rows = items.map((b) => [
      b.bookingCode,
      b.customer?.name || '',
      `${b.vehicle.make} ${b.vehicle.model} (${b.vehicle.plate})`,
      b.service.category,
      b.mechanic?.name || 'Unassigned',
      b.status,
      b.amount,
      new Date(b.scheduledAt).toISOString(),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="bookings-export.csv"'
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/:id
async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer')
      .populate('mechanic')
      .lean();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

const NEXT_STATUS = {
  pending: 'assigned',
  assigned: 'on_the_way',
  on_the_way: 'completed',
};

// PATCH /api/bookings/:id/status  { status?: "on_the_way" }
// If no status is given, advances the booking to the next stage in its
// lifecycle. This is what the live-update simulator (and a real ops
// dashboard action) calls to move a booking through its lifecycle.
async function advanceBookingStatus(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const requested = req.body?.status;
    const target = requested || NEXT_STATUS[booking.status];

    if (!target || !BOOKING_STATUSES.includes(target)) {
      return res.status(400).json({ error: 'Invalid or terminal status transition' });
    }

    booking.status = target;
    booking.statusHistory.push({ status: target, at: new Date() });
    if (target === 'completed') booking.completedAt = new Date();

    await booking.save();
    const populated = await booking.populate([
      { path: 'customer', select: 'name email phone city' },
      { path: 'mechanic', select: 'name status rating' },
    ]);

    emitBookingUpdated(populated.toObject());

    // Keep the mechanic's own status/jobsCompleted in sync with the booking.
    if (booking.mechanic) {
      const mechanic = await Mechanic.findById(booking.mechanic);
      if (mechanic) {
        if (target === 'completed') {
          mechanic.status = 'available';
          mechanic.jobsCompleted += 1;
          mechanic.currentBookingId = null;
        } else if (target === 'on_the_way') {
          mechanic.status = 'on_the_way';
        } else if (target === 'assigned') {
          mechanic.status = 'on_job';
        }
        await mechanic.save();
        emitMechanicUpdated(mechanic.toObject());
      }
    }

    res.json(populated.toObject());
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listBookings,
  getBooking,
  advanceBookingStatus,
  exportBookingsCsv,
};
