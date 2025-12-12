// src/routes/techsecyRoutes.js
import { Router } from "express";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { getOpenPS } from "../controllers/techsecy/getOpenPS.js";
import { registerTeam } from "../controllers/techsecy/registerTeam.js";
import { getTeamAndConfig } from "../controllers/techsecy/getTeamAndConfig.js";
import { getMyPS } from "../controllers/techsecy/getMyPS.js"; // small controller you add

const router = Router();

// PS open for registration
router.get(
  "/ps",
  verifyJWT,
  handleRouteAccess,   // should allow TECHSECY
  getOpenPS
);

// PS where this hostel already has team
router.get(
  "/my-ps",
  verifyJWT,
  handleRouteAccess,
  getMyPS
);

// register team (body contains psId)
router.post(
  "/team",
  verifyJWT,
  handleRouteAccess,
  registerTeam
);

// get team + config for submissions
router.get(
  "/team/:psId",
  verifyJWT,
  handleRouteAccess,
  getTeamAndConfig
);

export default router;
