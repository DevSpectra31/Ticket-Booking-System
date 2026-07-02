const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Venue = require('../src/modules/venues/venue.model');
const connectDB = require('../src/config/db');

let adminToken;
let customerToken;
let venueId;

beforeAll(async () => {
  await connectDB();

  // Clean up existing test users
  await User.deleteMany({ email: { $regex: /test-venue/ } });

  // Create admin user (register as CUSTOMER first, then update role directly in DB)
  const adminRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Venue Admin',
    email: 'test-venue-admin@example.com',
    password: 'Password123',
    role: 'CUSTOMER',
  });
  await User.updateOne({ email: 'test-venue-admin@example.com' }, { role: 'ADMIN' });
  adminToken = adminRes.body.data.token;

  // Create customer user
  const customerRes = await request(app).post('/api/auth/register').send({
    fullName: 'Test Venue Customer',
    email: 'test-venue-customer@example.com',
    password: 'Password123',
    role: 'CUSTOMER',
  });
  customerToken = customerRes.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /test-venue/ } });
  if (venueId) {
    await Venue.deleteMany({ _id: venueId });
  }
  await mongoose.connection.close();
});

describe('Venue API (Admin Layout Templates)', () => {
  describe('POST /api/venues', () => {
    it('should prevent non-admin users from creating venues', async () => {
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Forbidden Theatre',
          location: 'Mumbai',
          rowsCount: 4,
          seatsPerRow: 10,
          categories: [
            { name: 'Standard', startRow: 'A', endRow: 'D' },
          ],
        });

      expect(res.status).toBe(403);
    });

    it('should allow admin users to create a venue template', async () => {
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Grand Opera Hall',
          location: 'Delhi',
          rowsCount: 5,
          seatsPerRow: 10,
          categories: [
            { name: 'Premium', startRow: 'A', endRow: 'B' },
            { name: 'Standard', startRow: 'C', endRow: 'E' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Grand Opera Hall');
      expect(res.body.data.rowsCount).toBe(5);
      venueId = res.body.data._id;
    });

    it('should reject creating a venue with duplicate name', async () => {
      const res = await request(app)
        .post('/api/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Grand Opera Hall',
          location: 'Mumbai',
          rowsCount: 3,
          seatsPerRow: 8,
          categories: [
            { name: 'Standard', startRow: 'A', endRow: 'C' },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('GET /api/venues', () => {
    it('should retrieve all venue templates', async () => {
      const res = await request(app)
        .get('/api/venues')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/venues/:venueId', () => {
    it('should retrieve specific venue template by ID', async () => {
      const res = await request(app)
        .get(`/api/venues/${venueId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Grand Opera Hall');
    });
  });

  describe('PUT /api/venues/:venueId', () => {
    it('should update venue details successfully', async () => {
      const res = await request(app)
        .put(`/api/venues/${venueId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Grand Opera Hall (Renovated)',
          location: 'Delhi NCR',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Grand Opera Hall (Renovated)');
      expect(res.body.data.location).toBe('Delhi NCR');
    });
  });

  describe('DELETE /api/venues/:venueId', () => {
    it('should delete venue successfully', async () => {
      const res = await request(app)
        .delete(`/api/venues/${venueId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it cannot be fetched anymore
      const checkRes = await request(app)
        .get(`/api/venues/${venueId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(checkRes.status).toBe(404);
    });
  });
});
