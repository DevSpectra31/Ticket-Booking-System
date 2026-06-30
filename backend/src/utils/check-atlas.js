const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to Atlas...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ReserveX',
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected!');
    console.log('Database Name:', conn.connection.db.databaseName);
    
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in this database:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Check users collection count
    const usersCount = await conn.connection.db.collection('users').countDocuments();
    console.log(`\n👥 Total registered users in database: ${usersCount}`);

    // Print emails of registered users
    const users = await conn.connection.db.collection('users').find({}, { projection: { email: 1 } }).toArray();
    console.log('Registered User Emails:');
    users.forEach(u => console.log(`  - ${u.email}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
};

connectDB();
