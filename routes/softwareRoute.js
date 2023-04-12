import express from "express";
import {
  createSoftware,
  getAllSoftwares,
  getSoftware,
  updateSoftware,
  softDeleteSoftware,
  softwareAssign,
  softwareUnassign,
  unassignSoftwareIds,
} from "../controllers/softwareController.js";
import { isAuthenticatedUser } from "../middleware/authentication.js";

const router = express.Router();

router.post("/new", isAuthenticatedUser, createSoftware);

router.get("/all", isAuthenticatedUser, getAllSoftwares);

router.get("/get/:id", isAuthenticatedUser, getSoftware);

router.put("/update/:id", isAuthenticatedUser, updateSoftware);

router.put("/remove/:id", isAuthenticatedUser, softDeleteSoftware);

router.put("/assign/:id", isAuthenticatedUser, softwareAssign);

router.put("/unassign/:id", isAuthenticatedUser, softwareUnassign);

router.get("/unassign/all", isAuthenticatedUser, unassignSoftwareIds);

export default router;
