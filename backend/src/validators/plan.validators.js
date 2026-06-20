import { z } from 'zod';

export const generatePlanSchema = z.object({
  bodyType: z.enum(['ectomorph', 'mesomorph', 'endomorph']),
  goal: z.enum(['cut', 'bulk', 'shred']),
  // Optional free-text context for AI enrichment only (e.g. "knee injury, prefer dumbbells").
  // Treated as untrusted data — never concatenated directly into a model's instructions.
  note: z.string().trim().max(280).optional(),
});
