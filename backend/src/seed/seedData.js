const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
require('../config/env');

const User = require('../modules/users/user.model');
const Event = require('../modules/events/event.model');
const SeatCategory = require('../modules/seats/seatCategory.model');
const Seat = require('../modules/seats/seat.model');

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      SeatCategory.deleteMany({}),
      Seat.deleteMany({}),
    ]);
    console.log('   Cleared existing data');

    // Seed Users
    const users = await User.create([
      {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'ADMIN',
      },
      {
        fullName: 'Event Organiser',
        email: 'organiser@example.com',
        password: 'organiser123',
        role: 'ORGANISER',
      },
      {
        fullName: 'John Customer',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'CUSTOMER',
      },
    ]);
    console.log('   ✅ Created 3 users');

    const organiser = users[1];

    // Seed Events
    const events = await Event.create([
      {
        title: 'Avengers: Secret Wars',
        description: 'The ultimate Marvel crossover event. Earth\'s mightiest heroes face their greatest challenge yet in this epic conclusion to the Multiverse Saga.',
        venue: 'IMAX Cinema Hall, Mumbai',
        eventDate: new Date('2026-08-15'),
        eventTime: '19:00',
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500',
        status: 'ACTIVE',
        createdBy: organiser._id,
      },
      {
        title: 'Coldplay: Music of the Spheres World Tour',
        description: 'Coldplay brings their spectacular Music of the Spheres World Tour to India. Experience an unforgettable night of music, lights, and magic.',
        venue: 'DY Patil Stadium, Navi Mumbai',
        eventDate: new Date('2026-09-20'),
        eventTime: '18:30',
        posterUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500',
        status: 'UPCOMING',
        createdBy: organiser._id,
      },
      {
        title: 'Stand-Up Comedy Night with Zakir Khan',
        description: 'An evening of laughter with India\'s favorite comedian. Get ready for an unforgettable night of comedy, stories, and fun.',
        venue: 'Siri Fort Auditorium, Delhi',
        eventDate: new Date('2026-07-25'),
        eventTime: '20:00',
        posterUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=500',
        status: 'ACTIVE',
        createdBy: organiser._id,
      },
    ]);
    console.log('   ✅ Created 3 events');

    // Seed Seat Categories & Generate Seats for each event
    const categoryConfigs = [
      [
        { name: 'Premium', price: 500, totalSeats: 20 },
        { name: 'Gold', price: 350, totalSeats: 30 },
        { name: 'Silver', price: 200, totalSeats: 40 },
      ],
      [
        { name: 'VIP', price: 15000, totalSeats: 20 },
        { name: 'Gold', price: 8000, totalSeats: 30 },
        { name: 'Silver', price: 4000, totalSeats: 50 },
        { name: 'Standard', price: 2000, totalSeats: 50 },
      ],
      [
        { name: 'Front Row', price: 2000, totalSeats: 10 },
        { name: 'Standard', price: 800, totalSeats: 40 },
      ],
    ];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const configs = categoryConfigs[i];
      const categories = [];

      for (const config of configs) {
        const category = await SeatCategory.create({
          event: event._id,
          name: config.name,
          price: config.price,
          totalSeats: config.totalSeats,
          availableSeats: config.totalSeats,
        });
        categories.push(category);
      }

      // Generate seats
      const seats = [];
      let rowIndex = 0;
      const seatsPerRow = 10;

      for (const category of categories) {
        const totalRows = Math.ceil(category.totalSeats / seatsPerRow);
        let seatsCreated = 0;

        for (let r = 0; r < totalRows; r++) {
          const rowLabel = String.fromCharCode(65 + rowIndex);
          const seatsInRow = Math.min(seatsPerRow, category.totalSeats - seatsCreated);

          for (let s = 1; s <= seatsInRow; s++) {
            seats.push({
              event: event._id,
              category: category._id,
              row: rowLabel,
              seatNumber: s,
              label: `${rowLabel}${s}`,
              status: 'AVAILABLE',
            });
            seatsCreated++;
          }
          rowIndex++;
        }
      }

      await Seat.insertMany(seats);
      console.log(`   ✅ Created ${categories.length} categories & ${seats.length} seats for "${event.title}"`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   Admin:     admin@example.com     / admin123');
    console.log('   Organiser: organiser@example.com / organiser123');
    console.log('   Customer:  customer@example.com  / customer123\n');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

// Executed directly
if (require.main === module) {
  (async () => {
    await connectDB();
    try {
      await runSeed();
      process.exit(0);
    } catch {
      process.exit(1);
    }
  })();
}

module.exports = { runSeed };
