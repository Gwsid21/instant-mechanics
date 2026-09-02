const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// GET /api/customers?search=&page=&limit=
async function listCustomers(req, res, next) {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Customer.find(query)
        .sort({ joinedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Customer.countDocuments(query),
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

// GET /api/customers/:id
async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const bookings = await Booking.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('bookingCode status service.category amount scheduledAt')
      .lean();

    res.json({ ...customer, bookings });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCustomers, getCustomer };
