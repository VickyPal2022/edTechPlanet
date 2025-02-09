import express from 'express';
import { signup, login, logout, purchasedCourses} from '../controllers/user.controller.js';
import userMiddleware from '../middlewares/user.middleware.js';

const router = express.Router();

router.post('/signup',signup);
router.post('/login',login);
router.get('/logout',logout);
router.get('/purchased',userMiddleware, purchasedCourses);

export default router;