const cron = require('node-cron');
const Lottery = require('../models/lotteryModel');

/**
 * Finds all 'open' lotteries whose drawDate is in the past
 * and updates their status to 'closed'.
 */
const closeDueLotteries = async () => {
  console.log('Running a job to check for lotteries to close.');
  try {
    const now = new Date();
    
    const result = await Lottery.updateMany(
      { status: 'open', drawDate: { $lte: now } },
      { $set: { status: 'closed' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Closed ${result.modifiedCount} lotteries.`);
    }
    
  } catch (error) {
    console.error('Error running the lottery closing job:', error);
  }
};

/**
 * Initializes and starts the cron job.
 */
const startLotteryCloserJob = () => {
  // Schedules the job to run every minute.
  cron.schedule('* * * * *', closeDueLotteries);
  console.log('🕒 Lottery closing job has been scheduled.');
};

module.exports = { startLotteryCloserJob };