import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { initSocketIO } from './socket/index.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

// Health check and root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Digital Signage Control Panel Backend',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// HTTP and Socket.IO Server
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

