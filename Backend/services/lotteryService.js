const Lottery = require('../models/lotteryModel');
const Ticket = require('../models/ticketModel');
const ApiError = require('../utils/ApiError');

// Create a new lottery
exports.createLottery = async (lotteryData) => {
  const lottery = await Lottery.create(lotteryData);
  return lottery;
};

// Get all lotteries, with optional filtering by status
exports.getAllLotteries = async (query) => {
  const lotteries = await Lottery.find(query); // e.g., find({ status: 'open' })
  return lotteries;
};

// Update a lottery partially
exports.updateLottery = async (lotteryId, updateData) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery) {
    throw new ApiError(404, 'Lottery not found.');
  }
  if (lottery.status === 'completed') {
    throw new ApiError(400, 'Cannot update a completed lottery.');
  }

  // Only update fields that are provided
  const allowedUpdates = [
    'name',
    'drawDate',
    'validNumberRange',
    'maxPerNumber',
    'numberOfWinningNumbers',
    'payoutRules',
    'states'
  ];
  const updates = {};
  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  // Validate updates
  if (updates.validNumberRange) {
    if (!updates.validNumberRange.min || !updates.validNumberRange.max || updates.validNumberRange.min > updates.validNumberRange.max) {
      throw new ApiError(400, 'Invalid number range: min and max are required, and min must be less than or equal to max.');
    }
  }
  if (updates.maxPerNumber && (isNaN(updates.maxPerNumber) || updates.maxPerNumber <= 0)) {
    throw new ApiError(400, 'maxPerNumber must be a positive number.');
  }
  if (updates.numberOfWinningNumbers && (isNaN(updates.numberOfWinningNumbers) || updates.numberOfWinningNumbers <= 0)) {
    throw new ApiError(400, 'numberOfWinningNumbers must be a positive integer.');
  }

  // Check if tickets exist for this lottery
  const ticketCount = await Ticket.countDocuments({ lottery: lotteryId });
  if (ticketCount > 0) {
    // Prevent changes to critical fields if tickets exist
    if (updates.validNumberRange || updates.maxPerNumber || updates.payoutRules || updates.states) {
      throw new ApiError(400, 'Cannot update validNumberRange, maxPerNumber, payoutRules, or states when tickets have been sold.');
    }
  }

  const updatedLottery = await Lottery.findByIdAndUpdate(lotteryId, updates, {
    new: true,
    runValidators: true,
  });
  if (!updatedLottery) {
    throw new ApiError(404, 'Lottery not found.');
  }
  return updatedLottery;
};

// Delete a lottery
exports.deleteLottery = async (lotteryId) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery) {
    throw new ApiError(404, 'Lottery not found.');
  }
  if (lottery.status === 'completed') {
    throw new ApiError(400, 'Cannot delete a completed lottery.');
  }
  const ticketCount = await Ticket.countDocuments({ lottery: lotteryId });
  if (ticketCount > 0) {
    throw new ApiError(400, 'Cannot delete a lottery with associated tickets.');
  }
  await Lottery.findByIdAndDelete(lotteryId);
};

// Declare winning numbers and evaluate all tickets
exports.declareWinningNumbers = async (lotteryId, winningNumbers) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery) {
    throw new ApiError(404, 'Lottery not found.');
  }
  if (lottery.status !== 'closed') {
    throw new ApiError(400, 'Lottery must be closed before declaring winners.');
  }
  if (winningNumbers.length !== lottery.numberOfWinningNumbers) {
    throw new ApiError(400, `Invalid number of winners. Expected ${lottery.numberOfWinningNumbers}.`);
  }

  // Update lottery with winning numbers and set status to completed
  lottery.winningNumbers = winningNumbers;
  lottery.status = 'completed';
  await lottery.save();

  // Find all tickets for this lottery
  const tickets = await Ticket.find({ lottery: lotteryId });
  const payoutRules = lottery.payoutRules || { bolet: 50, mariage: 1000 };

  // Evaluate each ticket
  for (const ticket of tickets) {
    let isWinner = false;
    let payoutAmount = 0;
    for (const bet of ticket.bets) {
      if (bet.betType === 'bolet') {
        if (winningNumbers.includes(bet.numbers[0])) {
          isWinner = true;
          payoutAmount += bet.amounts[0] * (payoutRules.get ? payoutRules.get('bolet') : payoutRules.bolet);
        }
      } else if (bet.betType === 'mariage') {
        if (
          bet.numbers.length === 2 &&
          winningNumbers.includes(bet.numbers[0]) &&
          winningNumbers.includes(bet.numbers[1])
        ) {
          isWinner = true;
          payoutAmount += bet.amounts[0] * (payoutRules.get ? payoutRules.get('mariage') : payoutRules.mariage);
        }
      }
      // Note: play3 and play4 not included in winner evaluation per current logic
    }
    ticket.isWinner = isWinner;
    ticket.payoutAmount = payoutAmount;
    await ticket.save();
  }

  return lottery;
};

exports.getSoldNumbers = async (lotteryId) => {
  const tickets = await Ticket.find({ lottery: lotteryId });
  const soldNumbers = [];
  for (const ticket of tickets) {
    for (const bet of ticket.bets) {
      if (bet.betType === 'bolet' || bet.betType === 'mariage') {
        if (bet.numbers && Array.isArray(bet.numbers)) {
          soldNumbers.push(...bet.numbers);
        }
      }
    }
  }
  return soldNumbers;
};