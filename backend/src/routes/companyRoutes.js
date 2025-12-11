import { Router } from "express";
import { getCompanyPS } from "../controllers/company/getCompanyPS.js";
import { saveSubmissionScores } from "../controllers/company/saveSubmissionScores.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/get-sub").get(verifyJWT, handleRouteAccess, getCompanyPS);
router.route("/save-sub").post(verifyJWT, handleRouteAccess, saveSubmissionScores);

export default router;
