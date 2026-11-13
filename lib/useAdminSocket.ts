'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { DeviceStatusEvent } from './types';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useAdminSocket(onStatusChange?: (event: DeviceStatusEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      auth: { role: 'admin' },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('device:status', (data: DeviceStatusEvent) => {
      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { isConnected };
}

