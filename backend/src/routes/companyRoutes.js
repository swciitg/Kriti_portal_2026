import { Router } from "express";
import { getCompanyPS } from "../controllers/company/getCompanyPS.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/get-sub").get(verifyJWT, handleRouteAccess, getCompanyPS);

export default router;
