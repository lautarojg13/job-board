import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from './api';
import { djangoFetch } from './djangoService';
import { handleMockRequest } from './demoService';
import { setDemoModeEnabled } from './config';

vi.mock('./djangoService', () => ({
  djangoFetch: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock('./demoService', () => ({
  handleMockRequest: vi.fn().mockReturnValue({ mock: true })
}));

describe('apiService - Contract & Endpoint Routing', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    localStorage.clear();
    setDemoModeEnabled(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Demo Mode vs Django Mode routing', () => {
    it('routes requests to demoService when Demo Mode is enabled', async () => {
      vi.useFakeTimers();
      setDemoModeEnabled(true);
      const promise = apiService.getJobsList();
      await vi.advanceTimersByTimeAsync(350);
      const res = await promise;
      expect(handleMockRequest).toHaveBeenCalledWith(
        '/jobs/get-jobs-list/',
        expect.objectContaining({ method: 'GET' })
      );
      expect(djangoFetch).not.toHaveBeenCalled();
      expect(res).toEqual({ mock: true });
      vi.useRealTimers();
    });

    it('routes requests to djangoService when Demo Mode is disabled', async () => {
      setDemoModeEnabled(false);
      const res = await apiService.getJobsList();
      expect(djangoFetch).toHaveBeenCalledWith(
        '/jobs/get-jobs-list/',
        expect.objectContaining({ method: 'GET' })
      );
      expect(handleMockRequest).not.toHaveBeenCalled();
      expect(res).toEqual({ success: true });
    });
  });

  describe('Endpoint Contract Verification against djangoFetch', () => {
    it('login -> POST /auth/token/', async () => {
      await apiService.login({ username: 'dev', password: '123' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/token/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'dev', password: '123' })
        })
      );
    });

    it('logout -> POST /auth/token/blacklist/', async () => {
      localStorage.setItem('jobboard_refresh_token', 'sample-refresh');
      await apiService.logout();
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/token/blacklist/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refresh: 'sample-refresh' })
        })
      );
    });

    it('register -> POST /auth/registration/', async () => {
      await apiService.register({
        username: 'new',
        email: 'n@t.com',
        password1: 'p',
        password2: 'p',
        first_name: 'John',
        last_name: 'Doe'
      });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/registration/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('resendEmailVerification -> POST /auth/registration/resend-email/', async () => {
      await apiService.resendEmailVerification({ email: 'test@t.com' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/registration/resend-email/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('verifyEmail -> POST /auth/registration/verify-email/', async () => {
      await apiService.verifyEmail({ key: 'test-key' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/registration/verify-email/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('changePassword -> POST /auth/password/change/', async () => {
      await apiService.changePassword({ new_password1: '2', new_password2: '2' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/password/change/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('resetPassword -> POST /auth/password/reset/', async () => {
      await apiService.resetPassword({ email: 'test@t.com' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/password/reset/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('resetPasswordConfirm -> POST /auth/password/reset/confirm/', async () => {
      await apiService.resetPasswordConfirm({ uid: '1', token: 'tok', new_password1: '2', new_password2: '2' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/password/reset/confirm/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('getUser / updateUser -> GET / PATCH /auth/user/', async () => {
      await apiService.getUser();
      expect(djangoFetch).toHaveBeenCalledWith('/auth/user/', expect.objectContaining({ method: 'GET' }));

      await apiService.updateUser({ first_name: 'Jane' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/auth/user/',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ first_name: 'Jane' })
        })
      );
    });

    it('getCompanies / createCompany -> GET / POST /companies/companies/ (+ ordering, search)', async () => {
      await apiService.getCompanies({ ordering: 'name', search: 'Tech' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/companies/companies/?ordering=name&search=Tech',
        expect.objectContaining({ method: 'GET' })
      );

      await apiService.createCompany({ name: 'Tech Corp', website: 'https://tech.com' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/companies/companies/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('getCompanyDetail / updateCompany -> GET / PATCH /companies/companies/{id}/', async () => {
      await apiService.getCompanyDetail(42);
      expect(djangoFetch).toHaveBeenCalledWith('/companies/companies/42/', expect.objectContaining({ method: 'GET' }));

      await apiService.updateCompany(42, { description: 'Updated' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/companies/companies/42/',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ description: 'Updated' })
        })
      );
    });

    it('getCompanyJobs -> GET /companies/companies/{id}/jobs/', async () => {
      await apiService.getCompanyJobs(42, { search: 'React' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/companies/companies/42/jobs/?search=React',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('getJobsList -> GET /jobs/get-jobs-list/ (query completo)', async () => {
      await apiService.getJobsList({
        company: '5',
        employment_type: 'FT',
        location: 'Remote',
        max_salary: 120000,
        min_salary: 80000,
        ordering: '-created_at',
        search: 'Fullstack',
        title: 'Engineer'
      });

      const calledUrl = vi.mocked(djangoFetch).mock.calls[0][0];
      expect(calledUrl).toContain('/jobs/get-jobs-list/?');
      expect(calledUrl).toContain('company=5');
      expect(calledUrl).toContain('employment_type=FT');
      expect(calledUrl).toContain('location=Remote');
      expect(calledUrl).toContain('max_salary=120000');
      expect(calledUrl).toContain('min_salary=80000');
      expect(calledUrl).toContain('ordering=-created_at');
      expect(calledUrl).toContain('search=Fullstack');
      expect(calledUrl).toContain('title=Engineer');
    });

    it('getJobDetails -> GET /jobs/get-job-details/{id}/', async () => {
      await apiService.getJobDetails(10);
      expect(djangoFetch).toHaveBeenCalledWith('/jobs/get-job-details/10/', expect.objectContaining({ method: 'GET' }));
    });

    it('getOwnerJobsList -> GET /jobs/get-owner-jobs-list/', async () => {
      await apiService.getOwnerJobsList({ search: 'Dev' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/jobs/get-owner-jobs-list/?search=Dev',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('postJob -> POST /jobs/post-job/', async () => {
      await apiService.postJob({ title: 'Dev', company: 1, description: 'Code' });
      expect(djangoFetch).toHaveBeenCalledWith('/jobs/post-job/', expect.objectContaining({ method: 'POST' }));
    });

    it('editJobPost -> PATCH /jobs/edit-job-post/{id}/', async () => {
      await apiService.editJobPost(10, { title: 'Senior Dev' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/jobs/edit-job-post/10/',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ title: 'Senior Dev' })
        })
      );
    });

    it('deleteJobPost -> DELETE /jobs/delete-job-post/{id}/', async () => {
      await apiService.deleteJobPost(10);
      expect(djangoFetch).toHaveBeenCalledWith('/jobs/delete-job-post/10/', expect.objectContaining({ method: 'DELETE' }));
    });

    it('getJobsByAgent -> POST /jobs/get_jobs_by_agent/', async () => {
      await apiService.getJobsByAgent({ user_prompt: 'Find Python remote' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/jobs/get_jobs_by_agent/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ user_prompt: 'Find Python remote' })
        })
      );
    });

    it('getResumeAnalysis -> POST /jobs/get_resume_analysis/{id}/ (File -> FormData, string -> JSON)', async () => {
      // File branch
      const sampleFile = new File(['sample content'], 'resume.pdf', { type: 'application/pdf' });
      await apiService.getResumeAnalysis(10, sampleFile);
      expect(djangoFetch).toHaveBeenCalledWith(
        '/jobs/get_resume_analysis/10/',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );

      // String URL branch
      await apiService.getResumeAnalysis(10, 'https://example.com/cv.pdf');
      expect(djangoFetch).toHaveBeenCalledWith(
        '/jobs/get_resume_analysis/10/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ resume: 'https://example.com/cv.pdf' })
        })
      );
    });

    it('getTaskStatus -> GET /jobs/task-status/{id}/', async () => {
      await apiService.getTaskStatus('task-abc-123');
      expect(djangoFetch).toHaveBeenCalledWith(
        '/jobs/task-status/task-abc-123/',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('applyToJob -> POST /applications/apply-to-job/{id}/ (File -> FormData)', async () => {
      const file = new File(['content'], 'cv.pdf');
      await apiService.applyToJob(5, { resume: file, cover_letter: 'Hello!' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/applications/apply-to-job/5/',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });

    it('getApplicationDetail -> GET /applications/get-application/{id}/', async () => {
      await apiService.getApplicationDetail(7);
      expect(djangoFetch).toHaveBeenCalledWith(
        '/applications/get-application/7/',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('getJobApplications / getUserApplications -> GET /applications/...', async () => {
      await apiService.getJobApplications(5, { status: 'pending' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/applications/get-job-applications/5/?status=pending',
        expect.objectContaining({ method: 'GET' })
      );

      await apiService.getUserApplications({ ordering: '-created_at' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/applications/get-user-applications/?ordering=-created_at',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('respondToApplication -> PATCH /applications/respond-to-application/{id}/', async () => {
      await apiService.respondToApplication(7, { application_status: 'accepted', message: 'Great match' });
      expect(djangoFetch).toHaveBeenCalledWith(
        '/applications/respond-to-application/7/',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ application_status: 'accepted', message: 'Great match' })
        })
      );
    });
  });
});
