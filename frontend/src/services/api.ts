import {
  CustomUserDetails,
  CustomUserRegistrationRequest,
  LoginRequest,
  Token,
  RestAuthDetail,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ResendEmailVerificationRequest,
  VerifyEmailRequest,
  PublicCompany,
  PublicCompanyRequest,
  PatchedPublicCompanyRequest,
  JobPost,
  JobPostCreateRequest,
  JobPostCreate,
  PatchedJobPostRequest,
  ApplicationCreateRequest,
  ApplicationCreate,
  ApplicationDetail,
  ApplicationList,
  PatchedApplicationStatusUpdateRequest,
  ApplicationStatusUpdate,
  JobSearchInputRequest,
  TaskStatusResponse,
  ResumeAnalysisStart,
  ResumeAnalysisResult,
  JobsListQueryParams,
  ApplicationsQueryParams,
  PatchedCustomUserDetailsRequest
} from '../types';

import { isDemoModeEnabled, getStoredRefreshToken } from './config';
import { handleMockRequest } from './demoService';
import { djangoFetch } from './djangoService';

// Re-export config methods for backward compatibility across components
export * from './config';

/**
 * Universal fetch wrapper routing requests to Demo Mode or real Django API
 */
async function apiFetch<T>(
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

/**
 * Unified Public API Service mapping 1:1 to Django REST API endpoints
 */
export const apiService = {
  // Auth
  login: (data: LoginRequest) =>
    apiFetch<Token>('/auth/token/', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    apiFetch<RestAuthDetail>('/auth/token/blacklist/', {
      method: 'POST',
      body: JSON.stringify({ refresh: getStoredRefreshToken() })
    }),

  register: (data: CustomUserRegistrationRequest) =>
    apiFetch<RestAuthDetail>('/auth/registration/', { method: 'POST', body: JSON.stringify(data) }),

  resendEmailVerification: (data: ResendEmailVerificationRequest) =>
    apiFetch<RestAuthDetail>('/auth/registration/resend-email/', { method: 'POST', body: JSON.stringify(data) }),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiFetch<RestAuthDetail>('/auth/registration/verify-email/', { method: 'POST', body: JSON.stringify(data) }),

  changePassword: (data: PasswordChangeRequest) =>
    apiFetch<RestAuthDetail>('/auth/password/change/', { method: 'POST', body: JSON.stringify(data) }),

  resetPassword: (data: PasswordResetRequest) =>
    apiFetch<RestAuthDetail>('/auth/password/reset/', { method: 'POST', body: JSON.stringify(data) }),

  resetPasswordConfirm: (data: PasswordResetConfirmRequest) =>
    apiFetch<RestAuthDetail>('/auth/password/reset/confirm/', { method: 'POST', body: JSON.stringify(data) }),

  getUser: () =>
    apiFetch<CustomUserDetails>('/auth/user/', { method: 'GET' }),

  updateUser: (data: PatchedCustomUserDetailsRequest) =>
    apiFetch<CustomUserDetails>('/auth/user/', { method: 'PATCH', body: JSON.stringify(data) }),

  // Companies
  getCompanies: (params?: { ordering?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.ordering) q.set('ordering', params.ordering);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<PublicCompany[]>(`/companies/companies/${qs}`, { method: 'GET' });
  },

  createCompany: (data: PublicCompanyRequest) =>
    apiFetch<PublicCompany>('/companies/companies/', { method: 'POST', body: JSON.stringify(data) }),

  getCompanyDetail: (company_id: number) =>
    apiFetch<PublicCompany>(`/companies/companies/${company_id}/`, { method: 'GET' }),

  updateCompany: (company_id: number, data: PatchedPublicCompanyRequest) =>
    apiFetch<PublicCompany>(`/companies/companies/${company_id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  getCompanyJobs: (company_id: number, params?: { ordering?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.ordering) q.set('ordering', params.ordering);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<JobPost[]>(`/companies/companies/${company_id}/jobs/${qs}`, { method: 'GET' });
  },

  // Jobs
  getJobsList: (params?: JobsListQueryParams) => {
    const q = new URLSearchParams();
    if (params?.company) q.set('company', params.company);
    if (params?.employment_type) q.set('employment_type', params.employment_type);
    if (params?.location) q.set('location', params.location);
    if (params?.max_salary !== undefined) q.set('max_salary', String(params.max_salary));
    if (params?.min_salary !== undefined) q.set('min_salary', String(params.min_salary));
    if (params?.ordering) q.set('ordering', params.ordering);
    if (params?.search) q.set('search', params.search);
    if (params?.title) q.set('title', params.title);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<JobPost[]>(`/jobs/get-jobs-list/${qs}`, { method: 'GET' });
  },

  getJobDetails: (job_id: number) =>
    apiFetch<JobPost>(`/jobs/get-job-details/${job_id}/`, { method: 'GET' }),

  getOwnerJobsList: (params?: { ordering?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.ordering) q.set('ordering', params.ordering);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<JobPost[]>(`/jobs/get-owner-jobs-list/${qs}`, { method: 'GET' });
  },

  postJob: (data: JobPostCreateRequest) =>
    apiFetch<JobPostCreate>('/jobs/post-job/', { method: 'POST', body: JSON.stringify(data) }),

  editJobPost: (id: number, data: PatchedJobPostRequest) =>
    apiFetch<JobPost>(`/jobs/edit-job-post/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteJobPost: (id: number) =>
    apiFetch<void>(`/jobs/delete-job-post/${id}/`, { method: 'DELETE' }),

  getJobsByAgent: (data: JobSearchInputRequest) =>
    apiFetch<any>('/jobs/get_jobs_by_agent/', { method: 'POST', body: JSON.stringify(data) }),

  getResumeAnalysis: (job_id: number, resume: File | string) => {
    if (resume instanceof File) {
      const formData = new FormData();
      formData.append('resume', resume);
      return apiFetch<ResumeAnalysisStart>(`/jobs/get_resume_analysis/${job_id}/`, {
        method: 'POST',
        body: formData
      });
    } else {
      return apiFetch<ResumeAnalysisStart>(`/jobs/get_resume_analysis/${job_id}/`, {
        method: 'POST',
        body: JSON.stringify({ resume })
      });
    }
  },

  getTaskStatus: <T = ResumeAnalysisResult>(task_id: string) =>
    apiFetch<TaskStatusResponse<T>>(`/jobs/task-status/${task_id}/`, { method: 'GET' }),

  // Applications
  applyToJob: (job_id: number, data: ApplicationCreateRequest) => {
    if (data.resume instanceof File) {
      const formData = new FormData();
      formData.append('resume', data.resume);
      if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
      return apiFetch<ApplicationCreate>(`/applications/apply-to-job/${job_id}/`, {
        method: 'POST',
        body: formData
      });
    } else {
      return apiFetch<ApplicationCreate>(`/applications/apply-to-job/${job_id}/`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  getApplicationDetail: (application_id: number) =>
    apiFetch<ApplicationDetail>(`/applications/get-application/${application_id}/`, { method: 'GET' }),

  getJobApplications: (job_id: number, params?: ApplicationsQueryParams) => {
    const q = new URLSearchParams();
    if (params?.applicant !== undefined) q.set('applicant', String(params.applicant));
    if (params?.created_after) q.set('created_after', params.created_after);
    if (params?.created_before) q.set('created_before', params.created_before);
    if (params?.job !== undefined) q.set('job', String(params.job));
    if (params?.ordering) q.set('ordering', params.ordering);
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<ApplicationList[]>(`/applications/get-job-applications/${job_id}/${qs}`, { method: 'GET' });
  },

  getUserApplications: (params?: ApplicationsQueryParams) => {
    const q = new URLSearchParams();
    if (params?.applicant !== undefined) q.set('applicant', String(params.applicant));
    if (params?.created_after) q.set('created_after', params.created_after);
    if (params?.created_before) q.set('created_before', params.created_before);
    if (params?.job !== undefined) q.set('job', String(params.job));
    if (params?.ordering) q.set('ordering', params.ordering);
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<ApplicationList[]>(`/applications/get-user-applications/${qs}`, { method: 'GET' });
  },

  respondToApplication: (application_id: number, data: PatchedApplicationStatusUpdateRequest) =>
    apiFetch<ApplicationStatusUpdate>(`/applications/respond-to-application/${application_id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
};
