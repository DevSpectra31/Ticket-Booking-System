const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Event = require('../src/modules/events/event.model');
const SeatCategory = require('../src/modules/seats/seatCategory.model');
const Seat = require('../src/modules/seats/seat.model');
const SeatHold = require('../src/modules/holds/seatHold.model');
const Booking = require('../src/modules/bookings/booking.model');
const connectDB = require('../src/config/db');

let customerToken;
let eventId;
let holdId;

beforeAll(async () => {
  await connectDB();

  await User.deleteMany({ email: { $regex: /test-booking/ } });

  // Create test customer
  const registerRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Booking Customer',
    email: 'test-booking-customer@example.com',
    password: 'Password123',
    role: 'CUSTOMER',
  });
  customerToken = registerRes.body.data.token;

  // Create test organiser
  const orgRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Booking Organiser',
    email: 'test-booking-organiser@example.com',
    password: 'Password123',
    role: 'ORGANISER',
  });
  const orgToken = orgRes.body.data.token;

  // Create event
  const eventRes = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${orgToken}`)
    .send({
      title: 'Test Booking Event',
      description: 'Test event for booking testing',
      venue: 'Test Venue',
      eventDate: '2026-12-01',
      eventTime: '20:00',
    });
  eventId = eventRes.body.data._id;

  // Create category
  await request(app)
    .post(`/api/events/${eventId}/categories`)
    .set('Authorization', `Bearer ${orgToken}`)
    .send({ name: 'Standard', price: 200, totalSeats: 10 });

  // Generate seats
  await request(app)
    .post(`/api/events/${eventId}/seats/generate`)
    .set('Authorization', `Bearer ${orgToken}`);

  // Get seats and hold them
  const seatsRes = await request(app).get(`/api/events/${eventId}/seats`);
  const seatIds = seatsRes.body.data.slice(0, 2).map((s) => s._id);

  const holdRes = await request(app)
    .post('/api/seats/hold')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ eventId, seatIds });
  holdId = holdRes.body.data.holdId;
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /test-booking/ } });
  if (eventId) {
    await Event.deleteMany({ _id: eventId });
    await SeatCategory.deleteMany({ event: eventId });
    await Seat.deleteMany({ event: eventId });
    await SeatHold.deleteMany({ event: eventId });
    await Booking.deleteMany({ event: eventId });
  }
  await mongoose.connection.close();
});

describe('Booking API', () => {
  let bookingId;

  describe('POST /api/bookings', () => {
    it('should confirm booking from valid hold', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ holdId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingRef).toBeDefined();
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.qrCode).toBeDefined();
      bookingId = res.body.data._id;
    });

    it('should reject booking from already confirmed hold', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ holdId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/my', () => {
    it('should return user bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/bookings/:bookingId/cancel', () => {
    it('should cancel a confirmed booking', async () => {
      const res = await request(app)
        .delete(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should reject cancelling already cancelled booking', async () => {
      const res = await request(app)
        .delete(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400);
    });
  });
});
