import express from "express";
import {
  createHardware,
  getAllHardwares,
  getHardware,
  updateHardware,
  softDeleteHardware,
  hardwareAssign,
  hardwareUnassign,
  unassignAllHardwares,
  dashbaordInfo,
} from "../controllers/hardwareController.js";
import { isAuthenticatedUser } from "../middleware/authentication.js";

const router = express.Router();

router.post("/new", isAuthenticatedUser, createHardware);

router.get("/all", isAuthenticatedUser, getAllHardwares);

router.get("/get/:id", isAuthenticatedUser, getHardware);

router.put("/remove/:id", isAuthenticatedUser, softDeleteHardware);

router.put("/update/:id", isAuthenticatedUser, updateHardware);

router.put("/assign/:id", isAuthenticatedUser, hardwareAssign);

router.put("/unassign/:id", isAuthenticatedUser, hardwareUnassign);

router.get("/unassign/all", isAuthenticatedUser, unassignAllHardwares);

router.get("/dashboard", isAuthenticatedUser, dashbaordInfo);

export default router;
