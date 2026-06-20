import { asyncHandler } from '../utils/asyncHandler.js';
import { registerUser, authenticateUser, signToken, getUserById } from '../services/auth.service.js';
import { sendWelcomeEmail } from '../services/email.service.js';
import { setAuthCookie, clearAuthCookie, issueCsrfCookie } from '../utils/cookies.js';

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
