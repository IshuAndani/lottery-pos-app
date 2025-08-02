const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  numbers: {
    type: [String],
    required: true,
  },
  amounts: {
    type: [Number],
    required: true
  },
  betType: {
    type: String,
    enum: ['bolet', 'mariage', 'play3', 'play4'],
    required: true
  },
  state: {
    type: String,
    required: true,
    default: 'haiti',
    validate: {
      validator: function (v) {
        return ['bolet', 'mariage'].includes(this.betType) ? v === 'haiti' : true;
      },
      message: 'State must be "haiti" for bolet and mariage bets'
    }
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate total bet amount
betSchema.virtual('totalBetAmount').get(function () {
  return this.amounts.reduce((sum, amt) => sum + (amt || 0), 0);
});

const ticketSchema = new mongoose.Schema({
  ticketId: {
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
  period: {
    type: String,
    enum: ['matin', 'soir'],
    required: true
  },
  bets: [betSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [1, 'Total amount must be at least 1'],
    validate: {
      validator: function (v) {
        const calculatedTotal = this.bets.reduce((sum, bet) => sum + bet.totalBetAmount, 0);
        return v === calculatedTotal;
      },
      message: 'Total amount must equal the sum of all bet amounts'
    }
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