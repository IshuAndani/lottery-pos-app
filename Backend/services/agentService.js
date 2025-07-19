const User = require('../models/userModel');
const mongoose = require("mongoose");
const Transaction = require('../models/transactionModel');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

exports.createAgent = async (agentData) => {
  // Generate a random password if one isn't provided.
  const temporaryPassword = agentData.password || crypto.randomBytes(8).toString('hex');

  // Create the agent. The password will be hashed by the pre-save hook in userModel.
  const newAgent = await User.create({
    ...agentData,
    role: 'agent',
    password: temporaryPassword,
  });

  // After creating the user, send them their credentials via email.
  try {
    const message = `Welcome to the Lottery POS system!\n\nYour agent account has been created.\n\nEmail: ${newAgent.email}\nPassword: ${temporaryPassword}\n\nPlease change your password after your first login.`;

    await sendEmail({
      from: 'Lottery POS Admin <admin@lottery.com>',
      to: newAgent.email,
      subject: 'Your Lottery POS Agent Account Credentials',
      message,
    });
  } catch (error) {
    // If email fails, the user is still created. Log the error for the admin.
    // In a real app, you might want a more robust retry mechanism or notification system.
    console.error(`Failed to send welcome email to ${newAgent.email}:`, error);
    // We don't want to fail the whole agent creation process if the email fails.
    // The admin can manually provide the password.
  }

  return newAgent;
};

exports.getAllAgents = async () => {
  const agents = await User.find({ role: 'agent' });
  return agents;
};

exports.updateAgentDetails = async (agentId, updateData) => {
    // Ensure password and role cannot be updated through this service
    const filteredData = { ...updateData };
    delete filteredData.password;
    delete filteredData.role;

    const agent = await User.findByIdAndUpdate(agentId, filteredData, {
      new: true,
      runValidators: true,
    });
    return agent;
};

exports.deactivateAgent = async (agentId) => {
  const agent = await User.findByIdAndUpdate(
    agentId,
    { status: 'deactivated' },
    { new: true }
  );
  return agent;
};

//agentServices.js
exports.settleAgentBalance = async (agentId, amount, adminId, description) => {
  // Step 1: Find the agent
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new ApiError(404, 'Agent not found.');
  }

  try {
    // Step 2: Create a transaction record for auditing
    await Transaction.create({
      agent: agentId,
      type: 'settlement',
      amount: amount,
      description: description || `Settlement recorded by admin ${adminId}.`,
    });

    // Step 3: Update agent balance
    agent.balance -= amount;
    await agent.save();

  }catch (error) {
    // If either operation fails
    throw new ApiError(500, 'Settlement failed to record.');
  }

  return agent;
};