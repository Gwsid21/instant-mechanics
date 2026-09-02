const Mechanic = require('../models/Mechanic');
const Booking = require('../models/Booking');

// GET /api/mechanics?status=&search=&page=&limit=
async function listMechanics(req, res, next) {
  try {
    const { status, search = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Mechanic.find(query)
        .populate('currentBookingId', 'bookingCode status service.category')
        .sort({ jobsCompleted: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Mechanic.countDocuments(query),
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

// GET /api/mechanics/:id
async function getMechanic(req, res, next) {
  try {
    const mechanic = await Mechanic.findById(req.params.id)
      .populate('currentBookingId')
      .lean();
    if (!mechanic) return res.status(404).json({ error: 'Mechanic not found' });

    const recentJobs = await Booking.find({ mechanic: mechanic._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('bookingCode status service.category amount scheduledAt')
      .lean();

    res.json({ ...mechanic, recentJobs });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMechanics, getMechanic };
