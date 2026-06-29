const QRCode = require('qrcode');

/**
 * Generate a QR code as base64 data URI containing booking details.
 */
const generateQRCode = async ({ bookingRef, eventTitle, customerEmail, seatLabels, eventDate, eventTime }) => {
  const qrData = JSON.stringify({
    bookingRef,
    event: eventTitle,
    email: customerEmail,
    seats: seatLabels,
    date: eventDate,
    time: eventTime,
  });

  const qrBase64 = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return qrBase64;
};

module.exports = { generateQRCode };
