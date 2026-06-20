import { asyncHandler } from '../utils/asyncHandler.js';
import { registerUser, authenticateUser, signToken, getUserById } from '../services/auth.service.js';
import { createPasswordResetToken, resetPasswordWithToken } from '../services/passwordReset.service.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { setAuthCookie, clearAuthCookie, issueCsrfCookie } from '../utils/cookies.js';
import { env } from '../config/env.js';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  const token = signToken(user);
  setAuthCookie(res, token);
  const csrfToken = issueCsrfCookie(res);
  req.log.info({ userId: user.id }, 'User registered');
  res.status(201).json({ user, csrfToken });

  // Not awaited on purpose — email delivery must never delay or fail the
  // registration response. Failures are logged inside the service itself.
  sendWelcomeEmail({ name: user.name, email: user.email });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req.body);
  const token = signToken(user);
  setAuthCookie(res, token);
  const csrfToken = issueCsrfCookie(res);
  req.log.info({ userId: user.id }, 'User logged in');
  res.json({ user, csrfToken });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  res.json({ user });
});

export const csrfToken = asyncHandler(async (req, res) => {
  const token = issueCsrfCookie(res);
  res.json({ csrfToken: token });
});

const GENERIC_RESET_MESSAGE = "If an account exists for that email, we've sent a password reset link.";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await createPasswordResetToken(email);

  // Always the same response regardless of whether the account exists —
  // anything else turns this endpoint into an email-enumeration oracle.
  res.json({ message: GENERIC_RESET_MESSAGE });

  if (result) {
    const { user, rawToken, expiresInMinutes } = result;
    const resetUrl = `${env.APP_URL.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
    req.log.info({ userId: user.id }, 'Password reset requested');
    sendPasswordResetEmail({ name: user.name, email: user.email, resetUrl, expiresInMinutes });
  } else {
    req.log.info({ email }, 'Password reset requested for unknown email');
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordWithToken(req.body);
  req.log.info('Password reset completed');
  res.json({ message: 'Your password has been reset. You can now sign in.' });
});
