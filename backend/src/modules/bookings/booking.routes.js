const express = require('express');
const bookingController = require('./booking.controller');
const authenticate = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Confirm booking from a valid hold
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [holdId]
 *             properties:
 *               holdId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking confirmed
 *
 * /api/bookings/my:
 *   get:
 *     tags: [Bookings]
 *     summary: Get current user's bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *
 * /api/bookings/{bookingId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *
 * /api/bookings/{bookingId}/cancel:
 *   delete:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.post('/', authenticate, bookingController.confirmBooking);
router.get('/my', authenticate, bookingController.getMyBookings);
router.get('/:bookingId', authenticate, bookingController.getBookingById);
router.delete('/:bookingId/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
