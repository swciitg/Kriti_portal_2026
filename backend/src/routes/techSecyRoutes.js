import { Router } from "express";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { registerTeam } from "../controllers/techSecy/registerTeam.js";
import { GetTeamsForProblemStatement } from "../controllers/teams/getByProblemStatement.js";
import { editRegisteredTeam } from "../controllers/techSecy/editRegisteredTeam.js";

const router = Router();

router
  .route("/register-team/:psId")
  .post(verifyJWT, handleRouteAccess, registerTeam);
router
  .route("/get-team/:psId")
  .get(verifyJWT, handleRouteAccess, GetTeamsForProblemStatement);
router
  .route("/edit-registered-team/:psId")
  .post(verifyJWT, handleRouteAccess, editRegisteredTeam);

export default router;
