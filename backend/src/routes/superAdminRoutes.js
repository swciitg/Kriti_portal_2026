import {Router} from "express";
import { SignIn } from "../controllers/superadmin/signIn.js";

const router = Router()

router.route("/sign-in").post(SignIn);

export default router
