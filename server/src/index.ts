import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { initSocketIO } from './socket/index.js';

const app = express();

app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

app.get('/', (_req, res) => {
  res.json({
    name: 'Digital Signage Control Panel Backend',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});

app.use('/api', apiRouter);

app.use(errorHandler);

const httpServer = http.createServer(app);
const io = initSocketIO(httpServer);

httpServer.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`Digital Signage Backend Server running`);
  console.log(`HTTP Server: http://localhost:${config.port}`);
  console.log(`Socket.IO ready on port ${config.port}`);
  console.log(`Allowed Web Origin: ${config.webOrigin}`);
  console.log(`===============================================`);
});

export { app, httpServer, io };
