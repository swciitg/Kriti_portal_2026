import { Router } from "express";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { GetTeamsForProblemStatement } from "../controllers/teams/getByProblemStatement.js";

const router = Router();

router.route("/:psId").get(verifyJWT , handleRouteAccess , GetTeamsForProblemStatement);

export default router;