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
  const payoutRules = lottery.payoutRules || { bolet: 50, mariage: 1000 };

  // Evaluate each ticket
  for (const ticket of tickets) {
    let isWinner = false;
    let payoutAmount = 0;
    for (const bet of ticket.bets) {
      if (bet.betType === 'bolet') {
        if (winningNumbers.includes(bet.numbers[0])) {
          isWinner = true;
          payoutAmount += bet.amount * (payoutRules.get ? payoutRules.get('bolet') : payoutRules.bolet);
        }
      } else if (bet.betType === 'mariage') {
        if (
          bet.numbers.length === 2 &&
          winningNumbers.includes(bet.numbers[0]) &&
          winningNumbers.includes(bet.numbers[1])
        ) {
          isWinner = true;
          payoutAmount += bet.amount * (payoutRules.get ? payoutRules.get('mariage') : payoutRules.mariage);
        }
      }
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
      if (bet.betType === 'bolet') {
        // Support both old and new schema
        if (bet.numbers && Array.isArray(bet.numbers)) {
          soldNumbers.push(bet.numbers[0]);
        } else if (bet.number) {
          soldNumbers.push(bet.number);
        }
      } else if (bet.betType === 'mariage') {
        if (bet.numbers && Array.isArray(bet.numbers)) {
          soldNumbers.push(bet.numbers[0], bet.numbers[1]);
        }
      }
    }
  }
  return soldNumbers;
};