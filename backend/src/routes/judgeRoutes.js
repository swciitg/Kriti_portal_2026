import { Router } from "express";
import { getJudgePS } from "../controllers/judge/getJudgePS.js";
import { savePPTScores } from "../controllers/judge/savePPTScores.js";
import { submitMarksRequest } from "../controllers/judge/submitMarksRequest.js";
import { getJudgeStatus } from "../controllers/judge/getStatus.js";
import { requestAccess } from "../controllers/judge/requestAccess.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/get-ps").get(verifyJWT, handleRouteAccess, getJudgePS);
router.route("/save-ppt-scores").post(verifyJWT, handleRouteAccess, savePPTScores);
router.route("/submit-marks-request").post(verifyJWT, handleRouteAccess, submitMarksRequest);
router.route("/status").get(verifyJWT, handleRouteAccess, getJudgeStatus);
router.route("/request-access").post(verifyJWT, handleRouteAccess, requestAccess);

export default router;
