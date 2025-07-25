const { v4: uuidv4 } = require('uuid');

const Ticket = require('../models/ticketModel');
const Lottery = require('../models/lotteryModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

// Helper to generate a friendly ticket ID
const generateTicketId = () => uuidv4().slice(0, 8).toUpperCase();

exports.sellTicket = async (lotteryId, agentId, bets) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery || lottery.status !== 'open') {
    throw new ApiError(400, 'This lottery is not open for ticket sales.');
  }

  // Validate bets
  for (const bet of bets) {
    if (!['bolet', 'mariage'].includes(bet.betType)) {
      throw new ApiError(400, `Invalid bet type: ${bet.betType}. Must be 'bolet' or 'mariage'.`);
    }
    if (!Array.isArray(bet.numbers) || bet.numbers.length === 0) {
      throw new ApiError(400, `Bet must include a numbers array.`);
    }
    if (bet.betType === 'bolet' && bet.numbers.length !== 1) {
      throw new ApiError(400, `Bolet bets must have exactly one number per bet.`);
    }
    if (bet.betType === 'mariage' && bet.numbers.length < 2) {
      throw new ApiError(400, `Mariage bets must have at least two numbers.`);
    }
    if (bet.numbers.some(num => typeof num !== 'string' || !num)) {
      throw new ApiError(400, `All numbers must be non-empty strings.`);
    }
    const uniqueNumbers = new Set(bet.numbers);
    if (uniqueNumbers.size !== bet.numbers.length) {
      throw new ApiError(400, `Duplicate numbers are not allowed in a single bet.`);
    }
    if (isNaN(bet.amount) || bet.amount <= 0) {
      throw new ApiError(400, `Bet amount must be a positive number.`);
    }
  }

  // Check max per number
  const betAmounts = {};
  for (const bet of bets) {
    for (const num of bet.numbers) {
      betAmounts[num] = (betAmounts[num] || 0) + bet.amount;
    }
  }

  const tickets = await Ticket.find({ lottery: lotteryId });
  const soldTotals = {};
  for (const ticket of tickets) {
    for (const bet of ticket.bets) {
      if (bet.numbers && Array.isArray(bet.numbers)) {
        for (const num of bet.numbers) {
          soldTotals[num] = (soldTotals[num] || 0) + bet.amount;
        }
      } else if (bet.number) {
        soldTotals[bet.number] = (soldTotals[bet.number] || 0) + bet.amount;
      }
    }
  }

  const maxPerNumber = lottery.maxPerNumber || 50;
  for (const num in betAmounts) {
    const alreadySold = soldTotals[num] || 0;
    if (alreadySold + betAmounts[num] > maxPerNumber) {
      throw new ApiError(400, `Number ${num} is sold out. Only $${maxPerNumber - alreadySold} left.`);
    }
  }

  const agent = await User.findById(agentId);
  const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const commissionAmount = totalAmount * (agent.commissionRate / 100);
  const netOwedToAdmin = totalAmount - commissionAmount;

  let newTicket;
  try {
    // Create ticket
    newTicket = await Ticket.create({
      ticketId: generateTicketId(),
      lottery: lotteryId,
      agent: agentId,
      bets,
      totalAmount,
    });

    // Create commission transaction
    await Transaction.create({
      agent: agentId,
      ticket: newTicket._id,
      type: 'commission',
      amount: commissionAmount,
      description: `Commission for ticket ${newTicket.ticketId}`,
      relatedLottery: lotteryId,
    });

    // Update agent balance
    agent.balance += netOwedToAdmin;
    await agent.save();

    // Update lottery
    lottery.ticketsSold += 1;
    await lottery.save();
  } catch (error) {
    console.error('Ticket sale error:', error);
    throw new ApiError(500, 'Ticket sale failed.');
  }

  return newTicket;
};

exports.checkTicketStatus = async (ticketId) => {
  const ticket = await Ticket.findOne({ ticketId }).populate('lottery', 'name status payoutRules winningNumbers');
  if (!ticket) {
    throw new ApiError(404, 'No ticket found with that ID.');
  }
  return ticket;
};

//ticket Services.js
exports.payoutTicket = async (ticketId, agentId) => {
  const ticket = await Ticket.findOne({ ticketId }).populate('lottery');

  // --- Validation ---
  if (!ticket) {
    throw new ApiError(404, 'Invalid Ticket ID. Not found.');
  }
  if (!ticket.isWinner) {
    throw new ApiError(400, 'This ticket is not a winner.');
  }
  if (ticket.status === 'paid_out') {
    throw new ApiError(400, 'This ticket has already been paid out.');
  }
  if (ticket.status === 'void') {
    throw new ApiError(400, 'This ticket is void.');
  }

  const agent = await User.findById(agentId);

  try {
    // 1. Create a negative 'payout' transaction
    await Transaction.create({
      agent: agentId,
      ticket: ticket._id,
      type: 'payout',
      amount: -ticket.payoutAmount,
      description: `Payout for winning ticket ${ticket.ticketId}`,
      relatedLottery: ticket.lottery,
    });

    // 2. Update agent's balance
    agent.balance -= ticket.payoutAmount;
    await agent.save();

    // 3. Update ticket status
    ticket.status = 'paid_out';
    await ticket.save();
  } catch (error) {
    throw new ApiError(500, 'Ticket payout failed.');
  }

  return ticket;
};
