const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Get aggregated overview stats and analytics chart data
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Overview counters plus time-series/breakdown data for charts
 */
router.get('/', getDashboard);

module.exports = router;
