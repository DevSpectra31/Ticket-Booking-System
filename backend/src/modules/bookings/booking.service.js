const mongoose = require('mongoose');
const Booking = require('./booking.model');
const SeatHold = require('../holds/seatHold.model');
const Seat = require('../seats/seat.model');
const SeatCategory = require('../seats/seatCategory.model');
const Event = require('../events/event.model');
const User = require('../users/user.model');
const { generateQRCode } = require('../notifications/qr.service');
const emailService = require('../notifications/email.service');
const AppError = require('../../utils/appError');

/**
 * Confirm a booking from a valid active hold.
 */
const confirmBooking = async (holdId, userId) => {
  const hold = await SeatHold.findById(holdId).populate('seats');
  if (!hold) throw new AppError('Hold not found', 404);

  if (hold.user.toString() !== userId.toString()) {
    throw new AppError('You can only confirm your own holds', 403);
  }

  if (hold.status !== 'ACTIVE') {
    throw new AppError('Hold is no longer active', 400);
  }

  if (new Date() > hold.expiresAt) {
    throw new AppError('Hold has expired. Please select seats again.', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Calculate total amount
    const seats = await Seat.find({ _id: { $in: hold.seats } })
      .populate('category', 'price name')
      .session(session);

    const totalAmount = seats.reduce((sum, seat) => sum + (seat.category?.price || 0), 0);

    // Get event and user for QR/email
    const event = await Event.findById(hold.event).session(session);
    const user = await User.findById(userId).session(session);

    // Mark seats as BOOKED
    const seatLabels = seats.map((s) => s.label).join(', ');

    // Generate QR code
    const qrCode = await generateQRCode({
      bookingRef: '', // Will be set after booking creation
      eventTitle: event.title,
      customerEmail: user.email,
      seatLabels,
      eventDate: event.eventDate.toISOString().split('T')[0],
      eventTime: event.eventTime,
    });

    // Create booking
    const [booking] = await Booking.create(
      [
        {
          customer: userId,
          event: hold.event,
          seats: hold.seats.map((s) => s._id || s),
          totalAmount,
          status: 'CONFIRMED',
          qrCode,
        },
      ],
      { session }
    );

    // Update QR code with actual booking ref
    const updatedQr = await generateQRCode({
      bookingRef: booking.bookingRef,
      eventTitle: event.title,
      customerEmail: user.email,
      seatLabels,
      eventDate: event.eventDate.toISOString().split('T')[0],
      eventTime: event.eventTime,
    });
    booking.qrCode = updatedQr;
    await booking.save({ session });

    // Update seats to BOOKED with booking reference
    await Seat.updateMany(
      { _id: { $in: hold.seats.map((s) => s._id || s) } },
      {
        status: 'BOOKED',
        booking: booking._id,
        heldBy: null,
        holdExpiresAt: null,
      },
      { session }
    );

    // Mark hold as CONFIRMED
    hold.status = 'CONFIRMED';
    await hold.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send confirmation email (non-blocking)
    emailService.sendBookingConfirmation({
      to: user.email,
      bookingRef: booking.bookingRef,
      eventTitle: event.title,
      seats: seatLabels,
      totalAmount,
      eventDate: event.eventDate.toISOString().split('T')[0],
      eventTime: event.eventTime,
      qrCode: updatedQr,
    }).catch((err) => console.error('Email send error:', err));

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cancel a booking and release seats.
 */
const cancelBooking = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId).populate('event', 'title');
  if (!booking) throw new AppError('Booking not found', 404);

  if (
    userRole !== 'ADMIN' &&
    userRole !== 'ORGANISER' &&
    booking.customer.toString() !== userId.toString()
  ) {
    throw new AppError('You can only cancel your own bookings', 403);
  }

  if (booking.status !== 'CONFIRMED') {
    throw new AppError('Only confirmed bookings can be cancelled', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Release seats
    const seats = await Seat.find({ _id: { $in: booking.seats } }).session(session);

    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        status: 'AVAILABLE',
        booking: null,
        heldBy: null,
        holdExpiresAt: null,
      },
      { session }
    );

    // Increment available seats in categories
    const categoryIds = [...new Set(seats.map((s) => s.category.toString()))];
    for (const catId of categoryIds) {
      const countInCategory = seats.filter((s) => s.category.toString() === catId).length;
      await SeatCategory.findByIdAndUpdate(
        catId,
        { $inc: { availableSeats: countInCategory } },
        { session }
      );
    }

    // Update booking status
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send cancellation email (non-blocking)
    const user = await User.findById(booking.customer);
    if (user) {
      emailService.sendBookingCancellation({
        to: user.email,
        bookingRef: booking.bookingRef,
        eventTitle: booking.event.title,
      }).catch((err) => console.error('Email send error:', err));
    }

    // Trigger waitlist processing (lazy import to avoid circular dependency)
    try {
      const waitlistService = require('../waitlist/waitlist.service');
      for (const catId of categoryIds) {
        await waitlistService.processWaitlist(booking.event._id || booking.event, catId);
      }
    } catch (err) {
      console.error('Waitlist processing error:', err.message);
    }

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyBookings = async (userId) => {
  const bookings = await Booking.find({ customer: userId })
    .populate('event', 'title venue eventDate eventTime posterUrl')
    .populate('seats', 'label row seatNumber category')
    .sort({ createdAt: -1 });
  return bookings;
};

const getBookingById = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId)
    .populate('event', 'title venue eventDate eventTime posterUrl description')
    .populate('seats', 'label row seatNumber category')
    .populate('customer', 'fullName email');

  if (!booking) throw new AppError('Booking not found', 404);

  if (
    userRole !== 'ADMIN' &&
    userRole !== 'ORGANISER' &&
    booking.customer._id.toString() !== userId.toString()
  ) {
    throw new AppError('You can only view your own bookings', 403);
  }

  return booking;
};

module.exports = { confirmBooking, cancelBooking, getMyBookings, getBookingById };
