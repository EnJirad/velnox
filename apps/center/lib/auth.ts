import type { AuthenticatedUser } from '@velnox/types';
import { apiClient, setAccessToken } from './api-client';

const REFRESH_TOKEN_KEY = 'velnox-center-refresh-token';

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function persistSession(auth: AuthenticatedUser) {
  setAccessToken(auth.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
}

export function clearSession() {
  setAccessToken(null);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function login(email: string, password: string) {
  const auth = await apiClient.post<AuthenticatedUser>('/auth/login', { email, password }, { skipAuth: true });
  persistSession(auth);
  return auth;
}

export async function refreshSession() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  try {
    const auth = await apiClient.post<AuthenticatedUser>('/auth/refresh', { refreshToken }, { skipAuth: true });
    persistSession(auth);
    return auth;
  } catch {
    clearSession();
    return null;
  }
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // ignore network errors on logout — clear the local session regardless
  }
  clearSession();
}
