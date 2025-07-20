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
// Allow for all origins for CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://dist-lake-theta.vercel.app','https://lottery-pos-app-1.onrender.com/'], // Replace with your frontend URL (e.g., React app)
  credentials: true, // Allow cookies/auth headers
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