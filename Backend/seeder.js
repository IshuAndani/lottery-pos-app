const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// Load models
const User = require('./models/userModel');
const Lottery = require('./models/lotteryModel');
const Ticket = require('./models/ticketModel');
const Transaction = require('./models/transactionModel');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Read JSON files
const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'));
const lotteries = JSON.parse(fs.readFileSync(`${__dirname}/data/lotteries.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
  try {
    await User.create(users); // The pre-save hook in userModel will hash passwords
    await Lottery.create(lotteries);
    console.log('✅ Data successfully imported!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    console.log('🗑️ Deleting all data...');
    await User.deleteMany();
    await Lottery.deleteMany();
    await Ticket.deleteMany();
    await Transaction.deleteMany();
    console.log('✅ Data successfully deleted!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
    console.log('Please specify --import or --delete flag.');
    process.exit();
}