const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  numbers: {
    type: [String], // For mariage: ["12", "56"], for bolet: ["12"]
    required: true,
    validate: v => Array.isArray(v) && v.length > 0 && v.length <= 2
  },
  amount: {
    type: Number,
    required: true,
  },
  betType: {
    type: String,
    enum: ['bolet', 'mariage'],
    required: true
  }
});

const ticketSchema = new mongoose.Schema({
  ticketId: { // A custom, human-readable ID
    type: String,
    required: true,
    unique: true,
  },
  lottery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lottery',
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bets: [betSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  isWinner: {
    type: Boolean,
    default: false,
  },
  payoutAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'paid_out', 'void'],
    default: 'active',
  },
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;