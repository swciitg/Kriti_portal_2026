import { Router } from "express";
import { getPSById } from "../controllers/ps/public/getPSById.js";
import { getPS } from "../controllers/ps/public/getPS.js";
import { getPSProtected } from "../controllers/ps/protected/getPSProtected.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/protected").get(verifyJWT , handleRouteAccess , getPSProtected);
router.route("/:id").get(getPSById);
router.route("/").get(getPS);

export default router;
