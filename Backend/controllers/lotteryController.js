const lotteryService = require('../services/lotteryService');
const asyncHandler = require('../utils/asyncHandler');

exports.createLottery = asyncHandler(async (req, res, next) => {
  const { name, drawDate, validNumberRange, maxPerNumber, numberOfWinningNumbers, payoutRules, states } = req.body;
  
  // Validate payoutRules to ensure 'bolet' and 'mariage' are included
  if (!payoutRules || !payoutRules.bolet || !payoutRules.mariage) {
    return res.status(400).json({
      status: 'error',
      message: 'Payout rules must include both bolet and mariage multipliers.'
    });
  }

  // Validate states
  if (!states || !Array.isArray(states) || states.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one state must be specified.'
    });
  }

  const lottery = await lotteryService.createLottery({
    name,
    drawDate,
    validNumberRange,
    maxPerNumber,
    numberOfWinningNumbers,
    payoutRules,
    states
  });
  res.status(201).json({
    status: 'success',
    data: { lottery },
  });
});

exports.getAllLotteries = asyncHandler(async (req, res, next) => {
  // Allow filtering by status, e.g., /lotteries?status=open
  const lotteries = await lotteryService.getAllLotteries(req.query);
  res.status(200).json({
    status: 'success',
    results: lotteries.length,
    data: { lotteries },
  });
});

exports.updateLottery = asyncHandler(async (req, res, next) => {
  const { name, drawDate, validNumberRange, maxPerNumber, numberOfWinningNumbers, payoutRules, states } = req.body;

  // Validate payoutRules if provided
  if (payoutRules && (!payoutRules.bolet || !payoutRules.mariage)) {
    return res.status(400).json({
      status: 'error',
      message: 'Payout rules must include both bolet and mariage multipliers.'
    });
  }

  // Validate states if provided
  if (states && (!Array.isArray(states) || states.length === 0)) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one state must be specified.'
    });
  }

  const lottery = await lotteryService.updateLottery(req.params.id, {
    name,
    drawDate,
    validNumberRange,
    maxPerNumber,
    numberOfWinningNumbers,
    payoutRules,
    states
  });
  res.status(200).json({
    status: 'success',
    data: { lottery },
  });
});

exports.deleteLottery = asyncHandler(async (req, res, next) => {
  await lotteryService.deleteLottery(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.declareWinners = asyncHandler(async (req, res, next) => {
  const { winningNumbers } = req.body;
  const lottery = await lotteryService.declareWinningNumbers(req.params.id, winningNumbers);
  res.status(200).json({
    status: 'success',
    message: 'Winning numbers declared and tickets evaluated successfully.',
    data: { lottery },
  });
});

exports.getSoldNumbers = asyncHandler(async (req, res, next) => {
  const soldNumbers = await lotteryService.getSoldNumbers(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { soldNumbers },
  });
});