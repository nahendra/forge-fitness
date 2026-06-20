import { asyncHandler } from '../utils/asyncHandler.js';
import { updateProfile } from '../services/users.service.js';

export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user.id, req.body);
  res.json({ user });
});
