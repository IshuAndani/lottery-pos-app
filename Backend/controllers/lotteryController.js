const lotteryService = require('../services/lotteryService');
const asyncHandler = require('../utils/asyncHandler');

exports.createLottery = asyncHandler(async (req, res, next) => {
  const lottery = await lotteryService.createLottery(req.body);
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