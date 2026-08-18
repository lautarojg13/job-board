import { JobPost } from '../../types';
import { saveMockState } from './mockState';
import { MockRequestContext, MockHandlerResult } from './types';

/**
 * Handles Job Postings CRUD, filtering, AI Agent search queries.
 */
export function handleJobMock(ctx: MockRequestContext): MockHandlerResult {
  const { path, method, queryParams, options, state } = ctx;

  // Filtered Jobs List
  if (path === '/jobs/get-jobs-list/' && method === 'GET') {
    let result = state.jobs.map(j => ({
      id: j.id,
      title: j.title,
      description: j.description,
      company: j.company,
      location: j.location,
      posted_by: j.posted_by,
      posted_at: j.posted_at,
      status: j.status,
      employment_type: j.employment_type,
      salary: j.salary,
      work_mode: j.work_mode
    } as JobPost));

    const titleParam = queryParams.get('title') || queryParams.get('search');
    const locationParam = queryParams.get('location');
    const empTypeParam = queryParams.get('employment_type');
    const minSalary = queryParams.get('min_salary');
    const maxSalary = queryParams.get('max_salary');

    if (titleParam) {
      const q = titleParam.toLowerCase();
      result = result.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
      );
    }
    if (locationParam) {
      result = result.filter(j =>
        j.location?.toLowerCase().includes(locationParam.toLowerCase())
      );
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

    return { matched: true, data: result };
  }

  // Owner's Posted Jobs List
  if (path === '/jobs/get-owner-jobs-list/' && method === 'GET') {
    return { matched: true, data: state.jobs };
  }

  // Single Job Details
  const jobDetailMatch = path.match(/^\/jobs\/get-job-details\/(\d+)\/$/);
  if (jobDetailMatch && method === 'GET') {
    const jId = parseInt(jobDetailMatch[1], 10);
    const job = state.jobs.find(j => j.id === jId);
    if (!job) throw new Error('Job post not found');
    return { matched: true, data: job };
  }

  // Post New Job
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
    return { matched: true, data: newJob };
  }

  // Edit / Delete Job Post
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
      return { matched: true, data: {} };
    }

    if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse((options.body as string) || '{}');
      state.jobs[idx] = { ...state.jobs[idx], ...body };
      saveMockState({ jobs: state.jobs });
      return { matched: true, data: state.jobs[idx] };
    }

    if (method === 'GET') {
      return { matched: true, data: state.jobs[idx] };
    }
  }

  // AI Agent Search
  if (path === '/jobs/get_jobs_by_agent/' && method === 'POST') {
    return {
      matched: true,
      data: {
        task_id: `task_search_${Date.now()}`,
        message: 'Searching for jobs matching your prompt...'
      }
    };
  }

  return null;
}
