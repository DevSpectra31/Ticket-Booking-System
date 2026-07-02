const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Event = require('../src/modules/events/event.model');
const SeatCategory = require('../src/modules/seats/seatCategory.model');
const Seat = require('../src/modules/seats/seat.model');
const SeatHold = require('../src/modules/holds/seatHold.model');
const Booking = require('../src/modules/bookings/booking.model');
const WaitlistEntry = require('../src/modules/waitlist/waitlist.model');
const connectDB = require('../src/config/db');

let customerToken;
let bookingCustomerToken;
let eventId;
let categoryId;
let seatIds;
let holdId;
let bookingId;

beforeAll(async () => {
  await connectDB();

  // Clean up existing test users
  await User.deleteMany({ email: { $regex: /test-waitlist/ } });

  // Create waitlist customer
  const customerRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Waitlist Customer',
    email: 'test-waitlist-customer@example.com',
    password: 'Password123',
    role: 'CUSTOMER',
  });
  customerToken = customerRes.body.data.token;

  // Create regular booking customer
  const bookerRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Waitlist Booker',
    email: 'test-waitlist-booker@example.com',
    password: 'Password123',
    role: 'CUSTOMER',
  });
  bookingCustomerToken = bookerRes.body.data.token;

  // Create test organiser
  const orgRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Waitlist Organiser',
    email: 'test-waitlist-organiser@example.com',
    password: 'Password123',
    role: 'ORGANISER',
  });
  const orgToken = orgRes.body.data.token;

  // Create event
  const eventRes = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${orgToken}`)
    .send({
      title: 'Test Waitlist Event',
      description: 'Test event for waitlist testing',
      venue: 'Test Venue',
      eventDate: '2026-12-01',
      eventTime: '20:00',
    });
  eventId = eventRes.body.data._id;

  // Create category with only 1 seat
  const catRes = await request(app)
    .post(`/api/events/${eventId}/categories`)
    .set('Authorization', `Bearer ${orgToken}`)
    .send({ name: 'Standard', price: 100, totalSeats: 1 });
  categoryId = catRes.body.data._id;

  // Generate seat
  await request(app)
    .post(`/api/events/${eventId}/seats/generate`)
    .set('Authorization', `Bearer ${orgToken}`);

  // Get seats
  const seatsRes = await request(app).get(`/api/events/${eventId}/seats`);
  seatIds = seatsRes.body.data.map((s) => s._id);

  // Booker holds the seat
  const holdRes = await request(app)
    .post('/api/seats/hold')
    .set('Authorization', `Bearer ${bookingCustomerToken}`)
    .send({ eventId, seatIds });
  holdId = holdRes.body.data.holdId;

  // Booker confirms the booking (so seat is fully booked)
  const bookingRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${bookingCustomerToken}`)
    .send({ holdId });
  bookingId = bookingRes.body.data._id;
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /test-waitlist/ } });
  if (eventId) {
    await Event.deleteMany({ _id: eventId });
    await SeatCategory.deleteMany({ event: eventId });
    await Seat.deleteMany({ event: eventId });
    await SeatHold.deleteMany({ event: eventId });
    await Booking.deleteMany({ event: eventId });
    await WaitlistEntry.deleteMany({ event: eventId });
  }
  await mongoose.connection.close();
});

describe('Waitlist API & Flow', () => {
  let waitlistId;

  describe('POST /api/waitlist', () => {
    it('should allow customer to join the waitlist', async () => {
      const res = await request(app)
        .post('/api/waitlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ eventId, categoryId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('WAITING');
      expect(res.body.data.customer).toBeDefined();
      waitlistId = res.body.data._id;
    });

    it('should reject joining the waitlist again', async () => {
      const res = await request(app)
        .post('/api/waitlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ eventId, categoryId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already on the waitlist');
    });
  });

  describe('GET /api/waitlist/my', () => {
    it('should return user waitlist entries', async () => {
      const res = await request(app)
        .get('/api/waitlist/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]._id).toBe(waitlistId);
    });
  });

  describe('Trigger Waitlist Processing via Booking Cancellation', () => {
    it('should offer waitlisted seat to the first customer when a booking is cancelled', async () => {
      // Cancel the booking
      const cancelRes = await request(app)
        .delete(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${bookingCustomerToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('CANCELLED');

      // Check the waitlist entry status - it should now be 'OFFERED'
      const myWaitlistRes = await request(app)
        .get('/api/waitlist/my')
        .set('Authorization', `Bearer ${customerToken}`);

      const entry = myWaitlistRes.body.data.find(e => e._id === waitlistId);
      expect(entry).toBeDefined();
      expect(entry.status).toBe('OFFERED');
      expect(entry.offeredHold).toBeDefined();
    });
  });

  describe('POST /api/waitlist/:waitlistId/accept', () => {
    it('should confirm booking when customer accepts the offer', async () => {
      const res = await request(app)
        .post(`/api/waitlist/${waitlistId}/accept`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.entry.status).toBe('BOOKED');
      expect(res.body.data.booking.status).toBe('CONFIRMED');
    });
  });

  describe('DELETE /api/waitlist/:waitlistId (Leave Waitlist)', () => {
    let secondWaitlistId;

    beforeAll(async () => {
      // Join waitlist again since the first one is booked
      // Need a category to join
      const res = await request(app)
        .post('/api/waitlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ eventId, categoryId });
      secondWaitlistId = res.body.data._id;
    });

    it('should allow leaving waitlist successfully', async () => {
      const res = await request(app)
        .delete(`/api/waitlist/${secondWaitlistId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });
  });
});
