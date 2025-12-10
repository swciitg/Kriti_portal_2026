import { Router } from "express";
import { getJudgePS } from "../controllers/judge/getJudgePS.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/get-ps").get(verifyJWT, handleRouteAccess, getJudgePS);

export default router;