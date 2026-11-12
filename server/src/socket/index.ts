import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config/index.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../types/index.js';

let ioInstance: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function initSocketIO(
  httpServer: HttpServer
): Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: config.webOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const deviceId = socket.handshake.auth?.deviceId as string | undefined;
    console.log(`[Socket.IO] New connection: ${socket.id} (deviceId: ${deviceId || 'none'})`);

    // Handlers for device rooms, heartbeat, and status will be fully wired in Tahap 4
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized. Call initSocketIO first.');
  }
  return ioInstance;
}

