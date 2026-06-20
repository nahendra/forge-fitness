import { ApiError } from './ApiError.js';

/**
 * Express middleware factory: validates `req[source]` against a Zod schema
 * and replaces it with the parsed/coerced value on success.
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    return next(ApiError.badRequest('Validation failed', details));
  }
  req[source] = result.data;
  next();
};
