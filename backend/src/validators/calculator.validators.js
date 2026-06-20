import { z } from 'zod';

const ACTIVITY_LEVELS = [1.2, 1.375, 1.55, 1.725, 1.9];

export const bmiSchema = z.object({
  heightCm: z.coerce.number().min(50, 'Height looks too low').max(272, 'Height looks too high'),
  weightKg: z.coerce.number().min(20, 'Weight looks too low').max(400, 'Weight looks too high'),
});

export const fatLossSchema = z.object({
  age: z.coerce.number().int().min(10).max(100),
  weightKg: z.coerce.number().min(20).max(400),
  heightCm: z.coerce.number().min(50).max(272),
  gender: z.enum(['m', 'f']),
  activity: z.coerce.number().refine((v) => ACTIVITY_LEVELS.includes(v), 'Invalid activity level'),
});

export const macrosSchema = z.object({
  weightKg: z.coerce.number().min(20).max(400),
  bodyFatPercent: z.coerce.number().min(3).max(70).optional().default(20),
  goal: z.enum(['cut', 'bulk', 'maint']),
  activity: z.coerce.number().refine((v) => ACTIVITY_LEVELS.slice(0, 4).includes(v), 'Invalid activity level'),
});

export const muscleGainSchema = z.object({
  age: z.coerce.number().int().min(10).max(100),
  trainingYears: z.coerce.number().min(0).max(50).optional().default(0),
  weightKg: z.coerce.number().min(20).max(400),
  gender: z.enum(['m', 'f']),
});
