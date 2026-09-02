const express = require('express');
const { listMechanics, getMechanic } = require('../controllers/mechanicsController');

const router = express.Router();

/**
 * @openapi
 * /api/mechanics:
 *   get:
 *     summary: List mechanics with status filter, search and pagination
 *     tags: [Mechanics]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, on_job, on_the_way, off_duty] }
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
 *         description: Paginated list of mechanics
 */
router.get('/', listMechanics);

/**
 * @openapi
 * /api/mechanics/{id}:
 *   get:
 *     summary: Get a single mechanic with their current booking and recent job history
 *     tags: [Mechanics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mechanic detail
 *       404:
 *         description: Not found
 */
router.get('/:id', getMechanic);

module.exports = router;
