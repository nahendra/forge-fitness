import { ApiError } from '../utils/ApiError.js';
import { CSRF_COOKIE } from '../utils/cookies.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Double-submit cookie CSRF check for state-changing requests. A cross-site
// page can make the browser send the cookie automatically, but it cannot
// read the cookie's value to put it in the header, so a forged request fails.
export function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(ApiError.forbidden('Invalid or missing CSRF token.'));
  }
  next();
}
