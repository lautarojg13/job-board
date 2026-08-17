import {
  MockRequestContext,
  MockRouteHandler,
  getMockState,
  saveMockState,
  handleAuthMock,
  handleCompanyMock,
  handleJobMock,
  handleApplicationMock,
  handleTaskMock
} from './mock';

// Re-export state utilities for backward compatibility across the application
export { getMockState, saveMockState };

/**
 * Pipeline of modular route handlers organized by domain
 */
const ROUTE_HANDLERS: MockRouteHandler[] = [
  handleAuthMock,
  handleCompanyMock,
  handleJobMock,
  handleApplicationMock,
  handleTaskMock
];

/**
 * Dispatches simulated requests in Demo Mode to the appropriate modular domain handler.
 */
export function handleMockRequest<T>(endpoint: string, options: RequestInit): T {
  const method = (options.method || 'GET').toUpperCase();
  const state = getMockState();

  // Parse path and query parameters
  const [path, queryString] = endpoint.split('?');
  const queryParams = new URLSearchParams(queryString || '');

  const context: MockRequestContext = {
    path,
    method,
    queryParams,
    options,
    state
  };

  // Run through modular route handlers
  for (const handler of ROUTE_HANDLERS) {
    const result = handler(context);
    if (result && result.matched) {
      return result.data as T;
    }
  }

  throw new Error(`Unhandled mock route: ${method} ${path}`);
}
