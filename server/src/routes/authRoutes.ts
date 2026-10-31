import { Router } from 'express';
import {
  studentLogin,
  studentRegister,
  officerLogin,
  getCurrentUser,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/student/login', studentLogin);
router.post('/student/register', studentRegister);
router.post('/officer/login', officerLogin);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
