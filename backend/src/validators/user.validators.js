import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bodyType: z.enum(['ECTOMORPH', 'MESOMORPH', 'ENDOMORPH']).optional(),
  goal: z.enum(['CUT', 'BULK', 'SHRED']).optional(),
  publicLeaderboard: z.boolean().optional(),
});
