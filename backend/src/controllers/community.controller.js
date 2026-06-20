import { asyncHandler } from '../utils/asyncHandler.js';
import { getLeaderboard, getStories } from '../services/community.service.js';

export const leaderboard = asyncHandler(async (req, res) => {
  const rows = await getLeaderboard();
  res.json({ leaderboard: rows });
});

export const stories = asyncHandler(async (req, res) => {
  const items = await getStories();
  res.json({ stories: items });
});
