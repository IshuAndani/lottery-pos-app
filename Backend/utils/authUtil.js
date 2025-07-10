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

  // Remove password from the output before sending user data
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token, // Send the token in the response body
    data: {
      user,
    },
  });
};
