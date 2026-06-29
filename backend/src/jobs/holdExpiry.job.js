const cron = require('node-cron');
const mongoose = require('mongoose');
const SeatHold = require('../modules/holds/seatHold.model');
const Seat = require('../modules/seats/seat.model');
const SeatCategory = require('../modules/seats/seatCategory.model');

/**
 * Seat Hold Expiry Job - Runs every 1 minute.
 * Finds expired active holds, releases seats, marks hold as EXPIRED.
 */
const startHoldExpiryJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredHolds = await SeatHold.find({
        status: 'ACTIVE',
        expiresAt: { $lte: new Date() },
      });

      if (expiredHolds.length === 0) return;

      console.log(`⏰ Processing ${expiredHolds.length} expired hold(s)...`);

      for (const hold of expiredHolds) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Get seats to find categories
          const seats = await Seat.find({ _id: { $in: hold.seats } }).session(session);

          // Release seats from HELD to AVAILABLE
          await Seat.updateMany(
            { _id: { $in: hold.seats }, status: 'HELD' },
            {
              status: 'AVAILABLE',
              heldBy: null,
              holdExpiresAt: null,
            },
            { session }
          );

          // Increment available seats in categories
          const categoryIds = [...new Set(seats.map((s) => s.category.toString()))];
          for (const catId of categoryIds) {
            const countInCategory = seats.filter(
              (s) => s.category.toString() === catId && s.status === 'HELD'
            ).length;
            if (countInCategory > 0) {
              await SeatCategory.findByIdAndUpdate(
                catId,
                { $inc: { availableSeats: countInCategory } },
                { session }
              );
            }
          }

          // Mark hold as EXPIRED
          hold.status = 'EXPIRED';
          await hold.save({ session });

          await session.commitTransaction();
          session.endSession();

          console.log(`   ✅ Released hold ${hold._id}`);

          // Trigger waitlist processing
          try {
            const waitlistService = require('../modules/waitlist/waitlist.service');
            for (const catId of categoryIds) {
              await waitlistService.processWaitlist(hold.event, catId);
            }
          } catch (err) {
            console.error('   Waitlist processing error:', err.message);
          }
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          console.error(`   ❌ Error releasing hold ${hold._id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Hold expiry job error:', error.message);
    }
  });

  console.log('🕐 Hold expiry job scheduled (every 1 minute)');
};

module.exports = startHoldExpiryJob;
