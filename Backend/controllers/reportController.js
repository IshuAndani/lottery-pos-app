const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');

// --- Admin Controllers ---
exports.getLotteryReport = asyncHandler(async (req, res, next) => {
  const { lotteryId } = req.params;
  const { startDate, endDate } = req.query;
  const report = await reportService.getLotteryFinancials(lotteryId, startDate, endDate);
  res.status(200).json({ status: 'success', data: { report } });
});

exports.getAdminSummaryReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const report = await reportService.getSystemSummaryByDate(startDate, endDate);
  res.status(200).json({ status: 'success', data: { report } });
});

exports.getAgentsReport = asyncHandler(async (req, res, next) => {
  const agents = await reportService.getAllAgentBalances();
  res.status(200).json({ status: 'success', results: agents.length, data: { agents } });
});

exports.getAgentTicketsReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const report = await reportService.getAgentTicketsReport(startDate, endDate);
  res.status(200).json({ status: 'success', results: report.length, data: { report } });
});

exports.getTicketsSoldByDate = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, limit } = req.query;
  const report = await reportService.getTicketsSoldByDate(startDate, endDate, limit);
  res.status(200).json({ status: 'success', results: report.length, data: { report } });
});

// --- Agent Controllers ---
exports.getAgentReport = asyncHandler(async (req, res, next) => {
  const report = await reportService.getAgentDashboard(req.user.id, req.query);
  res.status(200).json({ status: 'success', data: { report } });
});