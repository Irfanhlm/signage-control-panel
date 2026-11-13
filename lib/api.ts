import {
  Device,
  Content,
  CreateDeviceDto,
  UpdateDeviceDto,
  CreateContentDto,
  UpdateContentDto,
  ApiResponse,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const body: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: `HTTP error ${res.status}: ${res.statusText}`,
  }));

  if (!res.ok || !body.success) {
    const error = new Error(body.message || `Request failed with status ${res.status}`);
    (error as Error & { errors?: Record<string, string>; status?: number }).errors = body.errors;
    (error as Error & { errors?: Record<string, string>; status?: number }).status = res.status;
    throw error;
  }

  return body.data as T;
}

// ─── Devices API ───

export async function getDevices(): Promise<Device[]> {
  return fetchJson<Device[]>('/api/devices');
}

export async function getDevice(idOrNama: string): Promise<Device> {
  return fetchJson<Device>(`/api/devices/${encodeURIComponent(idOrNama)}`);
}

export async function createDevice(dto: CreateDeviceDto): Promise<Device> {
  return fetchJson<Device>('/api/devices', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateDevice(
  idOrNama: string,
  dto: UpdateDeviceDto
): Promise<Device> {
  return fetchJson<Device>(`/api/devices/${encodeURIComponent(idOrNama)}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function deleteDevice(idOrNama: string): Promise<void> {
  return fetchJson<void>(`/api/devices/${encodeURIComponent(idOrNama)}`, {
    method: 'DELETE',
  });
}

export async function assignDeviceContent(
  idOrNama: string,
  contentId: string | null
): Promise<{ device: Device; content: Content | null }> {
  return fetchJson<{ device: Device; content: Content | null }>(
    `/api/devices/${encodeURIComponent(idOrNama)}/content`,
    {
      method: 'PUT',
      body: JSON.stringify({ contentId }),
    }
  );
}

export async function getCurrentContent(
  idOrNama: string
): Promise<{ device: Device; content: Content | null }> {
  return fetchJson<{ device: Device; content: Content | null }>(
    `/api/devices/${encodeURIComponent(idOrNama)}/current-content`
  );
}

// ─── Contents API ───

export async function getContents(): Promise<Content[]> {
  return fetchJson<Content[]>('/api/contents');
}

export async function getContent(id: string): Promise<Content> {
  return fetchJson<Content>(`/api/contents/${encodeURIComponent(id)}`);
}

export async function createContent(dto: CreateContentDto): Promise<Content> {
  return fetchJson<Content>('/api/contents', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateContent(
  id: string,
  dto: UpdateContentDto
): Promise<Content> {
  return fetchJson<Content>(`/api/contents/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function deleteContent(id: string): Promise<void> {
  return fetchJson<void>(`/api/contents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

