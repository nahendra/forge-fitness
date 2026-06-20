import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// Global ceiling on all /api traffic — blunts naive scraping/DoS attempts.
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please slow down.' } },
});

// Tighter ceiling on login/register to slow down credential-stuffing/brute force.
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: { message: 'Too many attempts. Please try again later.' } },
});
