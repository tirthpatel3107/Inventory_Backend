import ErrorHandler from "./errorHandler.js";
import { asyncError } from "./errorMiddleware.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticatedUser = asyncError(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new ErrorHandler("Please login to acccess this resource", 401));
  }

  const decodedData = jwt.verify(
    authorization.split(" ")[1],
    process.env.JWT_SECRET
  );

  req.user = await User.findById(decodedData.id);

  next();
});
