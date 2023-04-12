import ErrorHandler from "../middleware/errorHandler.js";
import { asyncError } from "../middleware/errorMiddleware.js";
import { User } from "../models/userModel.js";
import sendToken from "../utils/jwtToken.js";

// Register Functionality
export const register = asyncError(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username) {
    return next(new ErrorHandler("Please Enter Username", 400));
  }
  if (!email) {
    return next(new ErrorHandler("Please Enter Email", 400));
  }
  if (!password) {
    return next(new ErrorHandler("Please Enter Password", 400));
  }

  const isSameUsernameExist = await User.findOne({ username });

  if (isSameUsernameExist) {
    return next(new ErrorHandler("Username is already Exists", 400));
  }

  const isSameEmailExist = await User.findOne({ email });

  if (isSameEmailExist) {
    return next(new ErrorHandler("Email is already Exists", 400));
  }

  const newUser = new User({
    username,
    email,
    password,
  });

  await newUser.save();

  sendToken(newUser, 201, res, "Register Successfully");
});

// Login Functionality
export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Checking if user has entered email and password
  if (!email) {
    return next(new ErrorHandler("Please Enter email", 400));
  }

  if (!password) {
    return next(new ErrorHandler("Please Enter Password", 400));
  }

  // Comparing entered email and password with Database if it is exist or not
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Comparing entered password and database password if it is same or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res, "Login Successfully");
});

// Logout Functionality
export const logout = asyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
