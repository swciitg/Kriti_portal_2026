import {Router} from "express";
import { SignIn } from "../controllers/superadmin/signIn.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { GetInfo } from "../controllers/superadmin/getInfo.js";
import { GetPoints } from "../controllers/superadmin/getPoints.js";

const router = Router()

router.route("/sign-in").post(SignIn);
router.route("/get-info").get(verifyJWT , handleRouteAccess , GetInfo);
router.route("/get-points").get(verifyJWT , handleRouteAccess , GetPoints);

export default router
