import {Router} from 'express'
import { SignIn } from '../controllers/auth/signIn.js';
import { LogOut } from '../controllers/auth/logout.js';
import { verifyJWT } from '../middlewares/auth.js';

const router = Router();

router.route('/sign-in').post(SignIn);
router.route('/logout').get(verifyJWT , LogOut);

export default router