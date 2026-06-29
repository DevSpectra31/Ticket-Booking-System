const express = require('express');
const eventController = require('./event.controller');
const { createEventValidation, updateEventValidation, searchEventsValidation } = require('./event.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authMiddleware');
const authorise = require('../../middleware/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Browse all events with optional search/filter
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPCOMING, ACTIVE, SOLD_OUT, COMPLETED, CANCELLED]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of events
 *   post:
 *     tags: [Events]
 *     summary: Create a new event (Organiser/Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created
 */
router.get('/', searchEventsValidation, validate, eventController.getAllEvents);
router.get('/:eventId', eventController.getEventById);
router.post('/', authenticate, authorise('ORGANISER', 'ADMIN'), createEventValidation, validate, eventController.createEvent);
router.put('/:eventId', authenticate, authorise('ORGANISER', 'ADMIN'), updateEventValidation, validate, eventController.updateEvent);
router.delete('/:eventId', authenticate, authorise('ORGANISER', 'ADMIN'), eventController.deleteEvent);

module.exports = router;
