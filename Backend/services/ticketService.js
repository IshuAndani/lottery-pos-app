const { customAlphabet } = require('nanoid');
const Ticket = require('../models/ticketModel');
const Lottery = require('../models/lotteryModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

// Helper to generate a friendly ticket ID
const generateTicketId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

exports.sellTicket = async (lotteryId, agentId, bets) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery || lottery.status !== 'open') {
    throw new ApiError(400, 'This lottery is not open for ticket sales.');
  }

  // Check if any of the numbers are already sold in this lottery
  const numbersToCheck = bets.map(bet => bet.number);
  const existingTicket = await Ticket.findOne({
    lottery: lotteryId,
    'bets.number': { $in: numbersToCheck }
  });

  if (existingTicket) {
    throw new ApiError(400, `One or more numbers are already sold out.`);
  }

  const agent = await User.findById(agentId);
  const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const commissionAmount = totalAmount * (agent.commissionRate / 100);
  const netOwedToAdmin = totalAmount - commissionAmount;
  const session = await mongoose.startSession();
  let newTicket;
  let transaction;
  try {
    session.startTransaction();

    // 1. Create the ticket
    [newTicket] = await Ticket.create([{
      ticketId: generateTicketId(),
      lottery: lotteryId,
      agent: agentId,
      bets,
      totalAmount,
    }], { session });

    // 2. Create a commission transaction
    [transaction] = await Transaction.create([{
      agent: agentId,
      ticket: newTicket._id,
      type: 'commission',
      amount: commissionAmount,
      description: `Commission for ticket ${newTicket.ticketId}`,
      relatedLottery: lotteryId,
    }], { session });

    // 3. Update agent's balance
    agent.balance += netOwedToAdmin;
    await agent.save({ session });

    // 4. Increment ticketsSold on the lottery
    lottery.ticketsSold += 1;
    await lottery.save({ session });
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, 'Transaction failed. Ticket not sold.');
  } finally {
    session.endSession();
  }
  
  return {ticket : newTicket, transactionId : transaction._id};
};

exports.checkTicketStatus = async (ticketId) => {
  const ticket = await Ticket.findOne({ ticketId }).populate('lottery', 'name status');
  if (!ticket) {
    throw new ApiError(404, 'No ticket found with that ID.');
  }
  return ticket;
};

exports.payoutTicket = async (ticketId, agentId) => {
  const ticket = await Ticket.findOne({ ticketId });

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
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 1. Create a negative 'payout' transaction
    await Transaction.create([{
      agent: agentId,
      ticket: ticket._id,
      type: 'payout',
      amount: -ticket.payoutAmount, // Payout is a negative value for the agent's balance
      description: `Payout for winning ticket ${ticket.ticketId}`,
      relatedLottery: ticket.lottery,
    }], { session });

    // 2. Update agent's balance (subtract the payout)
    agent.balance -= ticket.payoutAmount;
    await agent.save({ session });

    // 3. Update the ticket status to 'paid_out'
    ticket.status = 'paid_out';
    await ticket.save({ session });
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, 'Transaction failed. Ticket not paid out.');
  } finally {
    session.endSession();
  }
  
  return ticket;
};