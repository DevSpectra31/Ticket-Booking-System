const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Seat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         event:
 *           type: string
 *         category:
 *           type: string
 *         row:
 *           type: string
 *         seatNumber:
 *           type: integer
 *         label:
 *           type: string
 *         status:
 *           type: string
 *           enum: [AVAILABLE, HELD, BOOKED, BLOCKED]
 */
const seatSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SeatCategory',
      required: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED'],
      default: 'AVAILABLE',
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique seat label per event
seatSchema.index({ event: 1, label: 1 }, { unique: true });
seatSchema.index({ event: 1, status: 1 });
seatSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model('Seat', seatSchema);
