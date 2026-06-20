import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../utils/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validators.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';
import { authLimiter } from '../middleware/rateLimiters.js';

const router = Router();

// Frontend fetches a CSRF token here once on load, before any mutating call.
router.get('/csrf-token', authController.csrfToken);
router.post('/register', authLimiter, verifyCsrf, validate(registerSchema), authController.register);
router.post('/login', authLimiter, verifyCsrf, validate(loginSchema), authController.login);
router.post('/logout', requireAuth, verifyCsrf, authController.logout);
router.get('/me', requireAuth, authController.me);
router.post('/forgot-password', authLimiter, verifyCsrf, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, verifyCsrf, validate(resetPasswordSchema), authController.resetPassword);

export default router;
