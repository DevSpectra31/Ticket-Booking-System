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

    // Drop collections to clear legacy/obsolete indexes
    await Promise.all([
      User.collection.drop().catch(() => {}),
      Event.collection.drop().catch(() => {}),
      SeatCategory.collection.drop().catch(() => {}),
      Seat.collection.drop().catch(() => {}),
    ]);
    console.log('   Cleared existing data and legacy indexes');

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

    // ──────────────────────────────────────────────
    //  25 Diverse Events
    // ──────────────────────────────────────────────
    const eventsData = [
      // ── 🎬 Movies (1–3) ──
      {
        title: 'Avengers: Secret Wars',
        description: 'The ultimate Marvel crossover event. Earth\'s mightiest heroes face their greatest challenge yet in this epic conclusion to the Multiverse Saga. Witness the most ambitious superhero film ever made.',
        venue: 'IMAX Cinema Hall, Mumbai',
        eventDate: new Date('2026-08-15'),
        eventTime: '19:00',
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'Pushpa 3: The Rampage',
        description: 'Pushpa Raj returns in the most awaited sequel. After conquering the syndicate, he faces a new enemy who threatens everything he has built. Action, drama, and raw intensity await.',
        venue: 'Prasads IMAX, Hyderabad',
        eventDate: new Date('2026-12-20'),
        eventTime: '18:00',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'Dune: Part Three',
        description: 'The final chapter of the epic Dune saga. Paul Atreides faces the ultimate reckoning as the fate of the known universe hangs in the balance. A cinematic masterpiece concludes.',
        venue: 'PVR Director\'s Cut, Delhi',
        eventDate: new Date('2027-02-14'),
        eventTime: '20:00',
        posterUrl: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=500',
        status: 'UPCOMING',
      },

      // ── 🎵 Concerts (4–6) ──
      {
        title: 'Coldplay: Music of the Spheres World Tour',
        description: 'Coldplay brings their spectacular Music of the Spheres World Tour to India. Experience an unforgettable night of music, lights, and magic under the stars.',
        venue: 'DY Patil Stadium, Navi Mumbai',
        eventDate: new Date('2026-09-20'),
        eventTime: '18:30',
        posterUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'Arijit Singh Live in Concert',
        description: 'Experience the magic of Bollywood\'s most beloved voice. Arijit Singh performs his greatest hits in an intimate outdoor amphitheatre setting with a full orchestra.',
        venue: 'Jawaharlal Nehru Stadium, Delhi',
        eventDate: new Date('2026-08-10'),
        eventTime: '19:30',
        posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'AR Rahman: Infinite Love Tour',
        description: 'The Mozart of Madras takes the stage for a once-in-a-lifetime concert experience. From Jai Ho to Roja, relive three decades of iconic music with stunning visual production.',
        venue: 'Phoenix Arena, Chennai',
        eventDate: new Date('2026-10-05'),
        eventTime: '19:00',
        posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500',
        status: 'ACTIVE',
      },

      // ── 😂 Comedy (7–9) ──
      {
        title: 'Stand-Up Comedy Night with Zakir Khan',
        description: 'An evening of laughter with India\'s favorite comedian. Get ready for an unforgettable night of comedy, stories, and fun that\'ll leave you in splits.',
        venue: 'Siri Fort Auditorium, Delhi',
        eventDate: new Date('2026-07-25'),
        eventTime: '20:00',
        posterUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'Biswa Kalyan Rath: Sushi',
        description: 'Biswa returns with his brand new special "Sushi" — a hilariously sharp take on modern relationships, tech culture, and everything in between. Absurdist comedy at its finest.',
        venue: 'St. Andrew\'s Auditorium, Mumbai',
        eventDate: new Date('2026-08-22'),
        eventTime: '20:30',
        posterUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'Munawar Faruqui: Dongri to Everywhere',
        description: 'From the streets of Dongri to selling out stadiums, Munawar brings raw energy and razor-sharp wit. A no-holds-barred comedy experience you won\'t forget.',
        venue: 'NSCI Dome, Mumbai',
        eventDate: new Date('2026-09-12'),
        eventTime: '20:00',
        posterUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500',
        status: 'UPCOMING',
      },

      // ── 🏏 Sports (10–12) ──
      {
        title: 'IPL 2027 Grand Final',
        description: 'The biggest night in Indian cricket. Two titans clash in the IPL Grand Final. Premium hospitality, electrifying atmosphere, and unforgettable memories await.',
        venue: 'Narendra Modi Stadium, Ahmedabad',
        eventDate: new Date('2027-03-28'),
        eventTime: '19:30',
        posterUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'India vs Australia: Test Championship',
        description: 'The ultimate rivalry in world cricket! Watch Team India take on Australia in the ICC World Test Championship Final. Five days of intense, edge-of-your-seat action.',
        venue: 'M. Chinnaswamy Stadium, Bangalore',
        eventDate: new Date('2026-11-15'),
        eventTime: '09:30',
        posterUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'ISL Cup Final 2027',
        description: 'Indian football\'s biggest night. The ISL Cup Final brings together India\'s top clubs in a thrilling showdown. Expect drama, goals, and an electric atmosphere.',
        venue: 'Salt Lake Stadium, Kolkata',
        eventDate: new Date('2027-02-22'),
        eventTime: '19:00',
        posterUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500',
        status: 'UPCOMING',
      },

      // ── 🎭 Theatre & Performing Arts (13–15) ──
      {
        title: 'Hamilton: An Indian Musical',
        description: 'The Tony Award-winning phenomenon comes to India for the first time. Experience the revolutionary story of Alexander Hamilton told through hip-hop, jazz, R&B, and show tunes.',
        venue: 'Royal Opera House, Mumbai',
        eventDate: new Date('2026-10-18'),
        eventTime: '19:00',
        posterUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'Mughal-e-Azam: The Musical',
        description: 'A spectacular Bollywood musical bringing the timeless love story of Salim and Anarkali to life on stage with breathtaking sets, costumes, and live performances.',
        venue: 'Kingdom of Dreams, Gurugram',
        eventDate: new Date('2026-08-30'),
        eventTime: '19:30',
        posterUrl: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'A Midsummer Night\'s Dream',
        description: 'Shakespeare\'s beloved comedy gets a modern Indian adaptation. Set in the enchanted forests of Coorg, this production blends classical drama with contemporary storytelling.',
        venue: 'Ranga Shankara, Bangalore',
        eventDate: new Date('2026-07-12'),
        eventTime: '18:30',
        posterUrl: 'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=500',
        status: 'COMPLETED',
      },

      // ── 🎤 Tech Conferences (16–18) ──
      {
        title: 'TechCrunch Disrupt India 2026',
        description: 'India\'s premier startup and tech conference. Network with founders, VCs, and innovators. Featuring keynotes from top tech leaders, startup pitches, and cutting-edge demos.',
        venue: 'Jio World Centre, Mumbai',
        eventDate: new Date('2026-11-08'),
        eventTime: '09:00',
        posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'Google I/O Extended Bangalore',
        description: 'Join the Google Developer community for an extended viewing party and workshops. Learn about the latest in Android, AI/ML, Web, Cloud, and Firebase from Google experts.',
        venue: 'Bangalore International Exhibition Centre',
        eventDate: new Date('2026-09-05'),
        eventTime: '10:00',
        posterUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'ReactConf India 2026',
        description: 'The definitive React conference for Indian developers. Deep dives into React 19, Server Components, and the future of frontend development with world-class speakers.',
        venue: 'HICC, Hyderabad',
        eventDate: new Date('2026-10-22'),
        eventTime: '09:30',
        posterUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
        status: 'UPCOMING',
      },

      // ── 🎪 Festivals (19–21) ──
      {
        title: 'Sunburn Festival 2026',
        description: 'Asia\'s biggest electronic dance music festival returns. Three days of world-class DJs, stunning stage production, and an unforgettable party under the Goan skies.',
        venue: 'Vagator Beach, Goa',
        eventDate: new Date('2026-12-28'),
        eventTime: '16:00',
        posterUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'NH7 Weekender Pune',
        description: 'India\'s happiest music festival! A multi-genre celebration featuring indie, rock, electronic, hip-hop, and folk artists across five stages over two magical days.',
        venue: 'Mahalaxmi Lawns, Pune',
        eventDate: new Date('2026-11-21'),
        eventTime: '14:00',
        posterUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'Comic Con India 2026',
        description: 'The ultimate pop culture extravaganza! Cosplay contests, comic launches, celebrity panels, gaming zones, and exclusive merchandise from your favorite franchises.',
        venue: 'KTPO Convention Centre, Bangalore',
        eventDate: new Date('2026-10-10'),
        eventTime: '10:00',
        posterUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=500',
        status: 'ACTIVE',
      },

      // ── 🎨 Exhibitions (22–24) ──
      {
        title: 'Van Gogh: Immersive Experience',
        description: 'Step inside the paintings of Vincent van Gogh in this stunning 360° immersive digital art exhibition. Starry Night, Sunflowers, and more come alive through projection and music.',
        venue: 'National Gallery of Modern Art, Delhi',
        eventDate: new Date('2026-09-01'),
        eventTime: '10:00',
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500',
        status: 'ACTIVE',
      },
      {
        title: 'India Art Fair 2027',
        description: 'South Asia\'s largest contemporary art fair returns with 80+ galleries, large-scale installations, curated talks, and performances by leading artists from around the world.',
        venue: 'NSIC Exhibition Grounds, Delhi',
        eventDate: new Date('2027-01-30'),
        eventTime: '11:00',
        posterUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500',
        status: 'UPCOMING',
      },
      {
        title: 'National Science & Innovation Expo',
        description: 'Explore the cutting edge of Indian science and technology. Interactive exhibits, robotics demos, space exploration pavilion, and hands-on STEM workshops for all ages.',
        venue: 'Science City, Kolkata',
        eventDate: new Date('2026-08-05'),
        eventTime: '09:00',
        posterUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500',
        status: 'ACTIVE',
      },

      // ── 🧘 Wellness (25) ──
      {
        title: 'International Yoga & Wellness Festival',
        description: 'A three-day journey of mind, body, and soul. Join world-renowned yoga masters, meditation experts, and wellness practitioners in the spiritual heart of India.',
        venue: 'Parmarth Niketan, Rishikesh',
        eventDate: new Date('2026-10-15'),
        eventTime: '06:00',
        posterUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500',
        status: 'ACTIVE',
      },
    ];

    const events = await Event.create(
      eventsData.map((e) => ({ ...e, createdBy: organiser._id }))
    );
    console.log(`   ✅ Created ${events.length} events`);

    // ──────────────────────────────────────────────
    //  Seat Categories & Seats for each event
    // ──────────────────────────────────────────────

    // Category configs per event type
    const movieCategories = [
      { name: 'Premium', price: 500, totalSeats: 20 },
      { name: 'Gold', price: 350, totalSeats: 30 },
      { name: 'Silver', price: 200, totalSeats: 40 },
    ];

    const concertCategories = [
      { name: 'VIP', price: 15000, totalSeats: 20 },
      { name: 'Gold', price: 8000, totalSeats: 30 },
      { name: 'Silver', price: 4000, totalSeats: 50 },
      { name: 'Standard', price: 2000, totalSeats: 50 },
    ];

    const comedyCategories = [
      { name: 'Front Row', price: 2000, totalSeats: 10 },
      { name: 'Standard', price: 800, totalSeats: 40 },
    ];

    const sportsCategories = [
      { name: 'Pavilion VIP', price: 20000, totalSeats: 20 },
      { name: 'Club House', price: 10000, totalSeats: 30 },
      { name: 'Premium Stand', price: 5000, totalSeats: 50 },
      { name: 'General Stand', price: 1500, totalSeats: 80 },
    ];

    const theatreCategories = [
      { name: 'Royal Box', price: 5000, totalSeats: 10 },
      { name: 'Dress Circle', price: 3000, totalSeats: 30 },
      { name: 'Balcony', price: 1500, totalSeats: 40 },
      { name: 'Stalls', price: 800, totalSeats: 50 },
    ];

    const conferenceCategories = [
      { name: 'All-Access Pass', price: 8000, totalSeats: 20 },
      { name: 'Standard Pass', price: 3000, totalSeats: 60 },
      { name: 'Virtual Pass', price: 500, totalSeats: 100 },
    ];

    const festivalCategories = [
      { name: 'VIP Lounge', price: 12000, totalSeats: 30 },
      { name: 'Early Bird', price: 5000, totalSeats: 50 },
      { name: 'General Admission', price: 2500, totalSeats: 100 },
    ];

    const exhibitionCategories = [
      { name: 'Premium Experience', price: 1500, totalSeats: 30 },
      { name: 'Standard Entry', price: 500, totalSeats: 60 },
    ];

    const wellnessCategories = [
      { name: 'Full Retreat', price: 10000, totalSeats: 20 },
      { name: 'Day Pass', price: 2000, totalSeats: 50 },
      { name: 'Single Session', price: 500, totalSeats: 40 },
    ];

    // Map event index to category config
    const categoryMap = [
      // Movies (0-2)
      movieCategories, movieCategories, movieCategories,
      // Concerts (3-5)
      concertCategories, concertCategories, concertCategories,
      // Comedy (6-8)
      comedyCategories, comedyCategories, comedyCategories,
      // Sports (9-11)
      sportsCategories, sportsCategories, sportsCategories,
      // Theatre (12-14)
      theatreCategories, theatreCategories, theatreCategories,
      // Conferences (15-17)
      conferenceCategories, conferenceCategories, conferenceCategories,
      // Festivals (18-20)
      festivalCategories, festivalCategories, festivalCategories,
      // Exhibitions (21-23)
      exhibitionCategories, exhibitionCategories, exhibitionCategories,
      // Wellness (24)
      wellnessCategories,
    ];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const configs = categoryMap[i];
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
    console.log(`\n📊 Summary: ${events.length} events seeded across 9 categories`);
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
