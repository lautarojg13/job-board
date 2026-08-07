/**
 * TypeScript type definitions strictly corresponding to api_documentation.json
 */

export type RoleEnum = 'USER' | 'ADMIN';

export type JobPostStatusEnum = 'active' | 'closed' | 'paused' | 'archived';

export type EmploymentTypeEnum = 'FT' | 'PT' | 'CT';

export type WorkModeEnum = 'hybrid' | 'onsite' | 'remote';

export type ApplicationStatusEnum = 'pending' | 'reviewed' | 'withdrawn' | 'accepted' | 'rejected';

export interface CustomUserDetails {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: RoleEnum;
}

export interface CustomUserDetailsRequest {
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface PatchedCustomUserDetailsRequest {
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface CustomUserRegistrationRequest {
  username: string;
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface Token {
  key: string;
}

export interface RestAuthDetail {
  detail: string;
}

export interface PasswordChangeRequest {
  new_password1: string;
  new_password2: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  new_password1: string;
  new_password2: string;
  uid: string;
  token: string;
}

export interface ResendEmailVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  key: string;
}

export interface PublicCompany {
  id: number;
  name: string;
  description?: string | null;
  website?: string | null;
  followers_count: number;
}

export interface PublicCompanyRequest {
  name: string;
  description?: string | null;
  website?: string | null;
}

export interface PatchedPublicCompanyRequest {
  name?: string;
  description?: string | null;
  website?: string | null;
}

export interface JobPost {
  id: number;
  title: string;
  description?: string | null;
  company?: number | null;
  location?: string | null;
  posted_by?: number | null;
  posted_at: string;
  status?: JobPostStatusEnum;
  employment_type?: EmploymentTypeEnum;
  salary?: number | null;
  work_mode?: WorkModeEnum;
}

export interface JobPostList {
  id: number;
  title: string;
  description?: string | null;
  company?: number | null;
  location?: string | null;
  status?: JobPostStatusEnum;
  employment_type?: EmploymentTypeEnum;
  salary?: number | null;
  work_mode?: WorkModeEnum;
}

export interface JobPostCreateRequest {
  title: string;
  description?: string | null;
  company?: number | null;
  location?: string | null;
  status?: JobPostStatusEnum;
  employment_type?: EmploymentTypeEnum;
  salary?: number | null;
  work_mode?: WorkModeEnum;
}

export interface JobPostCreate {
  title: string;
  description?: string | null;
  company?: number | null;
  location?: string | null;
  status?: JobPostStatusEnum;
  employment_type?: EmploymentTypeEnum;
  salary?: number | null;
  work_mode?: WorkModeEnum;
}

export interface JobPostRequest {
  title: string;
  description?: string | null;
  location?: string | null;
  status?: JobPostStatusEnum;
  employment_type?: EmploymentTypeEnum;
  salary?: number | null;
  work_mode?: WorkModeEnum;
}

export interface PatchedJobPostRequest {
  title?: string;
  description?: string | null;
  location?: string | null;
  status?: JobPostStatusEnum;
  employment_type?: EmploymentTypeEnum;
  salary?: number | null;
  work_mode?: WorkModeEnum;
}

export interface ApplicationCreateRequest {
  cover_letter?: string | null;
  resume: File | string;
}

export interface ApplicationCreate {
  cover_letter?: string | null;
  resume: string;
}

export interface ApplicationDetail {
  id: number;
  status: ApplicationStatusEnum;
  created_at: string;
  updated_at: string;
  applicant_id: number;
  job_id: number;
  cover_letter?: string | null;
  resume: string;
}

export interface ApplicationList {
  id: number;
  status: ApplicationStatusEnum;
  created_at: string;
  updated_at: string;
  job_id: number;
}

export interface PatchedApplicationStatusUpdateRequest {
  application_status?: ApplicationStatusEnum;
  message?: string;
}

export interface ApplicationStatusUpdate {
  application_status: ApplicationStatusEnum;
  message?: string;
}

export interface JobSearchInputRequest {
  user_prompt: string;
}

export interface JobSearchInput {
  user_prompt: string;
}

export interface ResumeAnalysisRequest {
  resume: File | string;
}

export interface ResumeAnalysis {
  resume: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  result: any;
}

export interface JobsListQueryParams {
  company?: string;
  employment_type?: EmploymentTypeEnum;
  location?: string;
  max_salary?: number;
  min_salary?: number;
  ordering?: string;
  search?: string;
  title?: string;
}

export interface ApplicationsQueryParams {
  applicant?: number;
  created_after?: string;
  created_before?: string;
  job?: number;
  ordering?: string;
  search?: string;
  status?: ApplicationStatusEnum;
}
