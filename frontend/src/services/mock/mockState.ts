import {
  PublicCompany,
  JobPost,
  ApplicationDetail,
  CustomUserDetails
} from '../../types';
import {
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_USER
} from '../mockData';
import { MockState } from './types';

const STORAGE_KEYS = {
  COMPANIES: 'jobboard_mock_companies',
  JOBS: 'jobboard_mock_jobs',
  APPLICATIONS: 'jobboard_mock_apps',
  USER: 'jobboard_mock_user'
} as const;

/**
 * Loads mock database state from localStorage or falls back to seed data
 */
export function getMockState(): MockState {
  const compStr = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  const jobStr = localStorage.getItem(STORAGE_KEYS.JOBS);
  const appStr = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);

  return {
    companies: compStr ? (JSON.parse(compStr) as PublicCompany[]) : INITIAL_COMPANIES,
    jobs: jobStr ? (JSON.parse(jobStr) as JobPost[]) : INITIAL_JOBS,
    applications: appStr ? (JSON.parse(appStr) as ApplicationDetail[]) : INITIAL_APPLICATIONS,
    user: userStr ? (JSON.parse(userStr) as CustomUserDetails) : INITIAL_USER
  };
}

/**
 * Persists modified mock database state to localStorage
 */
export function saveMockState(state: {
  companies?: PublicCompany[];
  jobs?: JobPost[];
  applications?: ApplicationDetail[];
  user?: CustomUserDetails;
}) {
  if (state.companies) localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(state.companies));
  if (state.jobs) localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(state.jobs));
  if (state.applications) localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(state.applications));
  if (state.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
}
