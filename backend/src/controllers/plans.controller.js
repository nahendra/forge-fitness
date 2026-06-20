import { asyncHandler } from '../utils/asyncHandler.js';
import { generatePlan } from '../services/plans.service.js';

export const generate = asyncHandler(async (req, res) => {
  const plan = await generatePlan(req.body);
  res.json({ plan });
});
