import { Router } from 'express';
import healthRouter from './health.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);

// Placeholders for Tahap 3:
// apiRouter.use('/devices', devicesRouter);
// apiRouter.use('/contents', contentsRouter);

export default apiRouter;

