import { z } from 'zod';

export const BODY_PARTS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body'];

const setSchema = z.object({
  reps: z.coerce.number().int().min(0).max(200),
  weightKg: z.coerce.number().min(0).max(500),
});

const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required').max(80),
  sets: z.array(setSchema).min(1, 'Each exercise needs at least one set').max(20),
});

export const createWorkoutSchema = z.object({
  date: z.coerce.date(),
  bodyPart: z.enum(BODY_PARTS),
  notes: z.string().trim().max(280).optional().default(''),
  exercises: z.array(exerciseSchema).min(1, 'Log at least one exercise').max(20),
});

export const listWorkoutsQuerySchema = z.object({
  bodyPart: z.union([z.enum(BODY_PARTS), z.literal('other')]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});
