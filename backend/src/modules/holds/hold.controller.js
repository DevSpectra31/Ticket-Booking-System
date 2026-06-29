const holdService = require('./hold.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const holdSeats = asyncHandler(async (req, res) => {
  const { eventId, seatIds } = req.body;
  const result = await holdService.holdSeats(eventId, seatIds, req.user._id);
  ApiResponse.created(res, result, 'Seats held successfully');
});

const releaseHold = asyncHandler(async (req, res) => {
  const hold = await holdService.releaseHold(req.params.holdId, req.user._id);
  ApiResponse.success(res, hold, 'Hold released successfully');
});

const getHold = asyncHandler(async (req, res) => {
  const hold = await holdService.getHold(req.params.holdId);
  ApiResponse.success(res, hold, 'Hold retrieved successfully');
});

module.exports = { holdSeats, releaseHold, getHold };
