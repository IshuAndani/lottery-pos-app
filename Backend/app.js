const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const ApiError = require('./utils/ApiError');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const userRouter = require('./routes/userRoutes');
const lotteryRouter = require('./routes/lotteryRoutes');
const ticketRouter = require('./routes/ticketRoutes');
const reportRouter = require('./routes/reportRoutes'); 
const printerRouter = require('./routes/printerRoutes');

// Initialize express app
const app = express();

// --- Global Middlewares ---
// Use environment variable for CORS origin in production
app.enable('trust proxy');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true                // This allows cookies to be sent and received
}));
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(cookieParser());

// --- Routes ---

app.use('/api/v1/users', userRouter); 
app.use('/api/v1/lotteries', lotteryRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/reports', reportRouter); 
app.use('/api/v1/printers', printerRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Lottery POS API!',
  });
});



// We will add API routes here in Step 3
// Example: app.use('/api/v1/users', userRouter);

// Handle all unhandled routes
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handling Middleware (must be the last middleware)
app.use(globalErrorHandler);

module.exports = app;