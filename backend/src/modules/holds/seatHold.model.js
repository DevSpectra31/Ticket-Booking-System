const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     SeatHold:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         event:
 *           type: string
 *         user:
 *           type: string
 *         seats:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, EXPIRED, CONFIRMED]
 *         expiresAt:
 *           type: string
 *           format: date-time
 */
const seatHoldSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'CONFIRMED'],
      default: 'ACTIVE',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

seatHoldSchema.index({ status: 1, expiresAt: 1 });
seatHoldSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('SeatHold', seatHoldSchema);
