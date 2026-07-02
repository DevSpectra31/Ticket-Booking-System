const mongoose = require('mongoose');

const venueCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  startRow: {
    type: String,
    required: [true, 'Start row is required'],
    trim: true,
    uppercase: true,
  },
  endRow: {
    type: String,
    required: [true, 'End row is required'],
    trim: true,
    uppercase: true,
  },
});

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Venue location is required'],
      trim: true,
    },
    rowsCount: {
      type: Number,
      required: [true, 'Number of rows is required'],
      min: 1,
      default: 5,
    },
    seatsPerRow: {
      type: Number,
      required: [true, 'Seats per row is required'],
      min: 1,
      default: 10,
    },
    categories: [venueCategorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Venue', venueSchema);
