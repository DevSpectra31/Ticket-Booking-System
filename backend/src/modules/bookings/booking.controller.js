const bookingService = require('./booking.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const confirmBooking = asyncHandler(async (req, res) => {
  const { holdId, promoCode } = req.body;
  const booking = await bookingService.confirmBooking(holdId, req.user._id, promoCode);
  ApiResponse.created(res, booking, 'Booking confirmed successfully');
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user._id);
  ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(
    req.params.bookingId,
    req.user._id,
    req.user.role
  );
  ApiResponse.success(res, booking, 'Booking retrieved successfully');
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.params.bookingId,
    req.user._id,
    req.user.role
  );
  ApiResponse.success(res, booking, 'Booking cancelled successfully');
});

module.exports = { confirmBooking, getMyBookings, getBookingById, cancelBooking };
