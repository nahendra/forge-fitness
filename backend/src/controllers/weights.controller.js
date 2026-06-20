import { asyncHandler } from '../utils/asyncHandler.js';
import { logWeight, listWeightLogs } from '../services/weights.service.js';

export const create = asyncHandler(async (req, res) => {
  const log = await logWeight(req.user.id, req.body);
  res.status(201).json({ log });
});

export const list = asyncHandler(async (req, res) => {
  const logs = await listWeightLogs(req.user.id);
  res.json({ logs });
});
