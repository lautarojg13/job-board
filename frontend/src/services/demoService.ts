import {
  PublicCompany,
  JobPost,
  ApplicationDetail,
  CustomUserDetails,
  JobPostList,
  ApplicationList
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_USER
} from './mockData';
import { setStoredAuthToken, setStoredRefreshToken } from './config';

// In-memory / localStorage state management for Demo Mode
export function getMockState() {
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

export function saveMockState(state: {
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

/**
 * Handles simulated requests for Demo Mode without contacting the real Django server.
 */
export function handleMockRequest<T>(endpoint: string, options: RequestInit): T {
  const method = (options.method || 'GET').toUpperCase();
  const state = getMockState();

  // Helper parsing query parameters
  const [path, queryString] = endpoint.split('?');
  const queryParams = new URLSearchParams(queryString || '');

  // Auth: Token (Login)
  if (path === '/auth/token/' && method === 'POST') {
    const access = 'demo_access_' + Math.random().toString(36).substring(2, 10);
    const refresh = 'demo_refresh_' + Math.random().toString(36).substring(2, 10);
    setStoredAuthToken(access);
    setStoredRefreshToken(refresh);
    return { access, refresh } as T;
  }

  // Auth: Token Refresh
  if (path === '/auth/token/refresh/' && method === 'POST') {
    const access = 'demo_access_refreshed_' + Math.random().toString(36).substring(2, 10);
    setStoredAuthToken(access);
    return { access } as T;
  }

  // Auth: Token Blacklist (Logout)
  if (path === '/auth/token/blacklist/' && method === 'POST') {
    setStoredAuthToken(null);
    setStoredRefreshToken(null);
    return { detail: 'Token blacklisted.' } as T;
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
    const taskId = 'demo_task_' + Math.random().toString(36).substring(2, 10);
    return {
      task_id: taskId,
      message: 'Analizing resume...'
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
