const mongoose = require('mongoose');
const WaitlistEntry = require('./waitlist.model');
const Seat = require('../seats/seat.model');
const SeatCategory = require('../seats/seatCategory.model');
const SeatHold = require('../holds/seatHold.model');
const Event = require('../events/event.model');
const User = require('../users/user.model');
const emailService = require('../notifications/email.service');
const AppError = require('../../utils/appError');
const env = require('../../config/env');

/**
 * Join waitlist for a specific event and seat category.
 */
const joinWaitlist = async (eventId, categoryId, userId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const category = await SeatCategory.findById(categoryId);
  if (!category) throw new AppError('Seat category not found', 404);

  // Check for existing active waitlist entry
  const existing = await WaitlistEntry.findOne({
    event: eventId,
    category: categoryId,
    customer: userId,
    status: { $in: ['WAITING', 'OFFERED'] },
  });

  if (existing) {
    throw new AppError('You are already on the waitlist for this category', 400);
  }

  const entry = await WaitlistEntry.create({
    event: eventId,
    category: categoryId,
    customer: userId,
    status: 'WAITING',
  });

  return entry;
};

/**
 * Process waitlist: find available seat and offer to first waiting customer.
 */
const processWaitlist = async (eventId, categoryId) => {
  // Find first WAITING entry for this event+category
  const entry = await WaitlistEntry.findOne({
    event: eventId,
    category: categoryId,
    status: 'WAITING',
  })
    .sort({ createdAt: 1 })
    .populate('customer', 'email fullName');

  if (!entry) return null;

  // Find an available seat in this category
  const availableSeat = await Seat.findOne({
    event: eventId,
    category: categoryId,
    status: 'AVAILABLE',
  });

  if (!availableSeat) return null;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expiresAt = new Date(Date.now() + env.waitlistOfferTtlMinutes * 60 * 1000);

    // Hold the seat for the waitlisted customer
    await Seat.updateOne(
      { _id: availableSeat._id },
      {
        status: 'HELD',
        heldBy: entry.customer._id,
        holdExpiresAt: expiresAt,
      },
      { session }
    );

    // Decrement available seats
    await SeatCategory.findByIdAndUpdate(
      categoryId,
      { $inc: { availableSeats: -1 } },
      { session }
    );

    // Create a hold for the waitlisted customer
    const [hold] = await SeatHold.create(
      [
        {
          event: eventId,
          user: entry.customer._id,
          seats: [availableSeat._id],
          status: 'ACTIVE',
          expiresAt,
        },
      ],
      { session }
    );

    // Update waitlist entry
    entry.status = 'OFFERED';
    entry.offeredHold = hold._id;
    entry.offerExpiresAt = expiresAt;
    await entry.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send waitlist offer email (non-blocking)
    const event = await Event.findById(eventId);
    const category = await SeatCategory.findById(categoryId);
    emailService.sendWaitlistOffer({
      to: entry.customer.email,
      eventTitle: event.title,
      categoryName: category.name,
      offerExpiresAt: expiresAt,
    }).catch((err) => console.error('Waitlist email error:', err));

    return entry;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Accept a waitlist offer - create booking from the offered hold.
 */
const acceptOffer = async (waitlistId, userId) => {
  const entry = await WaitlistEntry.findById(waitlistId);
  if (!entry) throw new AppError('Waitlist entry not found', 404);

  if (entry.customer.toString() !== userId.toString()) {
    throw new AppError('You can only accept your own waitlist offers', 403);
  }

  if (entry.status !== 'OFFERED') {
    throw new AppError('No active offer for this waitlist entry', 400);
  }

  if (new Date() > entry.offerExpiresAt) {
    throw new AppError('Offer has expired', 400);
  }

  // Use the booking service to confirm the hold
  const bookingService = require('../bookings/booking.service');
  const booking = await bookingService.confirmBooking(entry.offeredHold, userId);

  // Update waitlist entry
  entry.status = 'BOOKED';
  await entry.save();

  return { entry, booking };
};

/**
 * Leave waitlist.
 */
const leaveWaitlist = async (waitlistId, userId) => {
  const entry = await WaitlistEntry.findById(waitlistId);
  if (!entry) throw new AppError('Waitlist entry not found', 404);

  if (entry.customer.toString() !== userId.toString()) {
    throw new AppError('You can only leave your own waitlist entries', 403);
  }

  if (!['WAITING', 'OFFERED'].includes(entry.status)) {
    throw new AppError('Cannot leave waitlist in current status', 400);
  }

  // If offered, release the hold
  if (entry.status === 'OFFERED' && entry.offeredHold) {
    const holdService = require('../holds/hold.service');
    await holdService.releaseHold(entry.offeredHold, null);
  }

  entry.status = 'CANCELLED';
  await entry.save();
  return entry;
};

/**
 * Get user's waitlist entries.
 */
const getMyWaitlist = async (userId) => {
  const entries = await WaitlistEntry.find({ customer: userId })
    .populate('event', 'title venue eventDate eventTime posterUrl')
    .populate('category', 'name price')
    .populate('offeredHold', 'seats expiresAt status')
    .sort({ createdAt: -1 });
  return entries;
};

module.exports = { joinWaitlist, processWaitlist, acceptOffer, leaveWaitlist, getMyWaitlist };
