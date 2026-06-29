const nodemailer = require('nodemailer');
const env = require('../../config/env');

let transporter = null;

/**
 * Initialize email transporter based on EMAIL_MODE.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  if (env.email.mode === 'mock') {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.email.smtp.host,
    port: env.email.smtp.port,
    secure: env.email.smtp.port === 465,
    auth: {
      user: env.email.smtp.user,
      pass: env.email.smtp.pass,
    },
  });

  return transporter;
};

/**
 * Send email or log to console in mock mode.
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  if (env.email.mode === 'mock') {
    console.log('\n📧 ═══════════════ MOCK EMAIL ═══════════════');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body:    ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    if (attachments.length > 0) {
      console.log(`   Attachments: ${attachments.length} file(s)`);
    }
    console.log('═══════════════════════════════════════════\n');
    return { messageId: `mock-${Date.now()}` };
  }

  const transport = getTransporter();
  const info = await transport.sendMail({
    from: env.email.from,
    to,
    subject,
    html,
    attachments,
  });

  return info;
};

/**
 * Send booking confirmation email with QR code.
 */
const sendBookingConfirmation = async ({ to, bookingRef, eventTitle, seats, totalAmount, eventDate, eventTime, qrCode }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 12px;">
      <h1 style="color: #e94560; text-align: center;">🎟️ Booking Confirmed!</h1>
      <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${bookingRef}</p>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Time:</strong> ${eventTime}</p>
        <p><strong>Seats:</strong> ${seats}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      </div>
      ${qrCode ? `<div style="text-align: center; margin: 20px 0;"><img src="${qrCode}" alt="QR Code" style="width: 200px; height: 200px;" /></div>` : ''}
      <p style="text-align: center; color: #888; font-size: 12px;">Please present this QR code at the venue for entry.</p>
    </div>
  `;

  return sendEmail({ to, subject: `Booking Confirmed - ${bookingRef}`, html });
};

/**
 * Send booking cancellation email.
 */
const sendBookingCancellation = async ({ to, bookingRef, eventTitle }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 12px;">
      <h1 style="color: #e94560; text-align: center;">Booking Cancelled</h1>
      <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${bookingRef}</p>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p>Your booking has been cancelled successfully. If you were charged, a refund will be processed.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: `Booking Cancelled - ${bookingRef}`, html });
};

/**
 * Send waitlist offer email.
 */
const sendWaitlistOffer = async ({ to, eventTitle, categoryName, offerExpiresAt }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 12px;">
      <h1 style="color: #00d2ff; text-align: center;">🎉 Seat Available!</h1>
      <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>Great news! A <strong>${categoryName}</strong> seat has become available for <strong>${eventTitle}</strong>.</p>
        <p>A seat has been automatically held for you. Please log in and complete your booking before:</p>
        <p style="text-align: center; font-size: 18px; color: #e94560;"><strong>${new Date(offerExpiresAt).toLocaleString()}</strong></p>
      </div>
      <p style="text-align: center;"><a href="${env.frontendUrl}/waitlist" style="background: #e94560; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View My Waitlist</a></p>
    </div>
  `;

  return sendEmail({ to, subject: `Seat Available - ${eventTitle}`, html });
};

/**
 * Send waitlist offer expired email.
 */
const sendWaitlistOfferExpired = async ({ to, eventTitle }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 12px;">
      <h1 style="color: #e94560; text-align: center;">Offer Expired</h1>
      <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>Unfortunately, your waitlist offer for <strong>${eventTitle}</strong> has expired because the booking was not completed in time.</p>
        <p>You may rejoin the waitlist if seats become available again.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: `Waitlist Offer Expired - ${eventTitle}`, html });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendWaitlistOffer,
  sendWaitlistOfferExpired,
};
