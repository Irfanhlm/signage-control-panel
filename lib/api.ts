import {
  Device,
  Content,
  CreateDeviceDto,
  UpdateDeviceDto,
  CreateContentDto,
  UpdateContentDto,
  ApiResponse,
  AdminUser,
  LoginResult,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const TOKEN_KEY = 'signage_auth_token';
const USER_KEY = 'signage_auth_user';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AdminUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const body: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: `HTTP error ${res.status}: ${res.statusText}`,
  }));

  if (!res.ok || !body.success) {
    if (res.status === 401 && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/player') && pathname !== '/login') {
        clearAuth();
        window.location.replace('/login?session_expired=true');
      }
    }

    const error = new Error(body.message || `Request failed with status ${res.status}`);
    (error as Error & { errors?: Record<string, string>; status?: number }).errors = body.errors;
    (error as Error & { errors?: Record<string, string>; status?: number }).status = res.status;
    throw error;
  }

  return body.data as T;
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<LoginResult> {
  const result = await fetchJson<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setAuth(result.token, result.admin);
  return result;
}

export async function getMe(): Promise<{ admin: AdminUser }> {
  return fetchJson<{ admin: AdminUser }>('/api/auth/me');
}

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
