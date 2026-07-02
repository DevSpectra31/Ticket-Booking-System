const express = require('express');
const venueController = require('./venue.controller');
const authenticate = require('../../middleware/authMiddleware');
const authorise = require('../../middleware/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/venues:
 *   post:
 *     tags: [Venues]
 *     summary: Create a venue (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location]
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               rowsCount:
 *                 type: number
 *               seatsPerRow:
 *                 type: number
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     startRow:
 *                       type: string
 *                     endRow:
 *                       type: string
 *     responses:
 *       201:
 *         description: Venue created
 *   get:
 *     tags: [Venues]
 *     summary: Get all venues
 *     responses:
 *       200:
 *         description: List of venues
 *
 * /api/venues/{venueId}:
 *   get:
 *     tags: [Venues]
 *     summary: Get venue details
 *     parameters:
 *       - in: path
 *         name: venueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue details
 *   put:
 *     tags: [Venues]
 *     summary: Update a venue (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: venueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue updated
 *   delete:
 *     tags: [Venues]
 *     summary: Delete a venue (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: venueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue deleted
 */
router.post('/', authenticate, authorise('ADMIN'), venueController.createVenue);
router.get('/', authenticate, venueController.getAllVenues);
router.get('/:venueId', authenticate, venueController.getVenueById);
router.put('/:venueId', authenticate, authorise('ADMIN'), venueController.updateVenue);
router.delete('/:venueId', authenticate, authorise('ADMIN'), venueController.deleteVenue);

module.exports = router;
