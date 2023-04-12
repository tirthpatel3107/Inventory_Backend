export const errorMiddleware = (err, req, res, next) => {
  const errorMessage = err.message || "Internal Server Error";
  const errorStatus = err.statusCode || 500;
  const errorStack = err.stack;

  res.status(errorStatus).json({
    success: false,
    error: {
      status: errorStatus,
      message: errorMessage,
      description: errorStack,
    },
  });
};

export const asyncError = (passedFunction) => (req, res, next) => {
  Promise.resolve(passedFunction(req, res, next)).catch(next);
};
