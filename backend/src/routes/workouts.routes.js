import { Router } from 'express';
import * as workoutsController from '../controllers/workouts.controller.js';
import { validate } from '../utils/validate.js';
import { createWorkoutSchema, listWorkoutsQuerySchema } from '../validators/workout.validators.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listWorkoutsQuerySchema, 'query'), workoutsController.list);
router.get('/plateau-alerts', workoutsController.plateauAlerts);
router.get('/custom-exercises', workoutsController.customExercises);
router.get('/:id', workoutsController.getOne);
router.post('/', verifyCsrf, validate(createWorkoutSchema), workoutsController.create);
router.put('/:id', verifyCsrf, validate(createWorkoutSchema), workoutsController.update);
router.delete('/:id', verifyCsrf, workoutsController.remove);

export default router;
