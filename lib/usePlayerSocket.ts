'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Content } from './types';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface UsePlayerSocketOptions {
  deviceId: string;
  onContentUpdated?: (content: Content | null) => void;
  onReconnect?: () => void;
}

export function usePlayerSocket({
  deviceId,
  onContentUpdated,
  onReconnect,
}: UsePlayerSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const onContentUpdatedRef = useRef(onContentUpdated);
  const onReconnectRef = useRef(onReconnect);
  const hasConnectedOnceRef = useRef(false);

  useEffect(() => {
    onContentUpdatedRef.current = onContentUpdated;
  }, [onContentUpdated]);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!deviceId) return;

    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    const socket: Socket = io(SOCKET_URL, {
      auth: { deviceId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);

      if (heartbeatTimer) clearInterval(heartbeatTimer);
      socket.emit('device:heartbeat');
      heartbeatTimer = setInterval(() => {
        if (socket.connected) {
          socket.emit('device:heartbeat');
        }
      }, 10000);

      if (hasConnectedOnceRef.current) {
        onReconnectRef.current?.();
      }
      hasConnectedOnceRef.current = true;
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setConnectionError(err.message || 'Gagal terhubung ke socket server');
    });

    socket.on('content:updated', (newContent: Content | null) => {
      onContentUpdatedRef.current?.(newContent);
    });

    return () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [deviceId]);

  return {
    isConnected,
    connectionError,
  };
}
