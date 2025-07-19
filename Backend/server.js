const app = require('./app');
const connectDB = require('./config/db');
const { startLotteryCloserJob } = require('./jobs/lotteryCloser');
require('dotenv').config();

// Connect to the database
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}.`);
});

startLotteryCloserJob();