import { PublicCompany, JobPost } from '../../types';
import { saveMockState } from './mockState';
import { MockRequestContext, MockHandlerResult } from './types';

/**
 * Handles Company CRUD and company jobs list mock endpoints.
 */
export function handleCompanyMock(ctx: MockRequestContext): MockHandlerResult {
  const { path, method, queryParams, options, state } = ctx;

  // Companies List & Creation
  if (path === '/companies/companies/') {
    if (method === 'GET') {
      let result = [...state.companies];
      const search = queryParams.get('search');
      if (search) {
        const query = search.toLowerCase();
        result = result.filter(
          c =>
            c.name.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query)
        );
      }
      return { matched: true, data: result };
    }

    if (method === 'POST') {
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
      return { matched: true, data: newCompany };
    }
  }

  // Single Company details / update: /companies/companies/:id/
  const companyMatch = path.match(/^\/companies\/companies\/(\d+)\/$/);
  if (companyMatch) {
    const compId = parseInt(companyMatch[1], 10);
    const comp = state.companies.find(c => c.id === compId);
    if (!comp) throw new Error('Company not found');

    if (method === 'GET') {
      return { matched: true, data: comp };
    }
    if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse((options.body as string) || '{}');
      Object.assign(comp, body);
      saveMockState({ companies: state.companies });
      return { matched: true, data: comp };
    }
  }

  // Company Jobs List: /companies/companies/:id/jobs/
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
        posted_by: j.posted_by,
        posted_at: j.posted_at,
        status: j.status,
        employment_type: j.employment_type,
        salary: j.salary,
        work_mode: j.work_mode
      } as JobPost));
    return { matched: true, data: result };
  }

  return null;
}
