import { randomBytes } from 'crypto';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'forge_token';
export const CSRF_COOKIE = 'forge_csrf';

const msFromExpiry = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return value * unit;
};

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    maxAge: msFromExpiry(env.JWT_EXPIRES_IN),
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
}

// Double-submit CSRF cookie: readable by frontend JS (not httpOnly) so it can
// be echoed back in the `x-csrf-token` header on mutating requests. A request
// forged from another origin cannot read this cookie, so it cannot replicate
// the header — that's the entire defense.
export function issueCsrfCookie(res) {
  const token = randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    maxAge: msFromExpiry(env.JWT_EXPIRES_IN),
    path: '/',
  });
  return token;
}
