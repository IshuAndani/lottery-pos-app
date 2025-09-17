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
  payoutRules: {
    type: Map,
    of: Number,
    required: true,
    default: { bolet: 50, mariage: 1000, play3: 500, play4: 5000 }
  },
  // Per-bet-type min/max limits for wager amounts
  // Example: { bolet: { min: 1, max: 100 }, mariage: { min: 1, max: 25 } }
  betLimits: {
    type: Object,
    required: false,
    default: {
      bolet: { min: 1, max: 100 },
      mariage: { min: 1, max: 25 },
      play3: { min: 1, max: 25 },
      play4: { min: 1, max: 20 },
    },
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
  // Maximum allowed total amount sold per number, per bet type
  // Can be provided as an object with keys per bet type.
  // Example: { bolet: 50, mariage: 50, play3: 50, play4: 50 }
  maxPerNumber: {
    type: Object,
    required: false,
    default: {
      bolet: 50,
      mariage: 50,
      play3: 50,
      play4: 50,
    }
  },
  numberOfWinningNumbers: {
    type: Number,
    required: [true, 'The number of winning numbers is required.'],
  },
  // NEW: List of states where the lottery is available
  states: {
    type: [String],
    required: [true, 'At least one state must be specified.'],
    default: [],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'At least one state must be specified.'
    }
  }
}, { timestamps: true });

const Lottery = mongoose.model('Lottery', lotterySchema);
module.exports = Lottery;