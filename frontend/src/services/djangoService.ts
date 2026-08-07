import {
  getStoredApiBaseUrl,
  getStoredAuthToken,
  setStoredAuthToken,
  getStoredRefreshToken,
  setStoredRefreshToken
} from './config';

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const baseUrl = getStoredApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (!response.ok) {
      setStoredAuthToken(null);
      setStoredRefreshToken(null);
      throw new Error('Session expired');
    }

    const data = await response.json();
    if (!data.access) {
      setStoredAuthToken(null);
      setStoredRefreshToken(null);
      throw new Error('Invalid refresh response');
    }

    setStoredAuthToken(data.access);
    return data.access as string;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Executes real network HTTP requests targeting the Django REST Framework API backend.
 */
export async function djangoFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const baseUrl = getStoredApiBaseUrl();
  const token = getStoredAuthToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>)
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    const rawToken = token.replace(/^(Token|Bearer)\s+/i, '');
    headers['Authorization'] = `Bearer ${rawToken}`;
  }

  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (
      response.status === 401 &&
      !isRetry &&
      getStoredRefreshToken() &&
      endpoint !== '/auth/token/refresh/' &&
      endpoint !== '/auth/token/' &&
      endpoint !== '/auth/token/blacklist/'
    ) {
      try {
        await refreshAccessToken();
        return await djangoFetch<T>(endpoint, options, true);
      } catch (refreshError) {
        setStoredAuthToken(null);
        setStoredRefreshToken(null);
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { detail: errorText || `HTTP error ${response.status}` };
      }
      throw new Error(errorJson.detail || errorJson.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error(`Unable to connect to Django API server at ${baseUrl}. Verify server is running or enable Demo Mode.`);
    }
    throw error;
  }
}
