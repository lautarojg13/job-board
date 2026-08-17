import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { djangoFetch } from './djangoService';
import {
  setStoredAuthToken,
  setStoredRefreshToken,
  setStoredApiBaseUrl
} from './config';

describe('djangoService - djangoFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. Con token en localStorage (jobboard_auth_token), el request lleva Authorization: Bearer <token>', async () => {
    setStoredAuthToken('Token my-secret-token');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });
    global.fetch = mockFetch;

    await djangoFetch('/jobs/get-jobs-list/');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer my-secret-token');
  });

  it('2. Sin token, no manda Authorization', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });
    global.fetch = mockFetch;

    await djangoFetch('/jobs/get-jobs-list/');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('3. Body JSON -> Content-Type: application/json. Body FormData -> no se setea Content-Type', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });
    global.fetch = mockFetch;

    // JSON Request
    await djangoFetch('/auth/token/', { method: 'POST', body: JSON.stringify({ user: 'test' }) });
    let headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');

    // FormData Request
    const formData = new FormData();
    formData.append('file', 'test');
    await djangoFetch('/applications/apply-to-job/1/', { method: 'POST', body: formData });
    headers = mockFetch.mock.calls[1][1]?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('4. La URL = base (localStorage jobboard_api_base_url, o VITE_API_BASE_URL, default http://localhost:8000) + endpoint', async () => {
    setStoredApiBaseUrl('http://custom-api:9000');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });
    global.fetch = mockFetch;

    await djangoFetch('/auth/user/');

    expect(mockFetch).toHaveBeenCalledWith('http://custom-api:9000/auth/user/', expect.any(Object));
  });

  it('5. Respuesta 401 con refresh token guardado: llama refresh, guarda nuevo access y reintenta request original', async () => {
    setStoredAuthToken('old-access');
    setStoredRefreshToken('valid-refresh');

    const mockFetch = vi.fn()
      // 1. Initial request fails with 401
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ detail: 'Token expired' })
      })
      // 2. Refresh request succeeds with new access token
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access: 'new-access-token' })
      })
      // 3. Retry of original request succeeds
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'protected-resource' })
      });

    global.fetch = mockFetch;

    const result = await djangoFetch<{ data: string }>('/auth/user/');

    expect(result).toEqual({ data: 'protected-resource' });
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify refresh call
    expect(mockFetch.mock.calls[1][0]).toContain('/auth/token/refresh/');
    expect(mockFetch.mock.calls[1][1]?.body).toBe(JSON.stringify({ refresh: 'valid-refresh' }));

    // Verify retry has new authorization header
    const retryHeaders = mockFetch.mock.calls[2][1]?.headers as Record<string, string>;
    expect(retryHeaders['Authorization']).toBe('Bearer new-access-token');
  });

  it('6. 401 + refresh fallido: limpia tokens y rechaza con Session expired. Please log in again.', async () => {
    setStoredAuthToken('old-access');
    setStoredRefreshToken('expired-refresh');

    const mockFetch = vi.fn()
      // Initial 401
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ detail: 'Token expired' })
      })
      // Refresh 401/error
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Token is invalid or expired' })
      });

    global.fetch = mockFetch;

    await expect(djangoFetch('/auth/user/')).rejects.toThrow('Session expired. Please log in again.');
    expect(localStorage.getItem('jobboard_auth_token')).toBeNull();
    expect(localStorage.getItem('jobboard_refresh_token')).toBeNull();
  });

  it('7. 401 sin refresh token: rechaza directamente (sin loop)', async () => {
    setStoredAuthToken('some-access');
    setStoredRefreshToken(null);

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: 'Authentication credentials were not provided.' })
    });

    global.fetch = mockFetch;

    await expect(djangoFetch('/auth/user/')).rejects.toThrow('Authentication credentials were not provided.');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('8. 204 -> resuelve con {}', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 204
    });

    global.fetch = mockFetch;

    const result = await djangoFetch('/jobs/delete-job-post/1/', { method: 'DELETE' });
    expect(result).toEqual({});
  });

  it('9. Error no-OK con cuerpo JSON: rechaza con Error cuyo mensaje es detail (fallback message o status)', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'Invalid payload submitted' })
    });

    global.fetch = mockFetch;

    await expect(djangoFetch('/auth/registration/')).rejects.toThrow('Invalid payload submitted');
  });

  it('10. Fallo de red (fetch rechaza con TypeError/Failed to fetch): rechaza con Unable to connect to Django API server...', async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    global.fetch = mockFetch;

    await expect(djangoFetch('/jobs/get-jobs-list/')).rejects.toThrow(
      /Unable to connect to Django API server at/
    );
  });
});
