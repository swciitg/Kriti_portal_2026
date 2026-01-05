import { Router } from "express";
import { getPSById } from "../controllers/ps/public/getPSById.js";
import { getPS, getPSforConvener } from "../controllers/ps/public/getPS.js";
import { getPSProtected } from "../controllers/ps/protected/getPSProtected.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/protected").get(verifyJWT , handleRouteAccess , getPSProtected);
router.route("/a").get(getPSforConvener);
router.route("/:id").get(getPSById);
router.route("/").get(verifyJWT, getPS);

export default router;
