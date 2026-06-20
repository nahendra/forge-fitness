import { Router } from 'express';
import * as communityController from '../controllers/community.controller.js';

const router = Router();

router.get('/leaderboard', communityController.leaderboard);
router.get('/stories', communityController.stories);

export default router;
