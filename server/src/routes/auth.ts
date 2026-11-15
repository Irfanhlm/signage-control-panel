import { Router } from 'express';
import { loginHandler, getMeHandler } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', loginHandler);
router.get('/me', authMiddleware, getMeHandler);

export default router;
