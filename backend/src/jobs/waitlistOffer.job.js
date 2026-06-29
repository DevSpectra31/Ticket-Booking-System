const cron = require('node-cron');
const mongoose = require('mongoose');
const WaitlistEntry = require('../modules/waitlist/waitlist.model');
const SeatHold = require('../modules/holds/seatHold.model');
const Seat = require('../modules/seats/seat.model');
const SeatCategory = require('../modules/seats/seatCategory.model');
const User = require('../modules/users/user.model');
const emailService = require('../modules/notifications/email.service');
const Event = require('../modules/events/event.model');

/**
 * Waitlist Offer Job - Runs every 1 minute.
 * Finds expired OFFERED waitlist entries, marks EXPIRED, releases hold,
 * then offers to next WAITING customer.
 */
const startWaitlistOfferJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredOffers = await WaitlistEntry.find({
        status: 'OFFERED',
        offerExpiresAt: { $lte: new Date() },
      }).populate('customer', 'email fullName');

      if (expiredOffers.length === 0) return;

      console.log(`⏰ Processing ${expiredOffers.length} expired waitlist offer(s)...`);

      for (const entry of expiredOffers) {
        try {
          // Release the associated hold
          if (entry.offeredHold) {
            const hold = await SeatHold.findById(entry.offeredHold);
            if (hold && hold.status === 'ACTIVE') {
              const session = await mongoose.startSession();
              session.startTransaction();

              try {
                const seats = await Seat.find({ _id: { $in: hold.seats } }).session(session);

                await Seat.updateMany(
                  { _id: { $in: hold.seats }, status: 'HELD' },
                  {
                    status: 'AVAILABLE',
                    heldBy: null,
                    holdExpiresAt: null,
                  },
                  { session }
                );

                const categoryIds = [...new Set(seats.map((s) => s.category.toString()))];
                for (const catId of categoryIds) {
                  const count = seats.filter(
                    (s) => s.category.toString() === catId && s.status === 'HELD'
                  ).length;
                  if (count > 0) {
                    await SeatCategory.findByIdAndUpdate(
                      catId,
                      { $inc: { availableSeats: count } },
                      { session }
                    );
                  }
                }

                hold.status = 'EXPIRED';
                await hold.save({ session });

                await session.commitTransaction();
                session.endSession();
              } catch (err) {
                await session.abortTransaction();
                session.endSession();
                throw err;
              }
            }
          }

          // Mark waitlist entry as EXPIRED
          entry.status = 'EXPIRED';
          await entry.save();

          // Send expired notification (non-blocking)
          const event = await Event.findById(entry.event);
          if (entry.customer && event) {
            emailService.sendWaitlistOfferExpired({
              to: entry.customer.email,
              eventTitle: event.title,
            }).catch((err) => console.error('Email error:', err));
          }

          console.log(`   ✅ Expired waitlist offer ${entry._id}`);

          // Offer to next waiting customer
          try {
            const waitlistService = require('../modules/waitlist/waitlist.service');
            await waitlistService.processWaitlist(entry.event, entry.category);
          } catch (err) {
            console.error('   Next offer error:', err.message);
          }
        } catch (error) {
          console.error(`   ❌ Error processing expired offer ${entry._id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Waitlist offer job error:', error.message);
    }
  });

  console.log('🕐 Waitlist offer job scheduled (every 1 minute)');
};

module.exports = startWaitlistOfferJob;
