import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { validate, registerSchema, loginSchema } from '../validators/authValidator.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Stricter rate limit for auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register requests per windowMs
  message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' },
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
