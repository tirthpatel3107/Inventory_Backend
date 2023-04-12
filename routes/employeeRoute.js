import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  softDeleteEmployee,
  employeesList,
  employeesListById,
  dashbaordInfo,
} from "../controllers/employeeController.js";
import { isAuthenticatedUser } from "../middleware/authentication.js";

const router = express.Router();

router.post("/new", isAuthenticatedUser, createEmployee);

router.get("/all", isAuthenticatedUser, getAllEmployees);

router.get("/get/:id", isAuthenticatedUser, getEmployee);

router.put("/update/:id", isAuthenticatedUser, updateEmployee);

router.put("/remove/:id", isAuthenticatedUser, softDeleteEmployee);

router.get("/list", isAuthenticatedUser, employeesList);

router.get("/list/:id", isAuthenticatedUser, employeesListById);

router.get("/dashboard", isAuthenticatedUser, dashbaordInfo);

export default router;
