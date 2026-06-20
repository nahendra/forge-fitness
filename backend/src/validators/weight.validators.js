import { z } from 'zod';

export const createWeightSchema = z.object({
  date: z.coerce.date().optional(),
  weightKg: z.coerce.number().min(20, 'Weight looks too low').max(400, 'Weight looks too high'),
});
