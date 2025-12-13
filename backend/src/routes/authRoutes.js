import {Router} from 'express'
import { SignIn } from '../controllers/auth/signIn.js';
import { LogOut } from '../controllers/auth/logout.js';
import { verifyJWT } from '../middlewares/auth.js';
import { RequestChange , ResetPassword } from '../controllers/auth/resetPassword.js';

const router = Router();

router.route('/sign-in').post(SignIn);
router.route('/logout').get(verifyJWT , LogOut);
router.route('/request-password-change').post(RequestChange);
router.route('/reset-password').post(ResetPassword);

export default router