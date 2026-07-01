const PDFDocument = require('pdfkit');

/**
 * Generate a PDF Ticket in memory.
 * @param {Object} bookingDetails - Booking details
 * @param {string} bookingDetails.bookingRef
 * @param {string} bookingDetails.eventTitle
 * @param {string} bookingDetails.seats
 * @param {number} bookingDetails.totalAmount
 * @param {string} bookingDetails.eventDate
 * @param {string} bookingDetails.eventTime
 * @param {string} bookingDetails.qrCode - Base64 encoded QR Code data URI
 * @returns {Promise<Buffer>} - Resolves to the PDF buffer
 */
const generateTicketPDF = ({ bookingRef, eventTitle, seats, totalAmount, eventDate, eventTime, qrCode }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [550, 380],
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Draw background
      doc.rect(0, 0, 550, 380).fill('#16213e');

      // Draw elegant header banner
      doc.rect(0, 0, 550, 70).fill('#1a1a2e');
      
      // Brand logo/text
      doc.fillColor('#e94560')
         .font('Helvetica-Bold')
         .fontSize(24)
         .text('ReserveX', 25, 22);

      doc.fillColor('#ffffff')
         .font('Helvetica')
         .fontSize(12)
         .text('E-TICKET VOUCHER', 400, 28, { align: 'right', width: 125 });

      // Add a thin vibrant line under header
      doc.rect(0, 70, 550, 4).fill('#e94560');

      // Ticket content positioning
      const startX = 30;
      const startY = 95;

      // Event Title
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(20)
         .text(eventTitle, startX, startY, { width: 350 });

      // Divider line
      doc.strokeColor('#2e3852')
         .lineWidth(1)
         .moveTo(startX, startY + 45)
         .lineTo(370, startY + 45)
         .stroke();

      // Info grid (using Helvetica and Helvetica-Bold)
      const gridY = startY + 60;
      const col1X = startX;
      const col2X = startX + 170;

      // Helper function to draw label-value pairs
      const drawInfo = (label, value, x, y) => {
        doc.fillColor('#888888')
           .font('Helvetica')
           .fontSize(10)
           .text(label.toUpperCase(), x, y);
        
        doc.fillColor('#ffffff')
           .font('Helvetica-Bold')
           .fontSize(12)
           .text(String(value), x, y + 14, { width: 155, height: 35 });
      };

      drawInfo('Booking Ref', bookingRef, col1X, gridY);
      drawInfo('Date & Time', `${eventDate} @ ${eventTime}`, col2X, gridY);

      drawInfo('Seats', seats, col1X, gridY + 55);
      drawInfo('Total Paid', `Rs. ${totalAmount}`, col2X, gridY + 55);

      // Support info
      doc.fillColor('#888888')
         .font('Helvetica')
         .fontSize(9)
         .text('Please present the QR code at the venue entrance. This voucher is valid for one-time entry.', startX, 325, { width: 340 });

      // Embed QR code on the right side
      if (qrCode && qrCode.startsWith('data:image/png;base64,')) {
        const qrBase64 = qrCode.split('base64,')[1];
        const qrBuffer = Buffer.from(qrBase64, 'base64');
        
        // Background card for QR code
        doc.rect(395, 95, 130, 155).fill('#1a1a2e');
        doc.image(qrBuffer, 405, 105, { width: 110, height: 110 });

        doc.fillColor('#ffffff')
           .font('Helvetica-Bold')
           .fontSize(9)
           .text('SCAN FOR ENTRY', 395, 227, { align: 'center', width: 130 });
      }

      // Add a ticket cutout design (decorative circles on the sides)
      doc.circle(0, 190, 12).fill('#1a1a2e');
      doc.circle(550, 190, 12).fill('#1a1a2e');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateTicketPDF };
