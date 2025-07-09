const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendTokenResponse } = require('../utils/authUtil');

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
  sendTokenResponse(user, 200, res);
});

exports.logout = (req, res) => {
  // To log out, we just send a cookie with a dummy value and a short expiry
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
  }
  res.cookie('jwt', 'loggedout', cookieOptions);
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