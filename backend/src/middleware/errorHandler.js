import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// Must be registered last — Express identifies error middleware by arity (4 args).
export function errorHandler(err, req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : err.statusCode || 500;
  const message = isApiError || statusCode < 500 ? err.message : 'Internal server error';

  const log = req.log || console;
  if (statusCode >= 500) {
    log.error({ err, statusCode }, 'Unhandled error');
  } else {
    log.warn({ err: { message: err.message }, statusCode }, 'Request error');
  }

  res.status(statusCode).json({
    error: {
      message,
      details: isApiError ? err.details : undefined,
      stack: !isProd && statusCode >= 500 ? err.stack : undefined,
    },
  });
}
