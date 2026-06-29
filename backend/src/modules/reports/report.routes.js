const express = require('express');
const reportController = require('./report.controller');
const authenticate = require('../../middleware/authMiddleware');
const authorise = require('../../middleware/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/reports/events/{eventId}:
 *   get:
 *     tags: [Reports]
 *     summary: Get report for a specific event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event report
 *
 * /api/reports/organiser:
 *   get:
 *     tags: [Reports]
 *     summary: Get organiser summary report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organiser report
 *
 * /api/reports/admin:
 *   get:
 *     tags: [Reports]
 *     summary: Get admin system report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin report
 */
router.get('/events/:eventId', authenticate, authorise('ORGANISER', 'ADMIN'), reportController.getEventReport);
router.get('/organiser', authenticate, authorise('ORGANISER', 'ADMIN'), reportController.getOrganiserReport);
router.get('/admin', authenticate, authorise('ADMIN'), reportController.getAdminReport);

module.exports = router;
