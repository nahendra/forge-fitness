import { Router } from 'express';
import * as calculatorsController from '../controllers/calculators.controller.js';
import { validate } from '../utils/validate.js';
import { bmiSchema, fatLossSchema, macrosSchema, muscleGainSchema } from '../validators/calculator.validators.js';

const router = Router();

router.post('/bmi', validate(bmiSchema), calculatorsController.bmi);
router.post('/fat-loss', validate(fatLossSchema), calculatorsController.fatLoss);
router.post('/macros', validate(macrosSchema), calculatorsController.macros);
router.post('/muscle-gain', validate(muscleGainSchema), calculatorsController.muscleGain);

export default router;
