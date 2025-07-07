const mongoose = require('mongoose');

const lotterySchema = new mongoose.Schema({
  // A flexible name for the lottery draw.
  name: {
    type: String,
    required: [true, 'Lottery name is required.'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'completed'],
    default: 'open',
  },
  // Defines the payout multipliers for different bet types.
  // Example: { 'bolet': 50, 'mariage': 1000 }
  // payoutRules: {
  //   type: Map,
  //   of: Number,
  //   required: true,
  // },
  payoutRule : {
    type : Number,
    required : true,
  },
  // A simple array of winning numbers declared by the admin.
  winningNumbers: {
    type: [String],
    default: [],
  },
  drawDate: {
    type: Date,
    required: true,
  },
  // NEW: Defines the valid range for numbers that can be bet on.
  // Example: { min: 0, max: 99 }
  validNumberRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  // NEW: A counter for the total number of tickets sold for this lottery.
  ticketsSold: {
    type: Number,
    default: 0,
  },
  numberOfWinningNumbers: {
    type: Number,
    required: [true, 'The number of winning numbers is required.'],
  },
}, { timestamps: true });

const Lottery = mongoose.model('Lottery', lotterySchema);
module.exports = Lottery;