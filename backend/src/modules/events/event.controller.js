const eventService = require('./event.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user._id);
  ApiResponse.created(res, event, 'Event created successfully');
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.eventId, req.body, req.user._id, req.user.role);
  ApiResponse.success(res, event, 'Event updated successfully');
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await eventService.deleteEvent(req.params.eventId, req.user._id, req.user.role);
  ApiResponse.success(res, event, 'Event cancelled successfully');
});

const getAllEvents = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    search: req.query.search,
    date: req.query.date,
  };
  const events = await eventService.getAllEvents(filters);
  ApiResponse.success(res, events, 'Events retrieved successfully');
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.eventId);
  ApiResponse.success(res, event, 'Event retrieved successfully');
});

const getOrganiserEvents = asyncHandler(async (req, res) => {
  const events = await eventService.getOrganiserEvents(req.user._id);
  ApiResponse.success(res, events, 'Organiser events retrieved successfully');
});

module.exports = { createEvent, updateEvent, deleteEvent, getAllEvents, getEventById, getOrganiserEvents };
