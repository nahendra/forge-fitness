import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { validate } from '../utils/validate.js';
import { updateProfileSchema } from '../validators/user.validators.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = Router();

router.put('/me', requireAuth, verifyCsrf, validate(updateProfileSchema), usersController.updateMe);

export default router;
