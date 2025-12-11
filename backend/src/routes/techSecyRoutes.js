import {registerTeam} from "../controllers/techSecy/registerTeam.js"
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { Router } from "express";

const router = Router();

router
  .route("/register-team/:psId")
  .post(verifyJWT, handleRouteAccess, registerTeam);

export default router;
