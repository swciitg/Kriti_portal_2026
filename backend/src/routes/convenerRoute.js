import {Router} from "express";
import { OnBoardUser } from "../controllers/convener/createUser.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router()

router.route('/create-user').post(verifyJWT , handleRouteAccess , OnBoardUser);

export default router
