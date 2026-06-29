const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ticket_booking_db',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  seatHoldTtlMinutes: parseInt(process.env.SEAT_HOLD_TTL_MINUTES, 10) || 10,
  waitlistOfferTtlMinutes: parseInt(process.env.WAITLIST_OFFER_TTL_MINUTES, 10) || 10,
  email: {
    mode: process.env.EMAIL_MODE || 'mock',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.SMTP_FROM || 'no-reply@ticketbooking.local',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
