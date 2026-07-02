const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         venue:
 *           type: string
 *         eventDate:
 *           type: string
 *           format: date
 *         eventTime:
 *           type: string
 *         posterUrl:
 *           type: string
 *         status:
 *           type: string
 *           enum: [UPCOMING, ACTIVE, SOLD_OUT, COMPLETED, CANCELLED]
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: 2000,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      maxlength: 300,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      default: null,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
    },
    posterUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ title: 'text', venue: 'text' });
eventSchema.index({ status: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Event', eventSchema);
