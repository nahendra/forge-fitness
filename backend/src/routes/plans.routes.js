import { Router } from 'express';
import * as plansController from '../controllers/plans.controller.js';
import { validate } from '../utils/validate.js';
import { generatePlanSchema } from '../validators/plan.validators.js';

const router = Router();

router.post('/generate', validate(generatePlanSchema), plansController.generate);

export default router;
