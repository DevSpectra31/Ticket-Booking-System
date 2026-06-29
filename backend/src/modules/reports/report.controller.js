const reportService = require('./report.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getEventReport = asyncHandler(async (req, res) => {
  const report = await reportService.getEventReport(req.params.eventId);
  ApiResponse.success(res, report, 'Event report retrieved successfully');
});

const getOrganiserReport = asyncHandler(async (req, res) => {
  const report = await reportService.getOrganiserReport(req.user._id);
  ApiResponse.success(res, report, 'Organiser report retrieved successfully');
});

const getAdminReport = asyncHandler(async (req, res) => {
  const report = await reportService.getAdminReport();
  ApiResponse.success(res, report, 'Admin report retrieved successfully');
});

module.exports = { getEventReport, getOrganiserReport, getAdminReport };
