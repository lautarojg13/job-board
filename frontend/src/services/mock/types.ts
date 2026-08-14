import { PublicCompany, JobPost, ApplicationDetail, CustomUserDetails } from '../../types';

export interface MockState {
  companies: PublicCompany[];
  jobs: JobPost[];
  applications: ApplicationDetail[];
  user: CustomUserDetails;
}

export interface MockRequestContext {
  path: string;
  method: string;
  queryParams: URLSearchParams;
  options: RequestInit;
  state: MockState;
}

export interface MockHandlerMatch<T = unknown> {
  matched: true;
  data: T;
}

export type MockHandlerResult<T = unknown> = MockHandlerMatch<T> | null;

export type MockRouteHandler = (ctx: MockRequestContext) => MockHandlerResult;
