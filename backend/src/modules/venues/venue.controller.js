const venueService = require('./venue.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const createVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.createVenue(req.body);
  ApiResponse.created(res, venue, 'Venue created successfully');
});

const updateVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.updateVenue(req.params.venueId, req.body);
  ApiResponse.success(res, venue, 'Venue updated successfully');
});

const deleteVenue = asyncHandler(async (req, res) => {
  await venueService.deleteVenue(req.params.venueId);
  ApiResponse.success(res, null, 'Venue deleted successfully');
});

const getAllVenues = asyncHandler(async (req, res) => {
  const venues = await venueService.getAllVenues();
  ApiResponse.success(res, venues, 'Venues retrieved successfully');
});

const getVenueById = asyncHandler(async (req, res) => {
  const venue = await venueService.getVenueById(req.params.venueId);
  ApiResponse.success(res, venue, 'Venue retrieved successfully');
});

module.exports = {
  createVenue,
  updateVenue,
  deleteVenue,
  getAllVenues,
  getVenueById,
};
