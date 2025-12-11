import { Router } from "express";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { registerTeam } from "../controllers/techSecy/registerTeam.js";

const router = Router();

router.route("/register-team").post(verifyJWT , handleRouteAccess , registerTeam);

export default router;