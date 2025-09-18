const { v4: uuidv4 } = require('uuid');

const Ticket = require('../models/ticketModel');
const Lottery = require('../models/lotteryModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const crypto = require('crypto');


const generateTicketId = () => {
  const timestamp = Date.now().toString(36); 
  const randomStr = crypto.randomBytes(4).toString('hex');
  return `${timestamp}${randomStr}`.toUpperCase().slice(0, 10);
};

exports.sellTicket = async (lotteryId, agentId, bets, period) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery || lottery.status !== 'open') {
    throw new ApiError(400, 'This lottery is not open for ticket sales.');
  }

  // Validate bets
  for (const bet of bets) {
    if (!['bolet', 'mariage', 'play3', 'play4'].includes(bet.betType)) {
      throw new ApiError(400, `Invalid bet type: ${bet.betType}. Must be 'bolet', 'mariage', 'play3', or 'play4'.`);
    }
    if (!Array.isArray(bet.numbers) || bet.numbers.length === 0) {
      throw new ApiError(400, `Bet must include a numbers array.`);
    }
    if (bet.betType === 'bolet' && bet.numbers.length !== 1) {
      throw new ApiError(400, `Bolet bets must have exactly one number per bet.`);
    }
    if (bet.betType === 'mariage' && bet.numbers.length !== 2) {
      throw new ApiError(400, `Mariage bets must have exactly two numbers.`);
    }
    if (['play3', 'play4'].includes(bet.betType) && bet.numbers.length !== 1) {
      throw new ApiError(400, `${bet.betType} bets must have exactly one number.`);
    }
    if (bet.numbers.some(num => typeof num !== 'string' || !num)) {
      throw new ApiError(400, `All numbers must be non-empty strings.`);
    }
    // Validate number range for bolet and mariage only
    if (['bolet', 'mariage'].includes(bet.betType)) {
      if (bet.numbers.some(num => {
        const numValue = Number(num);
        return isNaN(numValue) || numValue < lottery.validNumberRange.min || numValue > lottery.validNumberRange.max;
      })) {
        throw new ApiError(400, `All numbers for ${bet.betType} must be within the range ${lottery.validNumberRange.min}-${lottery.validNumberRange.max}.`);
      }
    }
    const uniqueNumbers = new Set(bet.numbers);
    if (uniqueNumbers.size !== bet.numbers.length) {
      throw new ApiError(400, `Duplicate numbers are not allowed in a single bet.`);
    }
    if (!Array.isArray(bet.amounts) || bet.amounts.length === 0) {
      throw new ApiError(400, `Bet must include an amounts array.`);
    }
    if (bet.amounts.length !== 1) {
      throw new ApiError(400, `Expected exactly one amount for ${bet.betType}, but got ${bet.amounts.length}.`);
    }
    if (bet.amounts.some(amt => isNaN(amt) || amt <= 0)) {
      throw new ApiError(400, `All amounts must be positive numbers.`);
    }
    // Enforce per-bet-type min/max from lottery.betLimits
    const limits = lottery.betLimits && lottery.betLimits[bet.betType];
    if (limits) {
      const amount = Number(bet.amounts[0]);
      if (amount < limits.min) {
        throw new ApiError(400, `${bet.betType} minimum is $${limits.min}.`);
      }
      if (amount > limits.max) {
        throw new ApiError(400, `${bet.betType} maximum is $${limits.max}.`);
      }
    }
    // Validate state for play3 and play4
    if (['play3', 'play4'].includes(bet.betType) && !lottery.states.includes(bet.state)) {
      throw new ApiError(400, `Invalid state for ${bet.betType}: ${bet.state}. Must be one of ${lottery.states.join(', ')}.`);
    }
    if (['bolet', 'mariage'].includes(bet.betType) && bet.state !== 'haiti') {
      throw new ApiError(400, `Bolet and mariage bets must use state 'haiti'. Received: ${bet.state}.`);
    }
  }

  // Check max per number per bet type
  const perTypeMax = lottery.maxPerNumber || { bolet: 50, mariage: 50, play3: 50, play4: 50 };

  // Aggregate requested amounts per type+number
  const requestedByTypeAndNumber = {};
  for (const bet of bets) {
    const keyBase = bet.betType;
    for (let i = 0; i < bet.numbers.length; i++) {
      const num = bet.numbers[i];
      const amount = bet.amounts[0];
      const key = `${keyBase}:${num}`;
      requestedByTypeAndNumber[key] = (requestedByTypeAndNumber[key] || 0) + amount;
    }
  }

  // Aggregate already sold amounts for this lottery per type+number
  const tickets = await Ticket.find({ lottery: lotteryId });
  const soldByTypeAndNumber = {};
  for (const ticket of tickets) {
    for (const bet of ticket.bets) {
      if (bet.numbers && Array.isArray(bet.numbers)) {
        const keyBase = bet.betType;
        for (let i = 0; i < bet.numbers.length; i++) {
          const num = bet.numbers[i];
          const amount = bet.amounts[0];
          const key = `${keyBase}:${num}`;
          soldByTypeAndNumber[key] = (soldByTypeAndNumber[key] || 0) + amount;
        }
      }
    }
  }

  for (const key in requestedByTypeAndNumber) {
    const [betType, num] = key.split(':');
    const cap = Number(perTypeMax[betType]) || 50;
    const alreadySold = soldByTypeAndNumber[key] || 0;
    const requested = requestedByTypeAndNumber[key];
    if (alreadySold + requested > cap) {
      throw new ApiError(400, `${betType} number ${num} is sold out. Only $${Math.max(0, cap - alreadySold)} left.`);
    }
  }

  const agent = await User.findById(agentId);
  if (!agent) {
    throw new ApiError(400, `Agent with ID ${agentId} not found.`);
  }
  const totalAmount = bets.reduce((sum, bet) => sum + bet.amounts.reduce((acc, amt) => acc + (amt || 0), 0), 0);
  // Clamp commissionRate to [0, 100]
  const safeCommissionRate = Math.max(0, Math.min(100, Number(agent.commissionRate) || 0));
  const commissionAmount = totalAmount * (safeCommissionRate / 100);
  const netOwedToAdmin = totalAmount - commissionAmount;

  let newTicket;
  try {
    // Generate ticket ID and ensure uniqueness
    let ticketId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;
    while (!isUnique && attempts < maxAttempts) {
      ticketId = generateTicketId();
      const existingTicket = await Ticket.findOne({ ticketId });
      if (!existingTicket) {
        isUnique = true;
      }
      attempts++;
    }
    if (!isUnique) {
      throw new Error('Failed to generate a unique ticket ID after maximum attempts.');
    }

    // Create ticket
    newTicket = await Ticket.create({
      ticketId,
      lottery: lotteryId,
      agent: agentId,
      period,
      bets: bets.map(bet => ({
        numbers: bet.numbers,
        amounts: bet.amounts.map(Number),
        betType: bet.betType,
        state: bet.state || 'haiti' // Default to 'haiti' if state is not provided
      })),
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
    console.error('Ticket sale error:', {
      message: error.message,
      stack: error.stack,
      lotteryId,
      agentId,
      bets,
      totalAmount,
    });
    throw new ApiError(500, `Ticket sale failed: ${error.message}`);
  }

  return newTicket;
};

exports.checkTicketStatus = async (ticketId) => {
  const ticket = await Ticket.findOne({ ticketId }).populate('lottery', 'name status payoutRules winningNumbers');
  if (!ticket) {
    throw new ApiError(404, 'No ticket found with that ID.');
  }
  // If lottery is completed, ensure ticket has up-to-date winner evaluation
  if (ticket.lottery && ticket.lottery.status === 'completed') {
    const payoutRules = ticket.lottery.payoutRules || { bolet: 50, mariage: 1000, play3: 500, play4: 2000 };

    const normalizeNumber = (n) => {
      if (n === null || n === undefined) return '';
      const trimmed = String(n).trim();
      if (trimmed === '') return '';
      const numeric = Number(trimmed);
      return isNaN(numeric) ? trimmed : String(numeric);
    };

    // Handle both old format (array) and new format (object by bet type)
    let winningNumbersByType = ticket.lottery.winningNumbers;
    if (Array.isArray(winningNumbersByType)) {
      // Convert old format to new format
      winningNumbersByType = {
        bolet: winningNumbersByType,
        mariage: winningNumbersByType,
        play3: winningNumbersByType,
        play4: winningNumbersByType
      };
    }

    // Create normalized winning sets for each bet type
    const betTypes = ['bolet', 'mariage', 'play3', 'play4'];
    const normalizedWinningSets = {};
    for (const betType of betTypes) {
      if (betType === 'mariage') {
        // For mariage, parse the combination and create a set of both numbers
        const combination = winningNumbersByType[betType][0];
        if (combination && typeof combination === 'string' && combination.includes('-')) {
          const parts = combination.split('-');
          if (parts.length === 2) {
            const num1 = normalizeNumber(parts[0]);
            const num2 = normalizeNumber(parts[1]);
            normalizedWinningSets[betType] = new Set([num1, num2]);
          } else {
            normalizedWinningSets[betType] = new Set();
          }
        } else {
          normalizedWinningSets[betType] = new Set();
        }
      } else {
        normalizedWinningSets[betType] = new Set((winningNumbersByType[betType] || []).map(normalizeNumber));
      }
    }

    let isWinner = false;
    let payoutAmount = 0;
    for (const bet of ticket.bets) {
      const betType = bet.betType;
      const normalizedSet = normalizedWinningSets[betType];
      
      if (betType === 'bolet') {
        const betNum = normalizeNumber(bet.numbers[0]);
        if (normalizedSet.has(betNum)) {
          isWinner = true;
          payoutAmount += bet.amounts[0] * (payoutRules.get ? payoutRules.get('bolet') : payoutRules.bolet);
        }
      } else if (betType === 'mariage') {
        if (
          bet.numbers.length === 2 &&
          normalizedSet.has(normalizeNumber(bet.numbers[0])) &&
          normalizedSet.has(normalizeNumber(bet.numbers[1]))
        ) {
          isWinner = true;
          payoutAmount += bet.amounts[0] * (payoutRules.get ? payoutRules.get('mariage') : payoutRules.mariage);
        }
      } else if (betType === 'play3') {
        const betNum = normalizeNumber(bet.numbers[0]);
        if (normalizedSet.has(betNum)) {
          isWinner = true;
          payoutAmount += bet.amounts[0] * (payoutRules.get ? payoutRules.get('play3') : payoutRules.play3);
        }
      } else if (betType === 'play4') {
        const betNum = normalizeNumber(bet.numbers[0]);
        if (normalizedSet.has(betNum)) {
          isWinner = true;
          payoutAmount += bet.amounts[0] * (payoutRules.get ? payoutRules.get('play4') : payoutRules.play4);
        }
      }
    }

    // Persist only if values changed
    if (ticket.isWinner !== isWinner || ticket.payoutAmount !== payoutAmount) {
      ticket.isWinner = isWinner;
      ticket.payoutAmount = payoutAmount;
      await ticket.save();
    }
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