import { Router } from "express";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { GetSubmissionsForProblemStatement } from "../controllers/submissions/getByProblemStatement.js";

const router = Router();

router.route("/get-all/:psId").get(verifyJWT , handleRouteAccess , GetSubmissionsForProblemStatement);

export default router;