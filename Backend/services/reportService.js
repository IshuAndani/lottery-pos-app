const Lottery = require('../models/lotteryModel');
const Ticket = require('../models/ticketModel');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

// --- Admin Reports ---

// Report for a single lottery's performance
exports.getLotteryFinancials = async (lotteryId) => {
  const lottery = await Lottery.findById(lotteryId);
  if (!lottery) throw new ApiError(404, 'Lottery not found.');

  const revenueAggregation = await Ticket.aggregate([
    { $match: { lottery: lottery._id } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
  ]);

  const payoutAggregation = await Ticket.aggregate([
    { $match: { lottery: lottery._id, isWinner: true } },
    { $group: { _id: null, totalPayouts: { $sum: '$payoutAmount' } } }
  ]);

  const commissionAggregation = await Transaction.aggregate([
    { $match: { relatedLottery: lottery._id, type: 'commission' } },
    { $group: { _id: null, totalCommissions: { $sum: '$amount' } } }
  ]);
  
  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
  const totalPayouts = payoutAggregation[0]?.totalPayouts || 0;
  const totalCommissions = commissionAggregation[0]?.totalCommissions || 0;
  const netProfit = totalRevenue - totalPayouts - totalCommissions;

  return {
    lotteryName: lottery.name,
    status: lottery.status,
    ticketsSold: lottery.ticketsSold,
    totalRevenue,
    totalPayouts,
    totalCommissions,
    netProfit
  };
};

// Report for all agent balances
exports.getAllAgentBalances = async () => {
  const agents = await User.find({ role: 'agent' }).select('name email balance status');
  return agents;
};

// --- Agent Reports ---

// Dashboard for a single agent
exports.getAgentDashboard = async (agentId, query) => {
  const { startDate, endDate } = query;
  const agent = await User.findById(agentId);

  // --- Build the date filter if dates are provided ---
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  // The match filter will include the agent and optionally the date range
  const matchFilter = { agent: agent._id, ...dateFilter };

  const stats = await Transaction.aggregate([
    { $match: matchFilter },
    { 
      $group: { 
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  const soldTicketsCount = await Ticket.countDocuments(matchFilter);

  let totalCommissions = 0;
  let totalPayouts = 0;

  stats.forEach(stat => {
    if (stat._id === 'commission') totalCommissions = stat.total;
    if (stat._id === 'payout') totalPayouts = Math.abs(stat.total);
  });
  
  // The balance is always the live, current balance.
  // The other stats are for the specified period.
  return {
    currentBalance: agent.balance,
    period: (startDate && endDate) ? { startDate, endDate } : 'Overall',
    soldTicketsCount,
    totalCommissions,
    totalPayouts
  };
};

exports.getSystemSummaryByDate = async (startDate, endDate) => {
  const dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };

  const revenueAggregation = await Ticket.aggregate([
    { $match: dateFilter },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
  ]);

  const financialsAggregation = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
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