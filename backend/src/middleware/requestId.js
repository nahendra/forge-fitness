import { randomUUID } from 'crypto';

// Generates/propagates a request id; pino-http (registered after this
// middleware) picks req.id up automatically and attaches `req.log`.
export function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}
