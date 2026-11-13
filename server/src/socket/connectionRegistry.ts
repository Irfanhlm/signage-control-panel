/**
 * In-memory connection registry for tracking active Socket.IO connections per device.
 *
 * Maps deviceId (UUID) → Set of socketId strings.
 * A device is considered "connected" if it has at least one active socket.
 */

const connections = new Map<string, Set<string>>();

export function addConnection(deviceId: string, socketId: string): void {
  if (!connections.has(deviceId)) {
    connections.set(deviceId, new Set());
  }
  connections.get(deviceId)!.add(socketId);
}

export function removeConnection(deviceId: string, socketId: string): void {
  const sockets = connections.get(deviceId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    connections.delete(deviceId);
  }
}

export function getConnections(deviceId: string): Set<string> {
  return connections.get(deviceId) ?? new Set();
}

export function hasConnections(deviceId: string): boolean {
  const sockets = connections.get(deviceId);
  return !!sockets && sockets.size > 0;
}

export function getAllConnectedDeviceIds(): string[] {
  return Array.from(connections.keys());
}

export function clearRegistry(): void {
  connections.clear();
}

/**
 * Get total number of connected sockets across all devices.
 * Useful for debugging/health checks.
 */
export function getTotalSocketCount(): number {
  let total = 0;
  for (const sockets of connections.values()) {
    total += sockets.size;
  }
  return total;
}

