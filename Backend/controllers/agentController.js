const agentService = require('../services/agentService');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/userModel');
const ApiError = require('../utils/ApiError');

// Admin creates an agent
exports.createAgent = asyncHandler(async (req, res, next) => {
  const agent = await agentService.createAgent(req.body);
  // Don't send back password in the response
  agent.password = undefined;
  res.status(201).json({
    status: 'success',
    data: { agent },
  });
});

// Admin gets all agents
exports.getAllAgents = asyncHandler(async (req, res, next) => {
  const agents = await agentService.getAllAgents();
  res.status(200).json({
    status: 'success',
    results: agents.length,
    data: { agents },
  });
});

// Admin updates an agent
exports.updateAgent = asyncHandler(async (req, res, next) => {
  const agent = await agentService.updateAgentDetails(req.params.id, req.body);

  if (!agent) {
    return next(new ApiError(404, 'No agent found with that ID.'));
  }

  res.status(200).json({
    status: 'success',
    data: { agent },
  });
});

exports.deactivateAgent = asyncHandler(async (req, res, next) => {
  const agent = await agentService.deactivateAgent(req.params.id);
  if (!agent) {
    return next(new ApiError(404, 'No agent found with that ID.'));
  }
  res.status(200).json({
    status: 'success',
    message: 'Agent has been deactivated.',
    data: { agent },
  });
});

exports.settleBalance = asyncHandler(async (req, res, next) => {
  const { amount, description } = req.body;
  const adminId = req.user.id;
  const agentId = req.params.id;

  if (!amount || amount === 0) {
    return next(new ApiError(400, 'Please provide a non-zero settlement amount.'));
  }

  const agent = await agentService.settleAgentBalance(agentId, amount, adminId, description);

  res.status(200).json({
    status: 'success',
    message: `Settlement of ${amount} recorded successfully. New balance is ${agent.balance}.`,
    data: { agent },
  });
});

// agentController.js
exports.deleteAgent = asyncHandler(async (req, res, next) => {
  const agentId = req.params.id;
  const agent = await agentService.deleteAgent(agentId);

  if (!agent) {
    return next(new ApiError(404, 'No agent found with that ID.'));
  }

  res.status(200).json({
    status: 'success',
    message: 'Agent has been deleted.',
    data: null,
  });
});