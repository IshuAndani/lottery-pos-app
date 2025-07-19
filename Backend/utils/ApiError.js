class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // To distinguish our errors from programming bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;