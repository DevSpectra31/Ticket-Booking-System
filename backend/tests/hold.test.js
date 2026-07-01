const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Event = require('../src/modules/events/event.model');
const SeatCategory = require('../src/modules/seats/seatCategory.model');
const Seat = require('../src/modules/seats/seat.model');
const SeatHold = require('../src/modules/holds/seatHold.model');
const connectDB = require('../src/config/db');

let customerToken;
let eventId;
let seatIds;

beforeAll(async () => {
  await connectDB();

  // Clean up
  await User.deleteMany({ email: { $regex: /test-hold/ } });

  // Create test customer
  const registerRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Hold Customer',
    email: 'test-hold-customer@example.com',
    password: 'Password123',
    role: 'CUSTOMER',
  });
  customerToken = registerRes.body.data.token;

  // Create test organiser
  const orgRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Hold Organiser',
    email: 'test-hold-organiser@example.com',
    password: 'Password123',
    role: 'ORGANISER',
  });
  const orgToken = orgRes.body.data.token;

  // Create event
  const eventRes = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${orgToken}`)
    .send({
      title: 'Test Hold Event',
      description: 'Test event for hold testing',
      venue: 'Test Venue',
      eventDate: '2026-12-01',
      eventTime: '20:00',
    });
  eventId = eventRes.body.data._id;

  // Create category
  await request(app)
    .post(`/api/events/${eventId}/categories`)
    .set('Authorization', `Bearer ${orgToken}`)
    .send({ name: 'Standard', price: 100, totalSeats: 10 });

  // Generate seats
  await request(app)
    .post(`/api/events/${eventId}/seats/generate`)
    .set('Authorization', `Bearer ${orgToken}`);

  // Get seats
  const seatsRes = await request(app).get(`/api/events/${eventId}/seats`);
  seatIds = seatsRes.body.data.slice(0, 2).map((s) => s._id);
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /test-hold/ } });
  if (eventId) {
    await Event.deleteMany({ _id: eventId });
    await SeatCategory.deleteMany({ event: eventId });
    await Seat.deleteMany({ event: eventId });
    await SeatHold.deleteMany({ event: eventId });
  }
  await mongoose.connection.close();
});

describe('Seat Hold API', () => {
  describe('POST /api/seats/hold', () => {
    it('should hold seats successfully', async () => {
      const res = await request(app)
        .post('/api/seats/hold')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ eventId, seatIds });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.holdId).toBeDefined();
      expect(res.body.data.seatIds).toHaveLength(2);
      expect(res.body.data.expiresAt).toBeDefined();
    });

    it('should reject hold when seats already held', async () => {
      const res = await request(app)
        .post('/api/seats/hold')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ eventId, seatIds });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already held or booked');
    });

    it('should reject hold without authentication', async () => {
      const res = await request(app)
        .post('/api/seats/hold')
        .send({ eventId, seatIds });

      expect(res.status).toBe(401);
    });
  });
});
