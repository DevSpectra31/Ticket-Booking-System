const seatService = require('./seat.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const generateSeats = asyncHandler(async (req, res) => {
  const seats = await seatService.generateSeats(req.params.eventId);
  ApiResponse.created(res, seats, `${seats.length} seats generated successfully`);
});

const getSeatsByEvent = asyncHandler(async (req, res) => {
  const seats = await seatService.getSeatsByEvent(req.params.eventId);
  ApiResponse.success(res, seats, 'Seats retrieved successfully');
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await seatService.createCategory(
    req.params.eventId,
    req.body,
    req.user._id,
    req.user.role
  );
  ApiResponse.created(res, category, 'Seat category created successfully');
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await seatService.updateCategory(req.params.categoryId, req.body);
  ApiResponse.success(res, category, 'Seat category updated successfully');
});

const deleteCategory = asyncHandler(async (req, res) => {
  await seatService.deleteCategory(req.params.categoryId);
  ApiResponse.success(res, null, 'Seat category deleted successfully');
});

const getCategoriesByEvent = asyncHandler(async (req, res) => {
  const categories = await seatService.getCategoriesByEvent(req.params.eventId);
  ApiResponse.success(res, categories, 'Seat categories retrieved successfully');
});

module.exports = { generateSeats, getSeatsByEvent, createCategory, updateCategory, deleteCategory, getCategoriesByEvent };
