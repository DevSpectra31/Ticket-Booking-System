const express = require('express');
const waitlistController = require('./waitlist.controller');
const authenticate = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/waitlist:
 *   post:
 *     tags: [Waitlist]
 *     summary: Join waitlist for an event category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, categoryId]
 *             properties:
 *               eventId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Joined waitlist
 *
 * /api/waitlist/my:
 *   get:
 *     tags: [Waitlist]
 *     summary: Get current user's waitlist entries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Waitlist entries
 *
 * /api/waitlist/{waitlistId}:
 *   delete:
 *     tags: [Waitlist]
 *     summary: Leave waitlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: waitlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left waitlist
 *
 * /api/waitlist/{waitlistId}/accept:
 *   post:
 *     tags: [Waitlist]
 *     summary: Accept a waitlist offer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: waitlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer accepted
 */
router.post('/', authenticate, waitlistController.joinWaitlist);
router.get('/my', authenticate, waitlistController.getMyWaitlist);
router.delete('/:waitlistId', authenticate, waitlistController.leaveWaitlist);
router.post('/:waitlistId/accept', authenticate, waitlistController.acceptOffer);

module.exports = router;
