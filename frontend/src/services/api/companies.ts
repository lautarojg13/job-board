import {
  PublicCompany,
  PublicCompanyRequest,
  PatchedPublicCompanyRequest,
  JobPost
} from '../../types';
import { apiFetch, buildQueryString, jsonRequest } from './client';

export interface CompanyQueryParams {
  ordering?: string;
  search?: string;
}

export const companiesApi = {
  getCompanies: (params?: CompanyQueryParams) =>
    apiFetch<PublicCompany[]>(`/companies/companies/${buildQueryString(params)}`, { method: 'GET' }),

  createCompany: (data: PublicCompanyRequest) =>
    apiFetch<PublicCompany>('/companies/companies/', jsonRequest('POST', data)),

  getCompanyDetail: (company_id: number) =>
    apiFetch<PublicCompany>(`/companies/companies/${company_id}/`, { method: 'GET' }),

  updateCompany: (company_id: number, data: PatchedPublicCompanyRequest) =>
    apiFetch<PublicCompany>(`/companies/companies/${company_id}/`, jsonRequest('PATCH', data)),

  getCompanyJobs: (company_id: number, params?: CompanyQueryParams) =>
    apiFetch<JobPost[]>(`/companies/companies/${company_id}/jobs/${buildQueryString(params)}`, { method: 'GET' })
};
