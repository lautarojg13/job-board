import { isDemoModeEnabled } from '../config';
import { handleMockRequest } from '../demoService';
import { djangoFetch } from '../djangoService';

/**
 * Serializes an object into a URL query parameter string (e.g. ?search=dev&ordering=title).
 * Ignores undefined, null, and empty string values.
 */
export function buildQueryString(
  params?: Record<string, any> | object
): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, any>)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

/**
 * Helper to generate standard JSON RequestInit options.
 */
export function jsonRequest(method: string, data?: unknown): RequestInit {
  return {
    method,
    ...(data !== undefined ? { body: JSON.stringify(data) } : {})
  };
}

/**
 * Universal fetch wrapper routing requests to Demo Mode (mock) or real Django API
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (isDemoModeEnabled()) {
    // Artificial slight latency for realistic UI state testing in demo mode
    await new Promise((resolve) => setTimeout(resolve, 250));
    return handleMockRequest<T>(endpoint, options);
  }

  return djangoFetch<T>(endpoint, options);
}
