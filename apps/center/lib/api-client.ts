/**
 * Client-side API client for VelCenter. Persists tokens to localStorage so
 * sessions survive a refresh, and transparently retries a request once
 * after rotating the refresh token on a 401.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const ACCESS_KEY = 'velnox_center_access_token';
const REFRESH_KEY = 'velnox_center_refresh_token';

function readToken(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
  if (typeof window === 'undefined') return;
  if (accessToken) window.localStorage.setItem(ACCESS_KEY, accessToken);
  else window.localStorage.removeItem(ACCESS_KEY);

  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
  else if (refreshToken === null) window.localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken() {
  return readToken(ACCESS_KEY);
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  _retried?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, headers, _retried, ...rest } = options;
  const accessToken = getAccessToken();

  const response = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && !skipAuth && !_retried) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, _retried: true });
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message || 'Something went wrong');
  }

  const json = await response.json();
  return (json?.data ?? json) as T;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = readToken(REFRESH_KEY);
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error('refresh failed');
    const json = await response.json();
    const data = json?.data ?? json;
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    setTokens(null, null);
    return false;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

/** Server-side (no auth) fetch helper for public data in Server Components. */
export async function serverFetch<T>(path: string, revalidate = 30): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, { next: { revalidate } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  const json = await response.json();
  return (json?.data ?? json) as T;
}
