/**
 * API client for VelShop. Manages access token in memory and refresh token in HttpOnly Cookie.
 * Automatically refreshes + retries once on 401 so a short-lived (15 min) access token expiring
 * mid-session doesn't look like a broken "please log in" state.
 *
 * Session persistence: Refresh token is stored in HttpOnly cookie by backend, so user stays
 * logged in as long as the cookie is valid (7 days).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function clearTokens() {
  accessToken = null;
  // Refresh token is managed by backend via HttpOnly cookie, no need to clear manually
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

/** Raw refresh call — does not go through `request()` to avoid recursion. */
async function refreshAccessToken(): Promise<boolean> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Empty body - refresh token comes from cookie
      credentials: 'include', // Important: send cookies with request
    });
  } catch {
    // Network error / cold-start timeout — don't wipe the stored access token,
    // the person is probably still logged in, just unreachable.
    return false;
  }

  if (!response.ok) {
    // Only a genuine 401 means the refresh token itself is invalid/expired.
    if (response.status === 401) {
      clearTokens();
    }
    return false;
  }

  const envelope = await response.json();
  const data = envelope.data; // Unwrap the TransformInterceptor envelope
  setAccessToken(data.accessToken);
  // Refresh token is set by backend via Set-Cookie header (HttpOnly)
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

  const envelope = await response.json();
  // Unwrap the TransformInterceptor envelope { data, timestamp }
  return envelope.data as T;
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

export function hasValidAccessToken(): boolean {
  return !!accessToken;
}

/**
 * Uploads a single image file as multipart/form-data (no JSON Content-Type
 * header — the browser sets the multipart boundary itself).
 */
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

  const envelope = await response.json();
  return envelope.data;
}
