const Seat = require('./seat.model');
const SeatCategory = require('./seatCategory.model');
const Event = require('../events/event.model');
const AppError = require('../../utils/appError');

/**
 * Generate seats for all categories of an event.
 * Creates a grid layout: each category gets rows starting from a letter.
 */
const generateSeats = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  // Check if seats already exist
  const existingSeats = await Seat.countDocuments({ event: eventId });
  if (existingSeats > 0) {
    throw new AppError('Seats already generated for this event', 400);
  }

  const categories = await SeatCategory.find({ event: eventId }).sort({ price: -1 });
  if (categories.length === 0) {
    throw new AppError('No seat categories found. Create categories first.', 400);
  }

  const seats = [];
  let rowIndex = 0;
  const seatsPerRow = 10;

  for (const category of categories) {
    const totalRows = Math.ceil(category.totalSeats / seatsPerRow);
    let seatsCreated = 0;

    for (let r = 0; r < totalRows; r++) {
      const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C, ...
      const seatsInThisRow = Math.min(seatsPerRow, category.totalSeats - seatsCreated);

      for (let s = 1; s <= seatsInThisRow; s++) {
        seats.push({
          event: eventId,
          category: category._id,
          row: rowLabel,
          seatNumber: s,
          label: `${rowLabel}${s}`,
          status: 'AVAILABLE',
        });
        seatsCreated++;
      }
      rowIndex++;
    }

    // Update available seats count
    category.availableSeats = category.totalSeats;
    await category.save();
  }

  const createdSeats = await Seat.insertMany(seats);
  return createdSeats;
};

const getSeatsByEvent = async (eventId) => {
  const seats = await Seat.find({ event: eventId })
    .populate('category', 'name price')
    .sort({ row: 1, seatNumber: 1 });
  return seats;
};

// Seat Category CRUD
const createCategory = async (eventId, categoryData, userId, userRole) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  if (userRole !== 'ADMIN' && event.createdBy.toString() !== userId.toString()) {
    throw new AppError('You can only manage categories for your own events', 403);
  }

  const category = await SeatCategory.create({ ...categoryData, event: eventId });
  return category;
};

const updateCategory = async (categoryId, updateData) => {
  const category = await SeatCategory.findByIdAndUpdate(categoryId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const deleteCategory = async (categoryId) => {
  const category = await SeatCategory.findById(categoryId);
  if (!category) throw new AppError('Category not found', 404);

  // Check if seats exist for this category
  const seatCount = await Seat.countDocuments({ category: categoryId });
  if (seatCount > 0) {
    throw new AppError('Cannot delete category with existing seats', 400);
  }

  await SeatCategory.findByIdAndDelete(categoryId);
  return category;
};

const getCategoriesByEvent = async (eventId) => {
  const categories = await SeatCategory.find({ event: eventId }).sort({ price: -1 });
  return categories;
};

module.exports = {
  generateSeats,
  getSeatsByEvent,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByEvent,
};
