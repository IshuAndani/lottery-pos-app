const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Creates a JWT, sets it in an HTTP-only cookie with production-safe options,
 * and sends the final response.
 * @param {object} user - The user object from the database.
 * @param {number} statusCode - The HTTP status code for the response.
* @param {import('express').Response} res - The Express response object.
 */
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side JS from accessing the cookie
  };

  // For deployed apps, cookies MUST be secure and allow cross-site usage.
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; // Only send cookie over HTTPS
    cookieOptions.sameSite = 'none'; // Allow cross-origin cookie
  }

  res.cookie('jwt', token, cookieOptions);

  // Remove password from the output before sending user data
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};

