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
  const payoutMultiplier = lottery.payoutRule; 

  // Convert winning numbers to actual numbers for a reliable comparison,
  // as bet numbers might be stored with leading zeros (e.g., "01")
  // while declared winners might be without (e.g., "1").
  const winningNumbersAsInt = winningNumbers.map(n => parseInt(n, 10));

  // Evaluate each ticket
  for (const ticket of tickets) {
    for (const bet of ticket.bets) {
      // Also convert the bet number to an integer for comparison
      if (winningNumbersAsInt.includes(parseInt(bet.number, 10))) {
        ticket.isWinner = true;
        ticket.payoutAmount += bet.amount * payoutMultiplier;
      }
    }
    if (ticket.isWinner) {
      await ticket.save();
    }
  }

  return lottery;
};

exports.getSoldNumbers = async (lotteryId) => {
  const tickets = await Ticket.find({ lottery: lotteryId });
  const soldNumbers = [];
  for(const ticket of tickets) {
    for(const bet of ticket.bets) {
      soldNumbers.push(bet.number);
    }
  }
  return soldNumbers;
};