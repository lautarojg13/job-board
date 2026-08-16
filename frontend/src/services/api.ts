/**
 * Unified API Client and Service Layer
 *
 * Modular architecture separating domain concerns (Auth, Companies, Jobs, Applications)
 * with universal request handling, automatic token refresh, and demo mode routing.
 */

import { authApi } from './api/auth';
import { companiesApi } from './api/companies';
import { jobsApi } from './api/jobs';
import { applicationsApi } from './api/applications';

// Re-export configuration helpers for backward compatibility
export * from './config';

// Re-export core fetch client utilities
export { apiFetch, buildQueryString, jsonRequest } from './api/client';

// Re-export domain-specific API modules
export { authApi } from './api/auth';
export { companiesApi } from './api/companies';
export { jobsApi } from './api/jobs';
export { applicationsApi } from './api/applications';

/**
 * Namespaced API object for structured access: api.auth, api.jobs, etc.
 */
export const api = {
  auth: authApi,
  companies: companiesApi,
  jobs: jobsApi,
  applications: applicationsApi
};

/**
 * Unified Public API Service maintaining 100% backward compatibility
 * with all existing components and handlers across the application.
 */
export const apiService = {
  ...authApi,
  ...companiesApi,
  ...jobsApi,
  ...applicationsApi
};

export default apiService;
