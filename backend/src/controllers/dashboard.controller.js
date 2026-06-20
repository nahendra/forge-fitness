import { asyncHandler } from '../utils/asyncHandler.js';
import { getDashboardSummary, getStrengthSeries } from '../services/dashboard.service.js';
import { ApiError } from '../utils/ApiError.js';

export const summary = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary(req.user.id);
  res.json(data);
});

export const strength = asyncHandler(async (req, res) => {
  const exercise = String(req.query.exercise || '').trim();
  if (!exercise) throw ApiError.badRequest('Query param "exercise" is required.');
  const points = await getStrengthSeries(req.user.id, exercise);
  res.json({ exercise, points });
});
