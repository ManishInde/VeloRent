const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('velorent_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('velorent_token');
        localStorage.removeItem('velorent_user');
        if (!window.location.pathname.startsWith('/login')) {
          // Redirect to login with expired flag only from protected pages.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/login?expired=true';
          throw new ApiError('Session expired. Please log in again.', 401, 'UNAUTHORIZED');
        }
        // On the login page: fall through to the normal !response.ok handler
        // below so the backend's actual error message (e.g. "Invalid email or
        // password.") is shown. For stale-token /api/auth/me calls,
        // AuthContext's try/catch handles the error silently.
      }
    }

    if (response.status === 403) {
      throw new ApiError("You don't have permission to access this resource.", 403, 'FORBIDDEN');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Backend returns: { success: false, error: { code: "...", message: "..." } }
      const errorMessage =
        (typeof data.error === 'object' && data.error?.message) ||
        (typeof data.error === 'string' && data.error) ||
        data.message ||
        `HTTP Request failed with status ${response.status}`;
      const errorCode =
        (typeof data.error === 'object' && data.error?.code) || data.code;
      throw new ApiError(errorMessage, response.status, errorCode);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error or backend unreachable.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
