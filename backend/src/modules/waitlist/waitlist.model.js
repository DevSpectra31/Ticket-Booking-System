const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     WaitlistEntry:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         event:
 *           type: string
 *         category:
 *           type: string
 *         customer:
 *           type: string
 *         status:
 *           type: string
 *           enum: [WAITING, OFFERED, BOOKED, EXPIRED, CANCELLED]
 *         offerExpiresAt:
 *           type: string
 *           format: date-time
 */
const waitlistSchema = new mongoose.Schema(
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
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['WAITING', 'OFFERED', 'BOOKED', 'EXPIRED', 'CANCELLED'],
      default: 'WAITING',
    },
    offeredHold: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SeatHold',
      default: null,
    },
    offerExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active waitlist entries for same user, event, and category
waitlistSchema.index(
  { event: 1, category: 1, customer: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['WAITING', 'OFFERED'] } },
  }
);
waitlistSchema.index({ status: 1, offerExpiresAt: 1 });
waitlistSchema.index({ event: 1, category: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model('WaitlistEntry', waitlistSchema);
