const waitlistService = require('./waitlist.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const joinWaitlist = asyncHandler(async (req, res) => {
  const { eventId, categoryId } = req.body;
  const entry = await waitlistService.joinWaitlist(eventId, categoryId, req.user._id);
  ApiResponse.created(res, entry, 'Joined waitlist successfully');
});

const getMyWaitlist = asyncHandler(async (req, res) => {
  const entries = await waitlistService.getMyWaitlist(req.user._id);
  ApiResponse.success(res, entries, 'Waitlist entries retrieved successfully');
});

const leaveWaitlist = asyncHandler(async (req, res) => {
  const entry = await waitlistService.leaveWaitlist(req.params.waitlistId, req.user._id);
  ApiResponse.success(res, entry, 'Left waitlist successfully');
});

const acceptOffer = asyncHandler(async (req, res) => {
  const result = await waitlistService.acceptOffer(req.params.waitlistId, req.user._id);
  ApiResponse.success(res, result, 'Waitlist offer accepted and booking confirmed');
});

module.exports = { joinWaitlist, getMyWaitlist, leaveWaitlist, acceptOffer };
