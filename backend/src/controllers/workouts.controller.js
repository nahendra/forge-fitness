import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createWorkoutSession,
  listWorkoutSessions,
  getWorkoutSession,
  deleteWorkoutSession,
  getUserPlateauAlerts,
} from '../services/workouts.service.js';

export const create = asyncHandler(async (req, res) => {
  const session = await createWorkoutSession(req.user.id, req.body);
  req.log.info({ userId: req.user.id, sessionId: session.id }, 'Workout session saved');
  res.status(201).json({ session });
});

export const list = asyncHandler(async (req, res) => {
  const result = await listWorkoutSessions(req.user.id, req.query);
  res.json(result);
});

export const getOne = asyncHandler(async (req, res) => {
  const session = await getWorkoutSession(req.user.id, req.params.id);
  res.json({ session });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteWorkoutSession(req.user.id, req.params.id);
  res.status(204).end();
});

export const plateauAlerts = asyncHandler(async (req, res) => {
  const alerts = await getUserPlateauAlerts(req.user.id);
  res.json({ alerts });
});
