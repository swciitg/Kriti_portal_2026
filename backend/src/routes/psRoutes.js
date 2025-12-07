import { Router } from "express";
import { getPSById } from "../controllers/ps/public/getPSById.js";
import { getPS } from "../controllers/ps/public/getPS.js";

const router = Router();

router.route("/:id").get(getPSById);
router.route("/").get(getPS);

export default router;
