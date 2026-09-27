// Simple app-level error class the controllers can throw
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
  });
}

module.exports = { ApiError, notFound, errorHandler };
