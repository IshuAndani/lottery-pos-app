const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');

// --- Admin Controllers ---
exports.getLotteryReport = asyncHandler(async (req, res, next) => {
  const report = await reportService.getLotteryFinancials(req.params.lotteryId);
  res.status(200).json({ status: 'success', data: { report } });
});

exports.getAdminSummaryReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return next(new ApiError(400, 'Please provide both a startDate and an endDate.'));
  }
  const report = await reportService.getSystemSummaryByDate(startDate, endDate);
  res.status(200).json({ status: 'success', data: { report } });
});

exports.getAgentsReport = asyncHandler(async (req, res, next) => {
  const agents = await reportService.getAllAgentBalances();
  res.status(200).json({ status: 'success', results: agents.length, data: { agents } });
});


// --- Agent Controllers ---
exports.getAgentReport = asyncHandler(async (req, res, next) => {
  // Pass the entire query object to the service
  const report = await reportService.getAgentDashboard(req.user.id, req.query);
  res.status(200).json({ status: 'success', data: { report } });
});

