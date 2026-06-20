// Wraps an async route/middleware handler so rejected promises are forwarded
// to Express's error pipeline instead of crashing the process.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
