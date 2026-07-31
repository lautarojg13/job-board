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
  JobPostList,
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
  ResumeAnalysis,
  JobsListQueryParams,
  ApplicationsQueryParams,
  PatchedCustomUserDetailsRequest
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_USER
} from './mockData';

// Configuration keys
const BASE_URL_KEY = 'jobboard_api_base_url';
const AUTH_TOKEN_KEY = 'jobboard_auth_token';
const DEMO_MODE_KEY = 'jobboard_demo_mode';

export function getStoredApiBaseUrl(): string {
  return localStorage.getItem(BASE_URL_KEY) || 'http://localhost:8000';
}

export function setStoredApiBaseUrl(url: string) {
  localStorage.setItem(BASE_URL_KEY, url.replace(/\/$/, ''));
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

export function isDemoModeEnabled(): boolean {
  const val = localStorage.getItem(DEMO_MODE_KEY);
  return val === null ? true : val === 'true'; // default to true for interactive preview unless configured
}

export function setDemoModeEnabled(enabled: boolean) {
  localStorage.setItem(DEMO_MODE_KEY, String(enabled));
}

// In-memory / localStorage state for Demo Mode
function getMockState() {
  const compStr = localStorage.getItem('jobboard_mock_companies');
  const jobStr = localStorage.getItem('jobboard_mock_jobs');
  const appStr = localStorage.getItem('jobboard_mock_apps');
  const userStr = localStorage.getItem('jobboard_mock_user');

  return {
    companies: compStr ? (JSON.parse(compStr) as PublicCompany[]) : INITIAL_COMPANIES,
    jobs: jobStr ? (JSON.parse(jobStr) as JobPost[]) : INITIAL_JOBS,
    applications: appStr ? (JSON.parse(appStr) as ApplicationDetail[]) : INITIAL_APPLICATIONS,
    user: userStr ? (JSON.parse(userStr) as CustomUserDetails) : INITIAL_USER
  };
}

function saveMockState(state: {
  companies?: PublicCompany[];
  jobs?: JobPost[];
  applications?: ApplicationDetail[];
  user?: CustomUserDetails;
}) {
  if (state.companies) localStorage.setItem('jobboard_mock_companies', JSON.stringify(state.companies));
  if (state.jobs) localStorage.setItem('jobboard_mock_jobs', JSON.stringify(state.jobs));
  if (state.applications) localStorage.setItem('jobboard_mock_apps', JSON.stringify(state.applications));
  if (state.user) localStorage.setItem('jobboard_mock_user', JSON.stringify(state.user));
}

// Universal fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getStoredApiBaseUrl();
  const token = getStoredAuthToken();
  const demoMode = isDemoModeEnabled();

  if (demoMode) {
    // If demo mode, handle mock logic immediately or throw realistic delay
    await new Promise((resolve) => setTimeout(resolve, 250));
    return handleMockRequest<T>(endpoint, options);
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>)
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Token ${token}`;
  }

  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { detail: errorText || `HTTP error ${response.status}` };
      }
      throw new Error(errorJson.detail || errorJson.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    // If backend is unreachable, throw informative error
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error(`Unable to connect to Django API server at ${baseUrl}. Verify server is running or enable Demo Mode.`);
    }
    throw error;
  }
}

// Handler for mock fallback
function handleMockRequest<T>(endpoint: string, options: RequestInit): T {
  const method = (options.method || 'GET').toUpperCase();
  const state = getMockState();

  // Helper parsing query parameters
  const [path, queryString] = endpoint.split('?');
  const queryParams = new URLSearchParams(queryString || '');

  // Auth: Login
  if (path === '/auth/login/' && method === 'POST') {
    const tokenKey = 'demo_token_' + Math.random().toString(36).substring(2, 10);
    setStoredAuthToken(tokenKey);
    return { key: tokenKey } as T;
  }

  // Auth: Logout
  if (path === '/auth/logout/' && method === 'POST') {
    setStoredAuthToken(null);
    return { detail: 'Successfully logged out.' } as T;
  }

  // Auth: Register
  if (path === '/auth/registration/' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    if (body.username && body.email) {
      state.user.username = body.username;
      state.user.email = body.email;
      state.user.first_name = body.first_name || '';
      state.user.last_name = body.last_name || '';
      saveMockState({ user: state.user });
    }
    return { detail: 'Verification e-mail sent.' } as T;
  }

  // Auth: Get/Update User
  if (path === '/auth/user/') {
    if (method === 'GET') {
      return state.user as T;
    } else if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse((options.body as string) || '{}');
      state.user = {
        ...state.user,
        ...body
      };
      saveMockState({ user: state.user });
      return state.user as T;
    }
  }

  // Auth Password Change / Reset / Verify
  if (path === '/auth/password/change/' || path === '/auth/password/reset/' || path === '/auth/password/reset/confirm/') {
    return { detail: 'Password action completed successfully.' } as T;
  }
  if (path === '/auth/registration/resend-email/' || path === '/auth/registration/verify-email/') {
    return { detail: 'Email action completed successfully.' } as T;
  }

  // Companies List & Create
  if (path === '/companies/companies/' && method === 'GET') {
    let result = [...state.companies];
    const search = queryParams.get('search');
    if (search) {
      result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));
    }
    return result as T;
  }
  if (path === '/companies/companies/' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    const newCompany: PublicCompany = {
      id: Date.now(),
      name: body.name,
      description: body.description || null,
      website: body.website || null,
      followers_count: 0
    };
    state.companies.unshift(newCompany);
    saveMockState({ companies: state.companies });
    return newCompany as T;
  }

  // Single Company details / update
  const companyMatch = path.match(/^\/companies\/companies\/(\d+)\/$/);
  if (companyMatch) {
    const compId = parseInt(companyMatch[1], 10);
    const comp = state.companies.find(c => c.id === compId);
    if (!comp) throw new Error('Company not found');

    if (method === 'GET') return comp as T;
    if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse((options.body as string) || '{}');
      Object.assign(comp, body);
      saveMockState({ companies: state.companies });
      return comp as T;
    }
  }

  // Company Jobs list
  const companyJobsMatch = path.match(/^\/companies\/companies\/(\d+)\/jobs\/$/);
  if (companyJobsMatch && method === 'GET') {
    const compId = parseInt(companyJobsMatch[1], 10);
    const result = state.jobs
      .filter(j => j.company === compId)
      .map(j => ({
        id: j.id,
        title: j.title,
        description: j.description,
        company: j.company,
        location: j.location,
        status: j.status,
        employment_type: j.employment_type,
        salary: j.salary,
        work_mode: j.work_mode
      } as JobPostList));
    return result as T;
  }

  // Jobs List
  if (path === '/jobs/get-jobs-list/' && method === 'GET') {
    let result = state.jobs.map(j => ({
      id: j.id,
      title: j.title,
      description: j.description,
      company: j.company,
      location: j.location,
      status: j.status,
      employment_type: j.employment_type,
      salary: j.salary,
      work_mode: j.work_mode
    } as JobPostList));

    const titleParam = queryParams.get('title') || queryParams.get('search');
    const locationParam = queryParams.get('location');
    const empTypeParam = queryParams.get('employment_type');
    const minSalary = queryParams.get('min_salary');
    const maxSalary = queryParams.get('max_salary');

    if (titleParam) {
      result = result.filter(j => j.title.toLowerCase().includes(titleParam.toLowerCase()) || j.description?.toLowerCase().includes(titleParam.toLowerCase()));
    }
    if (locationParam) {
      result = result.filter(j => j.location?.toLowerCase().includes(locationParam.toLowerCase()));
    }
    if (empTypeParam) {
      result = result.filter(j => j.employment_type === empTypeParam);
    }
    if (minSalary) {
      result = result.filter(j => (j.salary || 0) >= parseInt(minSalary, 10));
    }
    if (maxSalary) {
      result = result.filter(j => (j.salary || 0) <= parseInt(maxSalary, 10));
    }

    return result as T;
  }

  // Owner Jobs List
  if (path === '/jobs/get-owner-jobs-list/' && method === 'GET') {
    return state.jobs as T;
  }

  // Single Job Details
  const jobDetailMatch = path.match(/^\/jobs\/get-job-details\/(\d+)\/$/);
  if (jobDetailMatch && method === 'GET') {
    const jId = parseInt(jobDetailMatch[1], 10);
    const job = state.jobs.find(j => j.id === jId);
    if (!job) throw new Error('Job post not found');
    return job as T;
  }

  // Post Job
  if (path === '/jobs/post-job/' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    const newJob: JobPost = {
      id: Date.now(),
      title: body.title,
      description: body.description || null,
      company: body.company || 101,
      location: body.location || 'Remote',
      posted_by: state.user.id,
      posted_at: new Date().toISOString(),
      status: body.status || 'active',
      employment_type: body.employment_type || 'FT',
      salary: body.salary || null,
      work_mode: body.work_mode || 'remote'
    };
    state.jobs.unshift(newJob);
    saveMockState({ jobs: state.jobs });
    return newJob as T;
  }

  // Edit / Delete Job
  const editJobMatch = path.match(/^\/jobs\/edit-job-post\/(\d+)\/$/);
  const deleteJobMatch = path.match(/^\/jobs\/delete-job-post\/(\d+)\/$/);
  const matchedJobId = editJobMatch || deleteJobMatch;

  if (matchedJobId) {
    const jId = parseInt(matchedJobId[1], 10);
    const idx = state.jobs.findIndex(j => j.id === jId);
    if (idx === -1) throw new Error('Job not found');

    if (method === 'DELETE') {
      state.jobs.splice(idx, 1);
      saveMockState({ jobs: state.jobs });
      return {} as T;
    } else if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse((options.body as string) || '{}');
      state.jobs[idx] = { ...state.jobs[idx], ...body };
      saveMockState({ jobs: state.jobs });
      return state.jobs[idx] as T;
    } else if (method === 'GET') {
      return state.jobs[idx] as T;
    }
  }

  // AI Agent Search
  if (path === '/jobs/get_jobs_by_agent/' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    return {
      user_prompt: body.user_prompt || ''
    } as T;
  }

  // Apply to Job
  const applyMatch = path.match(/^\/applications\/apply-to-job\/(\d+)\/$/);
  if (applyMatch && method === 'POST') {
    const jId = parseInt(applyMatch[1], 10);
    let coverLetter = '';
    let resumeUrl = 'https://example.com/resumes/my_uploaded_resume.pdf';

    if (options.body instanceof FormData) {
      coverLetter = (options.body.get('cover_letter') as string) || '';
      const resumeFile = options.body.get('resume');
      if (resumeFile && typeof resumeFile !== 'string') {
        resumeUrl = `https://example.com/resumes/${(resumeFile as File).name}`;
      }
    } else if (typeof options.body === 'string') {
      const body = JSON.parse(options.body);
      coverLetter = body.cover_letter || '';
      resumeUrl = typeof body.resume === 'string' ? body.resume : resumeUrl;
    }

    const newApp: ApplicationDetail = {
      id: Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      applicant_id: state.user.id,
      job_id: jId,
      cover_letter: coverLetter,
      resume: resumeUrl
    };

    state.applications.unshift(newApp);
    saveMockState({ applications: state.applications });

    return {
      cover_letter: coverLetter,
      resume: resumeUrl
    } as T;
  }

  // Get User Applications
  if (path === '/applications/get-user-applications/' && method === 'GET') {
    let result = state.applications.map(a => ({
      id: a.id,
      status: a.status,
      created_at: a.created_at,
      updated_at: a.updated_at,
      job_id: a.job_id
    } as ApplicationList));

    const statusParam = queryParams.get('status');
    if (statusParam) {
      result = result.filter(a => a.status === statusParam);
    }
    return result as T;
  }

  // Get Job Applications for Job
  const jobAppsMatch = path.match(/^\/applications\/get-job-applications\/(\d+)\/$/);
  if (jobAppsMatch && method === 'GET') {
    const jId = parseInt(jobAppsMatch[1], 10);
    let result = state.applications
      .filter(a => a.job_id === jId)
      .map(a => ({
        id: a.id,
        status: a.status,
        created_at: a.created_at,
        updated_at: a.updated_at,
        job_id: a.job_id
      } as ApplicationList));

    const statusParam = queryParams.get('status');
    if (statusParam) {
      result = result.filter(a => a.status === statusParam);
    }
    return result as T;
  }

  // Single Application detail
  const appDetailMatch = path.match(/^\/applications\/get-application\/(\d+)\/$/);
  if (appDetailMatch && method === 'GET') {
    const aId = parseInt(appDetailMatch[1], 10);
    const app = state.applications.find(a => a.id === aId);
    if (!app) throw new Error('Application not found');
    return app as T;
  }

  // Respond to Application
  const appRespondMatch = path.match(/^\/applications\/respond-to-application\/(\d+)\/$/);
  if (appRespondMatch && method === 'PATCH') {
    const aId = parseInt(appRespondMatch[1], 10);
    const body = JSON.parse((options.body as string) || '{}');
    const app = state.applications.find(a => a.id === aId);
    if (app) {
      if (body.application_status) {
        app.status = body.application_status;
        app.updated_at = new Date().toISOString();
      }
      saveMockState({ applications: state.applications });
    }
    return {
      application_status: body.application_status || 'reviewed',
      message: body.message || 'Application status updated successfully.'
    } as T;
  }

  // Resume Analysis
  const resumeAnalysisMatch = path.match(/^\/jobs\/get_resume_analysis\/(\d+)\/$/);
  if (resumeAnalysisMatch && method === 'POST') {
    return {
      resume: 'https://example.com/resumes/analyzed_resume.pdf'
    } as T;
  }

  // Task status
  const taskStatusMatch = path.match(/^\/jobs\/task-status\/(.+)\/$/);
  if (taskStatusMatch && method === 'GET') {
    return {
      task_id: taskStatusMatch[1],
      status: 'SUCCESS',
      result: { match_score: 92, recommendations: ['Strong match for React and Python skills.'] }
    } as T;
  }

  throw new Error(`Unhandled mock route: ${method} ${path}`);
}

// Public API Service methods mapping 1:1 to api_documentation.json

export const apiService = {
  // Auth
  login: (data: LoginRequest) =>
    apiFetch<Token>('/auth/login/', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    apiFetch<RestAuthDetail>('/auth/logout/', { method: 'POST' }),

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
    return apiFetch<JobPostList[]>(`/companies/companies/${company_id}/jobs/${qs}`, { method: 'GET' });
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
    return apiFetch<JobPostList[]>(`/jobs/get-jobs-list/${qs}`, { method: 'GET' });
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
      return apiFetch<ResumeAnalysis>(`/jobs/get_resume_analysis/${job_id}/`, {
        method: 'POST',
        body: formData
      });
    } else {
      return apiFetch<ResumeAnalysis>(`/jobs/get_resume_analysis/${job_id}/`, {
        method: 'POST',
        body: JSON.stringify({ resume })
      });
    }
  },

  getTaskStatus: (task_id: string) =>
    apiFetch<TaskStatusResponse>(`/jobs/task-status/${task_id}/`, { method: 'GET' }),

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
