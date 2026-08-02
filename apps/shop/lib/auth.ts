import type { AuthenticatedUser } from '@velnox/types';
import { apiClient, clearTokens, setAccessToken } from './api-client';

export function clearSession() {
  clearTokens();
}

export async function login(email: string, password: string) {
  const auth = await apiClient.post<AuthenticatedUser>('/auth/login', { email, password }, { skipAuth: true });
  setAccessToken(auth.accessToken);
  // Refresh token is automatically set in HttpOnly cookie by backend
  return auth;
}

export async function register(input: { name: string; email: string; password: string; phone?: string }) {
  const auth = await apiClient.post<AuthenticatedUser>('/auth/register', input, { skipAuth: true });
  setAccessToken(auth.accessToken);
  return auth;
}

/**
 * Called once on app load to restore a session from a previously stored
 * refresh token in HttpOnly cookie.
 */
export async function restoreSession(): Promise<AuthenticatedUser['user'] | null> {
  try {
    // Try to refresh using the stored refresh token in HttpOnly cookie
    const auth = await apiClient.post<AuthenticatedUser>('/auth/refresh', {}, { skipAuth: true });
    setAccessToken(auth.accessToken);
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
