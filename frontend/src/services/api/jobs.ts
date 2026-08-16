import {
  JobPost,
  JobPostCreateRequest,
  JobPostCreate,
  PatchedJobPostRequest,
  JobSearchInputRequest,
  ResumeAnalysisStart,
  ResumeAnalysisResult,
  TaskStatusResponse,
  JobsListQueryParams
} from '../../types';
import { apiFetch, buildQueryString, jsonRequest } from './client';

export interface OwnerJobsQueryParams {
  ordering?: string;
  search?: string;
}

export const jobsApi = {
  getJobsList: (params?: JobsListQueryParams) =>
    apiFetch<JobPost[]>(`/jobs/get-jobs-list/${buildQueryString(params)}`, { method: 'GET' }),

  getJobDetails: (job_id: number) =>
    apiFetch<JobPost>(`/jobs/get-job-details/${job_id}/`, { method: 'GET' }),

  getOwnerJobsList: (params?: OwnerJobsQueryParams) =>
    apiFetch<JobPost[]>(`/jobs/get-owner-jobs-list/${buildQueryString(params)}`, { method: 'GET' }),

  postJob: (data: JobPostCreateRequest) =>
    apiFetch<JobPostCreate>('/jobs/post-job/', jsonRequest('POST', data)),

  editJobPost: (id: number, data: PatchedJobPostRequest) =>
    apiFetch<JobPost>(`/jobs/edit-job-post/${id}/`, jsonRequest('PATCH', data)),

  deleteJobPost: (id: number) =>
    apiFetch<void>(`/jobs/delete-job-post/${id}/`, { method: 'DELETE' }),

  getJobsByAgent: (data: JobSearchInputRequest) =>
    apiFetch<any>('/jobs/get_jobs_by_agent/', jsonRequest('POST', data)),

  getResumeAnalysis: (job_id: number, resume: File | string) => {
    if (resume instanceof File) {
      const formData = new FormData();
      formData.append('resume', resume);
      return apiFetch<ResumeAnalysisStart>(`/jobs/get_resume_analysis/${job_id}/`, {
        method: 'POST',
        body: formData
      });
    }

    return apiFetch<ResumeAnalysisStart>(`/jobs/get_resume_analysis/${job_id}/`, jsonRequest('POST', { resume }));
  },

  getTaskStatus: <T = ResumeAnalysisResult>(task_id: string) =>
    apiFetch<TaskStatusResponse<T>>(`/jobs/task-status/${task_id}/`, { method: 'GET' })
};
