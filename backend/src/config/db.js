const mongoose = require('mongoose');
const env = require('./env');

let replSet = null;

const connectDB = async () => {
  try {
    console.log(`🔌 Attempting to connect to MongoDB at ${env.mongoUri}...`);
    // Attempt standard connection with 2.5s timeout to not block long
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ MongoDB connected to external host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️ External MongoDB connection failed: ${error.message}`);
    console.log('🔄 Initializing in-memory MongoDB replica set for development fallback...');
    
    try {
      const { MongoMemoryReplSet } = require('mongodb-memory-server');
      
      replSet = await MongoMemoryReplSet.create({
        replSet: { storageEngine: 'ephemeralForTest' }
      });

      
      const uri = replSet.getUri();
      console.log(`💾 In-memory MongoDB Replica Set started at: ${uri}`);
      
      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB connected in-memory: ${conn.connection.host}`);

      // Auto-seed the in-memory database since it starts fresh
      console.log('🌱 Auto-seeding in-memory database...');
      const { runSeed } = require('../seed/seedData');
      await runSeed();
    } catch (inMemError) {
      console.error(`❌ Failed to start in-memory MongoDB replica set: ${inMemError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

