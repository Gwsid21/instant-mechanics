const express = require('express');
const { listCustomers, getCustomer } = require('../controllers/customersController');

const router = express.Router();

/**
 * @openapi
 * /api/customers:
 *   get:
 *     summary: List customers with search and pagination
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of customers
 */
router.get('/', listCustomers);

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     summary: Get a single customer with recent bookings
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer detail
 *       404:
 *         description: Not found
 */
router.get('/:id', getCustomer);

module.exports = router;
