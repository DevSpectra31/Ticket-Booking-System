const express = require('express');
const seatController = require('./seat.controller');
const authenticate = require('../../middleware/authMiddleware');
const authorise = require('../../middleware/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/events/{eventId}/seats/generate:
 *   post:
 *     tags: [Seats]
 *     summary: Generate seat map for an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Seats generated
 *
 * /api/events/{eventId}/seats:
 *   get:
 *     tags: [Seats]
 *     summary: Get all seats for an event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of seats
 *
 * /api/events/{eventId}/categories:
 *   get:
 *     tags: [Seat Categories]
 *     summary: Get seat categories for an event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     tags: [Seat Categories]
 *     summary: Create seat category for an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Category created
 */

// Seat routes
router.post('/events/:eventId/seats/generate', authenticate, authorise('ORGANISER', 'ADMIN'), seatController.generateSeats);
router.get('/events/:eventId/seats', seatController.getSeatsByEvent);

// Category routes
router.post('/events/:eventId/categories', authenticate, authorise('ORGANISER', 'ADMIN'), seatController.createCategory);
router.get('/events/:eventId/categories', seatController.getCategoriesByEvent);
router.put('/categories/:categoryId', authenticate, authorise('ORGANISER', 'ADMIN'), seatController.updateCategory);
router.delete('/categories/:categoryId', authenticate, authorise('ORGANISER', 'ADMIN'), seatController.deleteCategory);

module.exports = router;
