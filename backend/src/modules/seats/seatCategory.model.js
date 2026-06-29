const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     SeatCategory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         event:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         totalSeats:
 *           type: integer
 *         availableSeats:
 *           type: integer
 */
const seatCategorySchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: 1,
    },
    availableSeats: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

seatCategorySchema.index({ event: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SeatCategory', seatCategorySchema);
