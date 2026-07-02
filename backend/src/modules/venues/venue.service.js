const Venue = require('./venue.model');
const Event = require('../events/event.model');
const AppError = require('../../utils/appError');

const createVenue = async (venueData) => {
  // Check if name already exists
  const existing = await Venue.findOne({ name: venueData.name });
  if (existing) {
    throw new AppError('Venue with this name already exists', 400);
  }

  const venue = await Venue.create(venueData);
  return venue;
};

const updateVenue = async (venueId, updateData) => {
  const venue = await Venue.findById(venueId);
  if (!venue) throw new AppError('Venue not found', 404);

  // If name is changing, check uniqueness
  if (updateData.name && updateData.name !== venue.name) {
    const existing = await Venue.findOne({ name: updateData.name });
    if (existing) {
      throw new AppError('Venue with this name already exists', 400);
    }
  }

  Object.assign(venue, updateData);
  await venue.save();
  return venue;
};

const deleteVenue = async (venueId) => {
  const venue = await Venue.findById(venueId);
  if (!venue) throw new AppError('Venue not found', 404);

  // Check if any event is currently using this venue
  const eventCount = await Event.countDocuments({ venueId: venueId });
  if (eventCount > 0) {
    throw new AppError('Cannot delete venue as it is linked to existing events', 400);
  }

  await Venue.findByIdAndDelete(venueId);
  return venue;
};

const getAllVenues = async () => {
  const venues = await Venue.find().sort({ name: 1 });
  return venues;
};

const getVenueById = async (venueId) => {
  const venue = await Venue.findById(venueId);
  if (!venue) throw new AppError('Venue not found', 404);
  return venue;
};

module.exports = {
  createVenue,
  updateVenue,
  deleteVenue,
  getAllVenues,
  getVenueById,
};
