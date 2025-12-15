import { Router } from "express";
import { getJudgePS } from "../controllers/judge/getJudgePS.js";
import { savePPTScores } from "../controllers/judge/savePPTScores.js";
import { submitMarksRequest } from "../controllers/judge/submitMarksRequest.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/get-ps").get(verifyJWT, handleRouteAccess, getJudgePS);
router.route("/save-ppt-scores").post(verifyJWT, handleRouteAccess, savePPTScores);
router.route("/submit-marks-request").post(verifyJWT, handleRouteAccess, submitMarksRequest);

export default router;
