const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

module.exports = { sendResponse };