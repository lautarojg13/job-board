import { describe, it, expect, beforeEach } from 'vitest';
import { handleMockRequest, getMockState, saveMockState } from './demoService';
import { JobPost, PublicCompany, ApplicationList, TaskStatusResponse } from '../types';

describe('demoService - Mock Engine & Shape Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('GET /jobs/get-jobs-list/ -> returns array of JobPost', () => {
    const jobs = handleMockRequest<JobPost[]>('/jobs/get-jobs-list/', { method: 'GET' });
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0]).toHaveProperty('id');
    expect(jobs[0]).toHaveProperty('title');
    expect(jobs[0]).toHaveProperty('company');
  });

  it('GET /jobs/get-job-details/{id}/ -> returns JobPost object', () => {
    const state = getMockState();
    const targetJob = state.jobs[0];
    const job = handleMockRequest<JobPost>(`/jobs/get-job-details/${targetJob.id}/`, { method: 'GET' });
    expect(job).toBeDefined();
    expect(job.id).toBe(targetJob.id);
    expect(job.title).toBe(targetJob.title);
  });

  it('POST /auth/token/ -> returns { access, refresh }', () => {
    const res = handleMockRequest<{ access: string; refresh: string }>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username: 'demo', password: 'demo-password' })
    });
    expect(res).toBeDefined();
    expect(res.access).toMatch(/^demo_access_/);
    expect(res.refresh).toMatch(/^demo_refresh_/);
  });

  it('GET /companies/companies/ -> returns PublicCompany[]', () => {
    const companies = handleMockRequest<PublicCompany[]>('/companies/companies/', { method: 'GET' });
    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);
    expect(companies[0]).toHaveProperty('name');
    expect(companies[0]).toHaveProperty('id');
  });

  it('GET /applications/get-user-applications/ -> returns ApplicationList[]', () => {
    const applications = handleMockRequest<ApplicationList[]>('/applications/get-user-applications/', { method: 'GET' });
    expect(Array.isArray(applications)).toBe(true);
  });

  it('GET /jobs/task-status/{id}/ -> returns { task_id, status, result }', () => {
    const taskStatus = handleMockRequest<TaskStatusResponse>('/jobs/task-status/mock-task-99/', { method: 'GET' });
    expect(taskStatus.task_id).toBe('mock-task-99');
    expect(taskStatus.status).toBe('SUCCESS');
    expect(taskStatus.result).toBeDefined();
    expect(taskStatus.result?.match_score).toBe(92);
  });

  it('Unhandled mock route throws Unhandled mock route error', () => {
    expect(() => {
      handleMockRequest('/nope/', { method: 'GET' });
    }).toThrow(/Unhandled mock route/);
  });

  describe('Sync Guard: Every frontend API route has a mock handler', () => {
    const testCases: Array<{ name: string; endpoint: string; method: string; body?: any }> = [
      { name: 'login', endpoint: '/auth/token/', method: 'POST', body: JSON.stringify({ username: 'u', password: 'p' }) },
      { name: 'logout', endpoint: '/auth/token/blacklist/', method: 'POST', body: JSON.stringify({ refresh: 'r' }) },
      { name: 'register', endpoint: '/auth/registration/', method: 'POST', body: JSON.stringify({ username: 'u', email: 'e@t.com' }) },
      { name: 'resendEmailVerification', endpoint: '/auth/registration/resend-email/', method: 'POST' },
      { name: 'verifyEmail', endpoint: '/auth/registration/verify-email/', method: 'POST' },
      { name: 'changePassword', endpoint: '/auth/password/change/', method: 'POST' },
      { name: 'resetPassword', endpoint: '/auth/password/reset/', method: 'POST' },
      { name: 'resetPasswordConfirm', endpoint: '/auth/password/reset/confirm/', method: 'POST' },
      { name: 'getUser', endpoint: '/auth/user/', method: 'GET' },
      { name: 'updateUser', endpoint: '/auth/user/', method: 'PATCH', body: JSON.stringify({ first_name: 'test' }) },
      { name: 'getCompanies', endpoint: '/companies/companies/?search=tech', method: 'GET' },
      { name: 'createCompany', endpoint: '/companies/companies/', method: 'POST', body: JSON.stringify({ name: 'New Co' }) },
      { name: 'getCompanyDetail', endpoint: '/companies/companies/1/', method: 'GET' },
      { name: 'updateCompany', endpoint: '/companies/companies/1/', method: 'PATCH', body: JSON.stringify({ name: 'Up Co' }) },
      { name: 'getCompanyJobs', endpoint: '/companies/companies/1/jobs/', method: 'GET' },
      { name: 'getJobsList', endpoint: '/jobs/get-jobs-list/?search=dev', method: 'GET' },
      { name: 'getJobDetails', endpoint: '/jobs/get-job-details/1/', method: 'GET' },
      { name: 'getOwnerJobsList', endpoint: '/jobs/get-owner-jobs-list/', method: 'GET' },
      { name: 'postJob', endpoint: '/jobs/post-job/', method: 'POST', body: JSON.stringify({ title: 'New Job' }) },
      { name: 'editJobPost', endpoint: '/jobs/edit-job-post/1/', method: 'PATCH', body: JSON.stringify({ title: 'Edited' }) },
      { name: 'deleteJobPost', endpoint: '/jobs/delete-job-post/1/', method: 'DELETE' },
      { name: 'getJobsByAgent', endpoint: '/jobs/get_jobs_by_agent/', method: 'POST', body: JSON.stringify({ prompt: 'hi' }) },
      { name: 'getResumeAnalysis', endpoint: '/jobs/get_resume_analysis/1/', method: 'POST', body: JSON.stringify({ resume: 'url' }) },
      { name: 'getTaskStatus', endpoint: '/jobs/task-status/task-1/', method: 'GET' },
      { name: 'applyToJob', endpoint: '/applications/apply-to-job/1/', method: 'POST', body: JSON.stringify({ cover_letter: 'hi' }) },
      { name: 'getApplicationDetail', endpoint: '/applications/get-application/1/', method: 'GET' },
      { name: 'getJobApplications', endpoint: '/applications/get-job-applications/1/', method: 'GET' },
      { name: 'getUserApplications', endpoint: '/applications/get-user-applications/', method: 'GET' },
      { name: 'respondToApplication', endpoint: '/applications/respond-to-application/1/', method: 'PATCH', body: JSON.stringify({ application_status: 'ACCEPTED' }) }
    ];

    testCases.forEach(({ name, endpoint, method, body }) => {
      it(`Mock exists for ${name}: ${method} ${endpoint}`, () => {
        expect(() => {
          handleMockRequest(endpoint, { method, body });
        }).not.toThrow(/Unhandled mock route/);
      });
    });
  });
});
