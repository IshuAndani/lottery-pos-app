const moment = require('moment-timezone');
const Lottery = require('../models/lotteryModel');
const Ticket = require('../models/ticketModel');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

// --- Admin Reports ---

// Report for a single lottery's performance
exports.getLotteryFinancials = async (lotteryId, startDate, endDate) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery) throw new ApiError(404, 'Lottery not found.');

  const tz = 'America/New_York';
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: moment.tz(startDate, tz).startOf('day').toDate(),
      $lte: moment.tz(endDate, tz).endOf('day').toDate(),
    };
  }

  const revenueAggregation = await Ticket.aggregate([
    { $match: { lottery: lottery._id, status: { $ne: 'void' }, ...dateFilter } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);

  const payoutAggregation = await Ticket.aggregate([
    { $match: { lottery: lottery._id, isWinner: true, ...dateFilter } },
    { $group: { _id: null, totalPayouts: { $sum: '$payoutAmount' } } },
  ]);

  const commissionAggregation = await Transaction.aggregate([
    { $match: { relatedLottery: lottery._id, type: 'commission', ...dateFilter } },
    { $group: { _id: null, totalCommissions: { $sum: '$amount' } } },
  ]);

  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
  const totalPayouts = payoutAggregation[0]?.totalPayouts || 0;
  const totalCommissions = commissionAggregation[0]?.totalCommissions || 0;
  const netProfit = totalRevenue - totalPayouts - totalCommissions;

  return {
    lotteryName: lottery.name,
    status: lottery.status,
    ticketsSold: await Ticket.countDocuments({ lottery: lottery._id, status: { $ne: 'void' }, ...dateFilter }),
    totalRevenue,
    totalPayouts,
    totalCommissions,
    netProfit,
  };
};

// Report for all agent balances
exports.getAllAgentBalances = async () => {
  const agents = await User.find({ role: 'agent' }).select('name email balance status');
  return agents;
};

// New: Report for tickets sold per agent
exports.getAgentTicketsReport = async (startDate, endDate) => {
  const tz = 'America/New_York';
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: moment.tz(startDate, tz).startOf('day').toDate(),
      $lte: moment.tz(endDate, tz).endOf('day').toDate(),
    };
  }

  const agents = await User.find({ role: 'agent' }).select('name email').lean();
  const ticketCounts = await Ticket.aggregate([
    { $match: { status: { $ne: 'void' }, ...dateFilter } },
    { $group: { _id: '$agent', totalTickets: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
    { $unwind: '$agent' },
    { $project: { agentName: '$agent.name', agentEmail: '$agent.email', totalTickets: 1, totalAmount: 1 } },
  ]);

  // Merge agents with ticket counts, including agents with zero tickets
  return agents.map(agent => {
    const ticketData = ticketCounts.find(tc => tc.agentEmail === agent.email) || {
      totalTickets: 0,
      totalAmount: 0,
    };
    return {
      agentName: agent.name,
      agentEmail: agent.email,
      totalTickets: ticketData.totalTickets,
      totalAmount: ticketData.totalAmount,
    };
  });
};

// New: Report for tickets sold in a date range
exports.getTicketsSoldByDate = async (startDate, endDate, limit = 50) => {
  const tz = 'America/New_York';
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: moment.tz(startDate, tz).startOf('day').toDate(),
      $lte: moment.tz(endDate, tz).endOf('day').toDate(),
    };
  }

  const tickets = await Ticket.find({ status: { $ne: 'void' }, ...dateFilter })
    .populate('lottery', 'name')
    .populate('agent', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  return tickets.map(ticket => ({
    ticketId: ticket.ticketId,
    lotteryName: ticket.lottery?.name || 'Unknown',
    agentName: ticket.agent?.name || 'Unknown',
    agentEmail: ticket.agent?.email || 'Unknown',
    totalAmount: ticket.totalAmount,
    purchaseDate: moment(ticket.createdAt).tz(tz).toISOString(),
    period: ticket.period,
    status: ticket.status,
  }));
};

// Report for system-wide summary
exports.getSystemSummaryByDate = async (startDate, endDate) => {
  const tz = 'America/New_York';
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: moment.tz(startDate, tz).startOf('day').toDate(),
      $lte: moment.tz(endDate, tz).endOf('day').toDate(),
    };
  }

  const revenueAggregation = await Ticket.aggregate([
    { $match: { status: { $ne: 'void' }, ...dateFilter } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);

  const financialsAggregation = await Transaction.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);

  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
  let totalPayouts = 0;
  let totalCommissions = 0;

  financialsAggregation.forEach(item => {
    if (item._id === 'payout') totalPayouts = Math.abs(item.total);
    if (item._id === 'commission') totalCommissions = item.total;
  });

  const netProfit = totalRevenue - totalPayouts - totalCommissions;

  return { startDate, endDate, totalRevenue, totalPayouts, totalCommissions, netProfit };
};

// --- Agent Reports ---

// Dashboard for a single agent
exports.getAgentDashboard = async (agentId, query) => {
  const { startDate, endDate } = query;
  const agent = await User.findById(agentId);
  const tz = 'America/New_York';
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: moment.tz(startDate, tz).startOf('day').toDate(),
      $lte: moment.tz(endDate, tz).endOf('day').toDate(),
    };
  }

  const matchFilter = { agent: agent._id, ...dateFilter };

  const stats = await Transaction.aggregate([
    { $match: matchFilter },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);

  const soldTicketsCount = await Ticket.countDocuments(matchFilter);
  const salesAgg = await Ticket.aggregate([
    { $match: matchFilter },
    { $group: { _id: null, totalSalesAmount: { $sum: '$totalAmount' } } }
  ]);

  let totalCommissions = 0;
  let totalPayouts = 0;

  stats.forEach(stat => {
    if (stat._id === 'commission') totalCommissions = stat.total;
    if (stat._id === 'payout') totalPayouts = Math.abs(stat.total);
  });

  return {
    currentBalance: agent.balance,
    period: (startDate && endDate) ? { startDate, endDate } : 'Overall',
    soldTicketsCount,
    totalSalesAmount: salesAgg[0]?.totalSalesAmount || 0,
    totalCommissions,
    totalPayouts,
  };
};

// Recent tickets for a single agent
exports.getAgentRecentTickets = async (agentId, limit = 10) => {
  const tickets = await Ticket.find({ agent: agentId, status: { $ne: 'void' } })
    .populate('lottery', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  return tickets.map(ticket => ({
    ticketId: ticket.ticketId,
    lotteryName: ticket.lottery?.name || 'Unknown',
    totalAmount: ticket.totalAmount,
    createdAt: ticket.createdAt,
    status: ticket.status,
    period: ticket.period,
  }));
};