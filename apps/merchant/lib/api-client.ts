/**
 * API client for VelMerchant. Owns both the in-memory access token and
 * the persisted refresh token, and automatically refreshes + retries once
 * on a 401 so a short-lived (15 min) access token expiring mid-session
 * doesn't look like a broken "please log in" state.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const REFRESH_TOKEN_KEY = 'velnox-merchant-refresh-token';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function parseErrorMessage(response: Response) {
  const body = await response.json().catch(() => ({ message: response.statusText }));
  return Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? response.statusText);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });
  } catch {
    return false;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens();
    }
    return false;
  }

  const data = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      credentials: 'include',
    });
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง', 0);
  }

  if (response.status === 401 && !skipAuth && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, true);
    }
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

export async function uploadImage(
  file: File,
  folder: 'products' | 'avatars' | 'shops',
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/uploads/image?folder=${folder}`, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return response.json();
}
