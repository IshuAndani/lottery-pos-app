const ticketService = require('../services/ticketService');
const asyncHandler = require('../utils/asyncHandler');

exports.createTicket = asyncHandler(async (req, res, next) => {
  const { lotteryId, bets, period } = req.body;
  const agentId = req.user.id; // From the protect middleware
  console.log('Creating ticket for agent:', agentId, 'with bets:', bets);
  const ticket = await ticketService.sellTicket(lotteryId, agentId, bets, period);

  res.status(201).json({
    status: 'success',
    data: { ticket },
  });
});

exports.getTicketByTicketId = asyncHandler(async (req, res, next) => {
  const ticket = await ticketService.checkTicketStatus(req.params.ticketId);
  res.status(200).json({
    status: 'success',
    data: { ticket },
  });
});

exports.payoutWinningTicket = asyncHandler(async (req, res, next) => {
  const agentId = req.user.id;
  const ticket = await ticketService.payoutTicket(req.params.ticketId, agentId);

  res.status(200).json({
    status: 'success',
    message: `Successfully paid out ${ticket.payoutAmount}.`,
    data: { ticket },
  });
});