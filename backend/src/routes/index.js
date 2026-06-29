const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const eventRoutes = require('../modules/events/event.routes');
const seatRoutes = require('../modules/seats/seat.routes');
const holdRoutes = require('../modules/holds/hold.routes');
const bookingRoutes = require('../modules/bookings/booking.routes');
const waitlistRoutes = require('../modules/waitlist/waitlist.routes');
const reportRoutes = require('../modules/reports/report.routes');
const authenticate = require('../middleware/authMiddleware');
const authorise = require('../middleware/roleMiddleware');
const eventController = require('../modules/events/event.controller');

const router = express.Router();

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Event routes
router.use('/events', eventRoutes);

// Organiser event routes
router.get('/organiser/events', authenticate, authorise('ORGANISER', 'ADMIN'), eventController.getOrganiserEvents);

// Seat & category routes (mounted at /api level, routes include /events/:eventId prefix)
router.use('/', seatRoutes);

// Hold routes
router.use('/seats', holdRoutes);

// Booking routes
router.use('/bookings', bookingRoutes);

// Waitlist routes
router.use('/waitlist', waitlistRoutes);

// Report routes
router.use('/reports', reportRoutes);

module.exports = router;
