import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from 'morgan';

import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
export default app;

// Config
dotenv.config({ path: "config/config.env" });

// Importing Routes
import employeeRoute from "./routes/employeeRoute.js";
import hardwareRoute from "./routes/hardwareRoute.js";
import softwareRoute from "./routes/softwareRoute.js";
import authRoute from "./routes/authRoute.js";

app.get("/api/v1",(req, res)=>{
  return res.json({message:"Server is running"})
})
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/hardware", hardwareRoute);
app.use("/api/v1/software", softwareRoute);
app.use("/api/v1/auth", authRoute);

// Error Middleware
app.use(errorMiddleware);
