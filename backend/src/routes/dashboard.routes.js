import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', dashboardController.summary);
router.get('/strength', dashboardController.strength);
router.get('/consistency', dashboardController.consistency);

export default router;
