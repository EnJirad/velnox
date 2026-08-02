import type { AuthenticatedUser } from '@velnox/types';
import { apiClient, clearTokens, getRefreshToken, setTokens } from './api-client';

function persistSession(auth: AuthenticatedUser) {
  setTokens(auth.accessToken, auth.refreshToken);
}

export function clearSession() {
  clearTokens();
}

export async function login(email: string, password: string) {
  const auth = await apiClient.post<AuthenticatedUser>('/auth/login', { email, password }, { skipAuth: true });
  persistSession(auth);
  return auth;
}

export async function register(input: { name: string; email: string; password: string; phone?: string }) {
  const auth = await apiClient.post<AuthenticatedUser>('/auth/register', input, { skipAuth: true });
  persistSession(auth);
  return auth;
}

export async function restoreSession(): Promise<AuthenticatedUser['user'] | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const auth = await apiClient.post<AuthenticatedUser>('/auth/refresh', { refreshToken }, { skipAuth: true });
    persistSession(auth);
    return auth.user;
  } catch {
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
