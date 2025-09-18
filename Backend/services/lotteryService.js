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
    'payoutRules',
    'states',
    'betLimits'
  ];
  const updates = {};
  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  // Validate updates
  if (updates.validNumberRange) {
    const minNum = Number(updates.validNumberRange.min);
    const maxNum = Number(updates.validNumberRange.max);
    const hasMin = updates.validNumberRange.min !== undefined && updates.validNumberRange.min !== null;
    const hasMax = updates.validNumberRange.max !== undefined && updates.validNumberRange.max !== null;
    if (!hasMin || !hasMax || isNaN(minNum) || isNaN(maxNum) || minNum > maxNum) {
      throw new ApiError(400, 'Invalid number range: min and max are required, and min must be less than or equal to max.');
    }
    updates.validNumberRange = { min: minNum, max: maxNum };
  }
  if (updates.maxPerNumber) {
    // Accept either a number (legacy) or object per bet type
    if (typeof updates.maxPerNumber === 'number' || typeof updates.maxPerNumber === 'string') {
      const n = Number(updates.maxPerNumber);
      if (isNaN(n) || n <= 0) {
        throw new ApiError(400, 'maxPerNumber must be a positive number.');
      }
      updates.maxPerNumber = { bolet: n, mariage: n, play3: n, play4: n };
    } else if (typeof updates.maxPerNumber === 'object') {
      const keys = ['bolet', 'mariage', 'play3', 'play4'];
      const merged = { ...(lottery.maxPerNumber || {}) };
      for (const k of keys) {
        const raw = updates.maxPerNumber[k];
        if (raw === undefined || raw === null || raw === '') {
          // keep existing value for this key
          continue;
        }
        const v = Number(raw);
        if (isNaN(v) || v <= 0) {
          throw new ApiError(400, `maxPerNumber.${k} must be a positive number.`);
        }
        merged[k] = v;
      }
      // Ensure all keys present after merge
      for (const k of keys) {
        if (merged[k] === undefined) {
          // default to previous or 50 if not present
          merged[k] = Number(lottery.maxPerNumber?.[k]) || 50;
        }
      }
      updates.maxPerNumber = merged;
    } else {
      throw new ApiError(400, 'maxPerNumber must be a number or an object with per-type values.');
    }
  }
  // maxPerNumber is validated and normalized above; skip legacy numeric-only validation

  //if lottery date in future then change status to open
  if (updates.drawDate && new Date(updates.drawDate) > new Date()) {
    updates.status = 'open';
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
exports.declareWinningNumbers = async (lotteryId, winningNumbersByType) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery) {
    throw new ApiError(404, 'Lottery not found.');
  }
  if (lottery.status !== 'closed') {
    throw new ApiError(400, 'Lottery must be closed before declaring winners.');
  }

  // Validate winning numbers structure
  const betTypes = ['bolet', 'mariage', 'play3', 'play4'];
  for (const betType of betTypes) {
    if (!winningNumbersByType[betType] || !Array.isArray(winningNumbersByType[betType])) {
      throw new ApiError(400, `Winning numbers for ${betType} must be provided as an array.`);
    }
    
    if (betType === 'mariage') {
      // Mariage should have exactly one combination
      if (winningNumbersByType[betType].length !== 1) {
        throw new ApiError(400, 'Mariage must have exactly one winning combination.');
      }
    } else {
      // Other bet types should have at least one winner
      if (winningNumbersByType[betType].length === 0) {
        throw new ApiError(400, `${betType} must have at least one winning number.`);
      }
    }
  }

  // Update lottery with winning numbers and set status to completed
  lottery.winningNumbers = winningNumbersByType;
  lottery.status = 'completed';
  await lottery.save();

  // Find all tickets for this lottery
  const tickets = await Ticket.find({ lottery: lotteryId });
  const payoutRules = lottery.payoutRules || { bolet: 50, mariage: 1000, play3: 500, play4: 2000 };

  // Normalize winning numbers for comparison (handles values like '07' vs '7')
  const normalizeNumber = (n) => {
    if (n === null || n === undefined) return '';
    const trimmed = String(n).trim();
    if (trimmed === '') return '';
    const numeric = Number(trimmed);
    return isNaN(numeric) ? trimmed : String(numeric);
  };

  // Create normalized winning sets for each bet type
  const normalizedWinningSets = {};
  for (const betType of betTypes) {
    if (betType === 'mariage') {
      // For mariage, parse the combination and create a set of both numbers
      const combination = winningNumbersByType[betType][0];
      const parts = combination.split('-');
      if (parts.length === 2) {
        const num1 = normalizeNumber(parts[0]);
        const num2 = normalizeNumber(parts[1]);
        normalizedWinningSets[betType] = new Set([num1, num2]);
      } else {
        normalizedWinningSets[betType] = new Set();
      }
    } else {
      normalizedWinningSets[betType] = new Set((winningNumbersByType[betType] || []).map(normalizeNumber));
    }
  }

  // Evaluate each ticket
  for (const ticket of tickets) {
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
    ticket.isWinner = isWinner;
    ticket.payoutAmount = payoutAmount;
    await ticket.save();
  }

  return lottery;
};

// Recalculate winners for an already completed lottery using existing winning numbers
exports.recalculateWinners = async (lotteryId) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery) {
    throw new ApiError(404, 'Lottery not found.');
  }
  if (!lottery.winningNumbers || Object.keys(lottery.winningNumbers).length === 0) {
    throw new ApiError(400, 'No winning numbers set for this lottery.');
  }

  const winningNumbersByType = lottery.winningNumbers;

  // Find all tickets for this lottery
  const tickets = await Ticket.find({ lottery: lotteryId });
  const payoutRules = lottery.payoutRules || { bolet: 50, mariage: 1000, play3: 500, play4: 2000 };

  // Normalize winning numbers for comparison (handles values like '07' vs '7')
  const normalizeNumber = (n) => {
    if (n === null || n === undefined) return '';
    const trimmed = String(n).trim();
    if (trimmed === '') return '';
    const numeric = Number(trimmed);
    return isNaN(numeric) ? trimmed : String(numeric);
  };

  // Create normalized winning sets for each bet type
  const betTypes = ['bolet', 'mariage', 'play3', 'play4'];
  const normalizedWinningSets = {};
  for (const betType of betTypes) {
    if (betType === 'mariage') {
      // For mariage, parse the combination and create a set of both numbers
      const combination = winningNumbersByType[betType][0];
      const parts = combination.split('-');
      if (parts.length === 2) {
        const num1 = normalizeNumber(parts[0]);
        const num2 = normalizeNumber(parts[1]);
        normalizedWinningSets[betType] = new Set([num1, num2]);
      } else {
        normalizedWinningSets[betType] = new Set();
      }
    } else {
      normalizedWinningSets[betType] = new Set((winningNumbersByType[betType] || []).map(normalizeNumber));
    }
  }

  // Evaluate each ticket
  for (const ticket of tickets) {
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