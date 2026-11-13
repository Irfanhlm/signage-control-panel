export type DeviceStatus = 'online' | 'offline';

export type ContentType = 'text' | 'image' | 'video' | 'url';

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

export interface DeviceStatusEvent {
  deviceId: string;
  status: DeviceStatus;
  last_seen: string | null;
}

