export const successHandler = (successMsg, statusCode, res, successData) => {
  return res.status(statusCode).json({
    success: true,
    message: successMsg,
    data: successData,
  });
};

export const successHandlerWithoutData = (successMsg, statusCode, res) => {
  return res.status(statusCode).json({
    success: true,
    message: successMsg,
  });
};
