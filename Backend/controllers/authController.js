const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const signToken = id => {
  const expiry = `${process.env.JWT_EXPIRES_IN}d`;
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiry || '90d', // Token expires in 90 days
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieExpiresInDays = Number(process.env.JWT_EXPIRES_IN) || 90;

  const cookieOptions = {
    // Expiry should be a Date object
    expires: new Date(
      Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cannot be accessed or modified by the browser
    secure: process.env.NODE_ENV === 'production', // Only sent on HTTPS
    sameSite: 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    // The token is no longer sent in the response body
    data: {
      user,
    },
  });
};

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide email and password!'));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  // We need to implement password comparison here.
  // NOTE: We haven't added password hashing yet. We'll add it now in the userModel.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError(401, 'Incorrect email or password.'));
  }

  // 3) If everything is ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  // To log out, we just send a cookie with a dummy value and a short expiry
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// A route for the logged-in user to get their own data.
// It leverages the user ID attached by the 'protect' middleware.
exports.getMe = (req, res, next) => {
  // The 'protect' middleware should have already fetched the full user document
  // and attached it to req.user. We can just send it back.
  const user = req.user;

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};