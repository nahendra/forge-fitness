import { Router } from 'express';
import * as weightsController from '../controllers/weights.controller.js';
import { validate } from '../utils/validate.js';
import { createWeightSchema } from '../validators/weight.validators.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = Router();

router.use(requireAuth);

router.get('/', weightsController.list);
router.post('/', verifyCsrf, validate(createWeightSchema), weightsController.create);

export default router;
