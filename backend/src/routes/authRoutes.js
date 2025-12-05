import {Router} from 'express'
import { SignIn } from '../controllers/auth/signIn.js';
import { LogOut } from '../controllers/auth/logout.js';

const router = Router();

router.route('/sign-in').post(SignIn);
router.route('/logout').get(LogOut);

export default router