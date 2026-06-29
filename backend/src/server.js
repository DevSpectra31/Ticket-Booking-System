const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const startHoldExpiryJob = require('./jobs/holdExpiry.job');
const startWaitlistOfferJob = require('./jobs/waitlistOffer.job');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start cron jobs
  startHoldExpiryJob();
  startWaitlistOfferJob();

  // Start Express server
  const server = app.listen(env.port, () => {
    console.log(`\n🚀 ReserveX API running on http://localhost:${env.port}`);
    console.log(`📚 API Docs: http://localhost:${env.port}/api-docs`);
    console.log(`🌍 Environment: ${env.nodeEnv}\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
