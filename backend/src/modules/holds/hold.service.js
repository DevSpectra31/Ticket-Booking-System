const mongoose = require('mongoose');
const Seat = require('../seats/seat.model');
const SeatHold = require('./seatHold.model');
const SeatCategory = require('../seats/seatCategory.model');
const AppError = require('../../utils/appError');
const env = require('../../config/env');

/**
 * Hold seats using a MongoDB transaction to prevent race conditions.
 */
const holdSeats = async (eventId, seatIds, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Load all requested seats within the transaction
    const seats = await Seat.find({
      _id: { $in: seatIds },
      event: eventId,
    }).session(session);

    // Verify all seats exist
    if (seats.length !== seatIds.length) {
      throw new AppError('One or more seats not found for this event', 404);
    }

    // Check every seat is AVAILABLE
    const unavailableSeats = seats.filter((s) => s.status !== 'AVAILABLE');
    if (unavailableSeats.length > 0) {
      const labels = unavailableSeats.map((s) => s.label).join(', ');
      throw new AppError(`Seat already held or booked: ${labels}`, 409);
    }

    const expiresAt = new Date(Date.now() + env.seatHoldTtlMinutes * 60 * 1000);

    // Update all seats to HELD
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        status: 'HELD',
        heldBy: userId,
        holdExpiresAt: expiresAt,
      },
      { session }
    );

    // Decrement available seats in categories
    const categoryIds = [...new Set(seats.map((s) => s.category.toString()))];
    for (const catId of categoryIds) {
      const countInCategory = seats.filter((s) => s.category.toString() === catId).length;
      await SeatCategory.findByIdAndUpdate(
        catId,
        { $inc: { availableSeats: -countInCategory } },
        { session }
      );
    }

    // Create SeatHold document
    const [hold] = await SeatHold.create(
      [
        {
          event: eventId,
          user: userId,
          seats: seatIds,
          status: 'ACTIVE',
          expiresAt,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      holdId: hold._id,
      eventId: hold.event,
      seatIds: hold.seats,
      expiresAt: hold.expiresAt,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Release a hold and return seats to AVAILABLE.
 */
const releaseHold = async (holdId, userId) => {
  const hold = await SeatHold.findById(holdId);
  if (!hold) throw new AppError('Hold not found', 404);

  if (userId && hold.user.toString() !== userId.toString()) {
    throw new AppError('You can only release your own holds', 403);
  }

  if (hold.status !== 'ACTIVE') {
    throw new AppError('Hold is no longer active', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Release seats
    const seats = await Seat.find({ _id: { $in: hold.seats } }).session(session);

    await Seat.updateMany(
      { _id: { $in: hold.seats }, status: 'HELD' },
      {
        status: 'AVAILABLE',
        heldBy: null,
        holdExpiresAt: null,
      },
      { session }
    );

    // Increment available seats in categories
    const categoryIds = [...new Set(seats.map((s) => s.category.toString()))];
    for (const catId of categoryIds) {
      const countInCategory = seats.filter(
        (s) => s.category.toString() === catId && s.status === 'HELD'
      ).length;
      if (countInCategory > 0) {
        await SeatCategory.findByIdAndUpdate(
          catId,
          { $inc: { availableSeats: countInCategory } },
          { session }
        );
      }
    }

    hold.status = 'EXPIRED';
    await hold.save({ session });

    await session.commitTransaction();
    session.endSession();

    return hold;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getHold = async (holdId) => {
  const hold = await SeatHold.findById(holdId)
    .populate('seats', 'label row seatNumber status category')
    .populate('event', 'title eventDate eventTime');
  if (!hold) throw new AppError('Hold not found', 404);
  return hold;
};

module.exports = { holdSeats, releaseHold, getHold };
