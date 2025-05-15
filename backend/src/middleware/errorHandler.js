const { status } = require('http-status');

const errorHandler = (err, _, res, __) => {
  console.error(err);

  const statusCode = err?.statusCode || status.INTERNAL_SERVER_ERROR || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
