import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/index.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  DeviceStatus,
} from '../types/index.js';
import {
  addConnection,
  removeConnection,
  hasConnections,
} from './connectionRegistry.js';
import { findDeviceByIdOrNama, updateDeviceStatus } from '../services/device.service.js';
import { getSupabase } from '../lib/supabase.js';

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let ioInstance: TypedServer | null = null;
let sweeperInterval: ReturnType<typeof setInterval> | null = null;

// ─── Sweeper Configuration ───
const SWEEPER_INTERVAL_MS = 10_000;   // run every 10s
const OFFLINE_THRESHOLD_S = 30;       // mark offline if last_seen > 30s ago

/**
 * Initialize Socket.IO server, register event handlers and start the offline sweeper.
 */
export function initSocketIO(httpServer: HttpServer): TypedServer {
  const io: TypedServer = new Server(httpServer, {
    cors: {
      origin: config.webOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  // ─── Authentication & Device Resolution Middleware ───
  io.use(async (socket: TypedSocket, next) => {
    const deviceId = socket.handshake.auth?.deviceId as string | undefined;
    const role = socket.handshake.auth?.role as string | undefined;

    // Admin / Dashboard Connection
    if (!deviceId || role === 'admin') {
      socket.data.isAdmin = true;
      return next();
    }

    // Player Connection: validate device existence
    try {
      const device = await findDeviceByIdOrNama(deviceId);
      if (!device) {
        console.warn(`[Socket.IO] Rejected connection ${socket.id}: device '${deviceId}' not found.`);
        return next(new Error(`Device '${deviceId}' not found`));
      }

      socket.data.deviceId = device.id;
      socket.data.deviceName = device.nama;
      socket.data.isAdmin = false;
      next();
    } catch (err) {
      console.error(`[Socket.IO] Auth lookup error for device '${deviceId}':`, err);
      next(new Error(`Authentication failed: ${(err as Error).message}`));
    }
  });

  io.on('connection', (socket: TypedSocket) => {
    handleConnection(io, socket);
  });

  // Start background offline sweeper
  startSweeper(io);

  ioInstance = io;
  return io;
}

export function getIO(): TypedServer {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized. Call initSocketIO first.');
  }
  return ioInstance;
}

// ─── Connection Handler ───

function handleConnection(io: TypedServer, socket: TypedSocket): void {
  // ── Admin / Dashboard Connection ──
  if (socket.data.isAdmin) {
    socket.join('admin');
    console.log(`[Socket.IO] Admin connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Admin disconnected: ${socket.id} (${reason})`);
    });
    return;
  }

  // ── Player / Device Connection ──
  const resolvedId = socket.data.deviceId!;
  const deviceName = socket.data.deviceName || resolvedId;
  const roomName = `device:${resolvedId}`;

  // Join room and register connection synchronously
  socket.join(roomName);
  addConnection(resolvedId, socket.id);

  console.log(`[Socket.IO] Player connected: ${socket.id} → device ${deviceName} (${resolvedId})`);

  // Update status in DB and notify admin
  const now = new Date().toISOString();
  updateDeviceStatus(resolvedId, 'online', now)
    .then(() => {
      // Guard against race condition: if socket disconnected before DB call finished
      if (socket.disconnected || !hasConnections(resolvedId)) {
        return;
      }
      io.to('admin').emit('device:status', {
        deviceId: resolvedId,
        status: 'online',
        last_seen: now,
      });
    })
    .catch((err) => {
      console.error(`[Socket.IO] Error setting device ${resolvedId} online:`, err);
    });

  // ── Heartbeat Handler ──
  socket.on('device:heartbeat', async () => {
    try {
      const heartbeatTime = new Date().toISOString();
      await updateDeviceStatus(resolvedId, 'online', heartbeatTime);
      io.to('admin').emit('device:status', {
        deviceId: resolvedId,
        status: 'online',
        last_seen: heartbeatTime,
      });
    } catch (err) {
      console.error(`[Socket.IO] Heartbeat error for ${resolvedId}:`, err);
    }
  });

  // ── Player Ready Handler ──
  socket.on('player:ready', () => {
    console.log(`[Socket.IO] Player ready: ${socket.id} (device ${deviceName})`);
  });

  // ── Disconnect Handler ──
  socket.on('disconnect', async (reason) => {
    console.log(`[Socket.IO] Player disconnected: ${socket.id} (device ${deviceName}, reason: ${reason})`);

    removeConnection(resolvedId, socket.id);

    // Only mark offline if no active connections remain for this device
    if (!hasConnections(resolvedId)) {
      try {
        const disconnectTime = new Date().toISOString();
        await updateDeviceStatus(resolvedId, 'offline', disconnectTime);
        io.to('admin').emit('device:status', {
          deviceId: resolvedId,
          status: 'offline',
          last_seen: disconnectTime,
        });
      } catch (err) {
        console.error(`[Socket.IO] Disconnect status update error for ${resolvedId}:`, err);
      }
    }
  });
}

// ─── Offline Sweeper ───

function startSweeper(io: TypedServer): void {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
  }

  sweeperInterval = setInterval(async () => {
    try {
      await sweepOfflineDevices(io);
    } catch (err) {
      console.error('[Socket.IO Sweeper] Error:', err);
    }
  }, SWEEPER_INTERVAL_MS);

  console.log(`[Socket.IO] Offline sweeper started (interval: ${SWEEPER_INTERVAL_MS}ms, threshold: ${OFFLINE_THRESHOLD_S}s)`);
}

async function sweepOfflineDevices(io: TypedServer): Promise<void> {
  const supabase = getSupabase();
  const threshold = new Date(Date.now() - OFFLINE_THRESHOLD_S * 1000).toISOString();

  // Find devices that are marked 'online' but haven't been seen recently
  const { data: staleDevices, error } = await supabase
    .from('devices')
    .select('id, nama, last_seen')
    .eq('status', 'online' as DeviceStatus)
    .lt('last_seen', threshold);

  if (error) {
    console.error('[Socket.IO Sweeper] Query error:', error.message);
    return;
  }

  if (!staleDevices || staleDevices.length === 0) return;

  for (const device of staleDevices) {
    // Skip if device still has active socket connections in memory
    if (hasConnections(device.id)) continue;

    const now = new Date().toISOString();
    await updateDeviceStatus(device.id, 'offline', now);

    io.to('admin').emit('device:status', {
      deviceId: device.id,
      status: 'offline',
      last_seen: device.last_seen,
    });

    console.log(`[Socket.IO Sweeper] Marked device ${device.nama} (${device.id}) as offline (last_seen: ${device.last_seen})`);
  }
}

/**
 * Stop the sweeper (useful for tests and graceful shutdown).
 */
export function stopSweeper(): void {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
    sweeperInterval = null;
  }
}
