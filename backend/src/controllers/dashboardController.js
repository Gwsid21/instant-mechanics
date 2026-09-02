const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const Customer = require('../models/Customer');

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// GET /api/dashboard
// Aggregated overview + analytics payload consumed by the Overview and
// Analytics pages in a single round trip.
async function getDashboard(req, res, next) {
  try {
    const today = startOfDay();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalBookings,
      todaysBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      revenueAgg,
      activeMechanics,
      newCustomers,
      bookingsOverTime,
      revenueOverTime,
      statusBreakdown,
      categoryBreakdown,
    ] = await Promise.all([
      Booking.countDocuments({}),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Mechanic.countDocuments({ status: { $ne: 'off_duty' } }),
      Customer.countDocuments({ joinedAt: { $gte: thirtyDaysAgo } }),

      // Bookings created per day, last 14 days
      Booking.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Revenue per day (completed bookings only), last 14 days
      Booking.aggregate([
        {
          $match: {
            status: 'completed',
            completedAt: { $gte: fourteenDaysAgo, $ne: null },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Booking.aggregate([
        { $group: { _id: '$service.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      overview: {
        totalBookings,
        todaysBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue: revenueAgg[0]?.total || 0,
        activeMechanics,
        newCustomers,
      },
      analytics: {
        bookingsOverTime: bookingsOverTime.map((d) => ({
          date: d._id,
          count: d.count,
        })),
        revenueOverTime: revenueOverTime.map((d) => ({
          date: d._id,
          total: d.total,
        })),
        statusBreakdown: statusBreakdown.map((d) => ({
          status: d._id,
          count: d.count,
        })),
        categoryBreakdown: categoryBreakdown.map((d) => ({
          category: d._id,
          count: d.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
