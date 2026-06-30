const Booking = require('../bookings/booking.model');
const Seat = require('../seats/seat.model');
const SeatCategory = require('../seats/seatCategory.model');
const WaitlistEntry = require('../waitlist/waitlist.model');
const Event = require('../events/event.model');
const AppError = require('../../utils/appError');

/**
 * Get report for a specific event.
 */
const getEventReport = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const [
    totalBookings,
    cancelledBookings,
    totalSeats,
    bookedSeats,
    availableSeats,
    heldSeats,
    waitlistCount,
    categories,
  ] = await Promise.all([
    Booking.countDocuments({ event: eventId, status: 'CONFIRMED' }),
    Booking.countDocuments({ event: eventId, status: 'CANCELLED' }),
    Seat.countDocuments({ event: eventId }),
    Seat.countDocuments({ event: eventId, status: 'BOOKED' }),
    Seat.countDocuments({ event: eventId, status: 'AVAILABLE' }),
    Seat.countDocuments({ event: eventId, status: 'HELD' }),
    WaitlistEntry.countDocuments({ event: eventId, status: { $in: ['WAITING', 'OFFERED'] } }),
    SeatCategory.find({ event: eventId }),
  ]);

  // Calculate revenue
  const revenueResult = await Booking.aggregate([
    { $match: { event: event._id, status: 'CONFIRMED' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  return {
    event: {
      _id: event._id,
      title: event.title,
      venue: event.venue,
      eventDate: event.eventDate,
      status: event.status,
    },
    totalBookings,
    cancelledBookings,
    totalSeats,
    bookedSeats,
    availableSeats,
    heldSeats,
    waitlistCount,
    totalRevenue,
    categories: categories.map((c) => ({
      name: c.name,
      price: c.price,
      totalSeats: c.totalSeats,
      availableSeats: c.availableSeats,
    })),
  };
};

/**
 * Get organiser summary across all their events.
 */
const getOrganiserReport = async (userId) => {
  const events = await Event.find({ createdBy: userId });
  const eventIds = events.map((e) => e._id);

  const [totalBookings, cancelledBookings, totalSeats, bookedSeats, waitlistCount] =
    await Promise.all([
      Booking.countDocuments({ event: { $in: eventIds }, status: 'CONFIRMED' }),
      Booking.countDocuments({ event: { $in: eventIds }, status: 'CANCELLED' }),
      Seat.countDocuments({ event: { $in: eventIds } }),
      Seat.countDocuments({ event: { $in: eventIds }, status: 'BOOKED' }),
      WaitlistEntry.countDocuments({
        event: { $in: eventIds },
        status: { $in: ['WAITING', 'OFFERED'] },
      }),
    ]);

  const revenueResult = await Booking.aggregate([
    { $match: { event: { $in: eventIds }, status: 'CONFIRMED' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  return {
    totalEvents: events.length,
    totalBookings,
    cancelledBookings,
    totalSeats,
    bookedSeats,
    waitlistCount,
    totalRevenue,
    events: await Promise.all(
      events.map(async (e) => {
        const bookingsCount = await Booking.countDocuments({ event: e._id, status: 'CONFIRMED' });
        const revResult = await Booking.aggregate([
          { $match: { event: e._id, status: 'CONFIRMED' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const revenue = revResult.length > 0 ? revResult[0].total : 0;
        return {
          _id: e._id,
          title: e.title,
          status: e.status,
          eventDate: e.eventDate,
          bookingsCount,
          revenue,
        };
      })
    ),
  };
};

/**
 * Get admin-level system summary.
 */
const getAdminReport = async () => {
  const [totalEvents, totalBookings, cancelledBookings, totalSeats, bookedSeats, waitlistCount, events] =
    await Promise.all([
      Event.countDocuments(),
      Booking.countDocuments({ status: 'CONFIRMED' }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      Seat.countDocuments(),
      Seat.countDocuments({ status: 'BOOKED' }),
      WaitlistEntry.countDocuments({ status: { $in: ['WAITING', 'OFFERED'] } }),
      Event.find().limit(6), // fetch first 6 events for general dashboard charts
    ]);

  const revenueResult = await Booking.aggregate([
    { $match: { status: 'CONFIRMED' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  return {
    totalEvents,
    totalBookings,
    cancelledBookings,
    totalSeats,
    bookedSeats,
    waitlistCount,
    totalRevenue,
    events: await Promise.all(
      events.map(async (e) => {
        const bookingsCount = await Booking.countDocuments({ event: e._id, status: 'CONFIRMED' });
        const revResult = await Booking.aggregate([
          { $match: { event: e._id, status: 'CONFIRMED' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const revenue = revResult.length > 0 ? revResult[0].total : 0;
        return {
          _id: e._id,
          title: e.title,
          status: e.status,
          eventDate: e.eventDate,
          bookingsCount,
          revenue,
        };
      })
    ),
  };
};

module.exports = { getEventReport, getOrganiserReport, getAdminReport };
