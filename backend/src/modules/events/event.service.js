const Event = require('./event.model');
const AppError = require('../../utils/appError');

const createEvent = async (eventData, userId) => {
  const event = await Event.create({ ...eventData, createdBy: userId });
  return event;
};

const updateEvent = async (eventId, updateData, userId, userRole) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  if (userRole !== 'ADMIN' && event.createdBy.toString() !== userId.toString()) {
    throw new AppError('You can only update your own events', 403);
  }

  Object.assign(event, updateData);
  await event.save();
  return event;
};

const deleteEvent = async (eventId, userId, userRole) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  if (userRole !== 'ADMIN' && event.createdBy.toString() !== userId.toString()) {
    throw new AppError('You can only delete your own events', 403);
  }

  event.status = 'CANCELLED';
  await event.save();
  return event;
};

const getAllEvents = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = { $ne: 'CANCELLED' };
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { venue: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    query.eventDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const events = await Event.find(query)
    .populate('createdBy', 'fullName email')
    .sort({ eventDate: 1 });
  return events;
};

const getEventById = async (eventId) => {
  const event = await Event.findById(eventId).populate('createdBy', 'fullName email');
  if (!event) throw new AppError('Event not found', 404);
  return event;
};

const getOrganiserEvents = async (userId) => {
  const events = await Event.find({ createdBy: userId }).sort({ createdAt: -1 });
  return events;
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getOrganiserEvents,
};
