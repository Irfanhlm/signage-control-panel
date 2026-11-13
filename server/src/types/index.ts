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

export interface AssignContentPayload {
  contentId: string | null;
}

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
  deviceName?: string;
  isAdmin?: boolean;
}

export function isUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
