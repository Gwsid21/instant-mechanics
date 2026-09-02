const express = require('express');
const {
  listBookings,
  getBooking,
  advanceBookingStatus,
  exportBookingsCsv,
} = require('../controllers/bookingsController');

const router = express.Router();

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     summary: List bookings with search, filter, sort and pagination
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches booking code, plate, make or model
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, assigned, on_the_way, completed, cancelled] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "-createdAt" }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of bookings
 */
router.get('/', listBookings);

/**
 * @openapi
 * /api/bookings/export.csv:
 *   get:
 *     summary: Export filtered bookings as CSV
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get('/export.csv', exportBookingsCsv);

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a single booking with customer and mechanic populated
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking detail
 *       404:
 *         description: Not found
 */
router.get('/:id', getBooking);

/**
 * @openapi
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Advance (or set) a booking's status; emits a booking:updated websocket event
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [assigned, on_the_way, completed, cancelled]
 *     responses:
 *       200:
 *         description: Updated booking
 *       400:
 *         description: Invalid transition
 *       404:
 *         description: Not found
 */
router.patch('/:id/status', advanceBookingStatus);

module.exports = router;
