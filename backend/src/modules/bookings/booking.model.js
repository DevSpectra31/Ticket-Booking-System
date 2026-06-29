const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         bookingRef:
 *           type: string
 *         customer:
 *           type: string
 *         event:
 *           type: string
 *         seats:
 *           type: array
 *           items:
 *             type: string
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, EXPIRED]
 *         qrCode:
 *           type: string
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
      default: 'CONFIRMED',
    },
    qrCode: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ event: 1, status: 1 });


// Generate unique booking reference before validation
bookingSchema.pre('validate', function (next) {
  if (!this.bookingRef) {
    this.bookingRef = `BK-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
