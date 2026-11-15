import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import devicesRouter from './devices.js';
import contentsRouter from './contents.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/devices', devicesRouter);
apiRouter.use('/contents', contentsRouter);

export default apiRouter;
