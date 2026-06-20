import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import calculatorsRoutes from './calculators.routes.js';
import plansRoutes from './plans.routes.js';
import workoutsRoutes from './workouts.routes.js';
import weightsRoutes from './weights.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import motivationRoutes from './motivation.routes.js';
import communityRoutes from './community.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/calculators', calculatorsRoutes);
router.use('/plans', plansRoutes);
router.use('/workouts', workoutsRoutes);
router.use('/weights', weightsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/motivation', motivationRoutes);
router.use('/community', communityRoutes);

export default router;
