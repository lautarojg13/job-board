import { setStoredAuthToken, setStoredRefreshToken } from '../config';
import { saveMockState } from './mockState';
import { MockRequestContext, MockHandlerResult } from './types';

/**
 * Handles authentication, registration, password, and user profile mock endpoints.
 */
export function handleAuthMock(ctx: MockRequestContext): MockHandlerResult {
  const { path, method, options, state } = ctx;

  // Login: Obtain JWT access and refresh token
  if (path === '/auth/token/' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    const inputUser = body.username || body.email;
    if (inputUser) {
      state.user.username = inputUser;
      state.user.email = body.email || (inputUser.includes('@') ? inputUser : `${inputUser}@example.com`);
      state.user.role = 'USER';
      saveMockState({ user: state.user });
    }

    const access = 'demo_access_' + Math.random().toString(36).substring(2, 10);
    const refresh = 'demo_refresh_' + Math.random().toString(36).substring(2, 10);
    setStoredAuthToken(access);
    setStoredRefreshToken(refresh);
    return { matched: true, data: { access, refresh } };
  }

  // Token Refresh
  if (path === '/auth/token/refresh/' && method === 'POST') {
    const access = 'demo_access_refreshed_' + Math.random().toString(36).substring(2, 10);
    setStoredAuthToken(access);
    return { matched: true, data: { access } };
  }

  // Logout / Blacklist token
  if (path === '/auth/token/blacklist/' && method === 'POST') {
    setStoredAuthToken(null);
    setStoredRefreshToken(null);
    return { matched: true, data: { detail: 'Token blacklisted.' } };
  }

  // User Registration
  if (path === '/auth/registration/' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    if (body.username && body.email) {
      state.user.username = body.username;
      state.user.email = body.email;
      state.user.first_name = body.first_name || '';
      state.user.last_name = body.last_name || '';
      saveMockState({ user: state.user });
    }
    return { matched: true, data: { detail: 'Verification e-mail sent.' } };
  }

  // Current User Details (GET / PUT / PATCH)
  if (path === '/auth/user/') {
    if (method === 'GET') {
      return { matched: true, data: state.user };
    }
    if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse((options.body as string) || '{}');
      state.user = {
        ...state.user,
        ...body
      };
      saveMockState({ user: state.user });
      return { matched: true, data: state.user };
    }
  }

  // Password management flows
  if (
    path === '/auth/password/change/' ||
    path === '/auth/password/reset/' ||
    path === '/auth/password/reset/confirm/'
  ) {
    return { matched: true, data: { detail: 'Password action completed successfully.' } };
  }

  // Email verification flows
  if (
    path === '/auth/registration/resend-email/' ||
    path === '/auth/registration/verify-email/'
  ) {
    return { matched: true, data: { detail: 'Email action completed successfully.' } };
  }

  return null;
}
