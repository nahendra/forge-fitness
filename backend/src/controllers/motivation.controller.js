import { asyncHandler } from '../utils/asyncHandler.js';
import { getRandomQuote, getRandomTip, getFitnessTruths } from '../services/motivation.service.js';

export const random = asyncHandler(async (req, res) => {
  const [quote, tip] = await Promise.all([getRandomQuote(), getRandomTip()]);
  res.json({ quote, tip });
});

export const truths = asyncHandler(async (req, res) => {
  const items = await getFitnessTruths();
  res.json({ truths: items });
});
