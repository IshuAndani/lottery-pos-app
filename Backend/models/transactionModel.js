const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  },
  type: {
    type: String,
    enum: ['commission', 'payout', 'settlement'], // Types of financial transactions
    required: true,
  },
  amount: { // Can be positive (commission) or negative (payout)
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  relatedLottery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lottery',
  },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;