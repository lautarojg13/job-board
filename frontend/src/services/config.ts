// LocalStorage and Environment configuration keys and accessors for API and environment mode

const BASE_URL_KEY = 'jobboard_api_base_url';
const AUTH_TOKEN_KEY = 'jobboard_auth_token';
const REFRESH_TOKEN_KEY = 'jobboard_refresh_token';
const DEMO_MODE_KEY = 'jobboard_demo_mode';

/**
 * Global master switch for Demo Mode & Dev Config UI.
 * Set VITE_ENABLE_DEMO_MODE="false" in production .env to disable Demo Mode
 * and hide all configuration modals, buttons, and mock fallbacks across the entire app.
 */
export const IS_DEMO_FEATURE_ALLOWED =
  import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false' &&
  import.meta.env.VITE_ENABLE_DEMO_MODE !== '0';

export function cleanBaseUrl(url: string | null | undefined): string {
  if (!url) return 'http://localhost:8000';
  // Remove surrounding quotes, whitespace and trailing slashes
  return url.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
}

export function getStoredApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const stored = localStorage.getItem(BASE_URL_KEY);
  return cleanBaseUrl(stored || envUrl);
}

export function setStoredApiBaseUrl(url: string) {
  localStorage.setItem(BASE_URL_KEY, cleanBaseUrl(url));
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function isDemoModeEnabled(): boolean {
  if (!IS_DEMO_FEATURE_ALLOWED) {
    return false; // Force real API in production
  }
  const val = localStorage.getItem(DEMO_MODE_KEY);
  return val === null ? true : val === 'true'; // Default to true for local preview unless set
}

export function setDemoModeEnabled(enabled: boolean) {
  if (!IS_DEMO_FEATURE_ALLOWED) return;
  localStorage.setItem(DEMO_MODE_KEY, String(enabled));
}

