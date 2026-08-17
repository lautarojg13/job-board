import {
  ApplicationCreateRequest,
  ApplicationCreate,
  ApplicationDetail,
  ApplicationList,
  PatchedApplicationStatusUpdateRequest,
  ApplicationStatusUpdate,
  ApplicationsQueryParams
} from '../../types';
import { apiFetch, buildQueryString, jsonRequest } from './client';

export const applicationsApi = {
  applyToJob: (job_id: number, data: ApplicationCreateRequest) => {
    if (data.resume instanceof File) {
      const formData = new FormData();
      formData.append('resume', data.resume);
      if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
      return apiFetch<ApplicationCreate>(`/applications/apply-to-job/${job_id}/`, {
        method: 'POST',
        body: formData
      });
    }

    return apiFetch<ApplicationCreate>(`/applications/apply-to-job/${job_id}/`, jsonRequest('POST', data));
  },

  getApplicationDetail: (application_id: number) =>
    apiFetch<ApplicationDetail>(`/applications/get-application/${application_id}/`, { method: 'GET' }),

  getJobApplications: (job_id: number, params?: ApplicationsQueryParams) =>
    apiFetch<ApplicationList[]>(
      `/applications/get-job-applications/${job_id}/${buildQueryString(params)}`,
      { method: 'GET' }
    ),

  getUserApplications: (params?: ApplicationsQueryParams) =>
    apiFetch<ApplicationList[]>(
      `/applications/get-user-applications/${buildQueryString(params)}`,
      { method: 'GET' }
    ),

  respondToApplication: (application_id: number, data: PatchedApplicationStatusUpdateRequest) =>
    apiFetch<ApplicationStatusUpdate>(
      `/applications/respond-to-application/${application_id}/`,
      jsonRequest('PATCH', data)
    )
};
