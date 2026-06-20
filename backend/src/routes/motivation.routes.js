import { Router } from 'express';
import * as motivationController from '../controllers/motivation.controller.js';

const router = Router();

router.get('/random', motivationController.random);
router.get('/truths', motivationController.truths);

export default router;
