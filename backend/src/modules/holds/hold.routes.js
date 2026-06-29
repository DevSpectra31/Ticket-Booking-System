const express = require('express');
const holdController = require('./hold.controller');
const authenticate = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/seats/hold:
 *   post:
 *     tags: [Seat Holds]
 *     summary: Hold selected seats temporarily
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, seatIds]
 *             properties:
 *               eventId:
 *                 type: string
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Seats held
 *       409:
 *         description: Seat already held or booked
 *
 * /api/seats/hold/{holdId}:
 *   get:
 *     tags: [Seat Holds]
 *     summary: Get hold details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: holdId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hold details
 *   delete:
 *     tags: [Seat Holds]
 *     summary: Release a hold
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: holdId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hold released
 */
router.post('/hold', authenticate, holdController.holdSeats);
router.get('/hold/:holdId', authenticate, holdController.getHold);
router.delete('/hold/:holdId', authenticate, holdController.releaseHold);

module.exports = router;
