import { ApplicationDetail, ApplicationList } from '../../types';
import { saveMockState } from './mockState';
import { MockRequestContext, MockHandlerResult } from './types';

/**
 * Handles Job Applications submission, review, and status update endpoints.
 */
export function handleApplicationMock(ctx: MockRequestContext): MockHandlerResult {
  const { path, method, queryParams, options, state } = ctx;

  // Apply to Job: /applications/apply-to-job/:id/
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
      matched: true,
      data: {
        cover_letter: coverLetter,
        resume: resumeUrl
      }
    };
  }

  // Get Current User's Applications
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
    return { matched: true, data: result };
  }

  // Get Applications submitted for a specific Job
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
    return { matched: true, data: result };
  }

  // Single Application Details
  const appDetailMatch = path.match(/^\/applications\/get-application\/(\d+)\/$/);
  if (appDetailMatch && method === 'GET') {
    const aId = parseInt(appDetailMatch[1], 10);
    const app = state.applications.find(a => a.id === aId);
    if (!app) throw new Error('Application not found');
    return { matched: true, data: app };
  }

  // Employer response / status update to an Application
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
      matched: true,
      data: {
        application_status: body.application_status || 'reviewed',
        message: body.message || 'Application status updated successfully.'
      }
    };
  }

  return null;
}
