export type DeviceStatus = 'online' | 'offline';

export type ContentType = 'text' | 'image' | 'video' | 'url';

export interface Device {
  id: string;
  nama: string;
  lokasi: string;
  status: DeviceStatus;
  last_seen: string | null;
  active_content_id: string | null;
  created_at?: string;
  updated_at?: string;
  // Optional expanded relation
  active_content?: Content | null;
}

export interface ContentPayload {
  text?: string;
  [key: string]: unknown;
}

export interface Content {
  id: string;
  judul: string;
  tipe: ContentType;
  payload: ContentPayload;
  url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

// DTOs
export interface CreateDeviceDto {
  nama: string;
  lokasi: string;
}

export interface UpdateDeviceDto {
  nama?: string;
  lokasi?: string;
}

export interface CreateContentDto {
  judul: string;
  tipe: ContentType;
  payload?: ContentPayload;
  url?: string | null;
}

export interface UpdateContentDto {
  judul?: string;
  tipe?: ContentType;
  payload?: ContentPayload;
  url?: string | null;
}

// Allows string UUID or null to unassign content
export interface AssignContentPayload {
  contentId: string | null;
}

// Socket.IO event payloads
export interface ServerToClientEvents {
  'content:updated': (content: Content | null) => void;
  'device:status': (statusData: { deviceId: string; status: DeviceStatus; last_seen: string | null }) => void;
}

export interface ClientToServerEvents {
  'device:heartbeat': () => void;
  'player:ready': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  deviceId?: string;
}

/**
 * Utility helper to determine if an identifier string is a standard UUID.
 * Useful for resolving player and device lookup by either UUID or device name (e.g. SIGN-001).
 */
export function isUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
