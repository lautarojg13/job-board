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
  PatchedCustomUserDetailsRequest
} from '../../types';
import { getStoredRefreshToken } from '../config';
import { apiFetch, jsonRequest } from './client';

export const authApi = {
  login: (data: LoginRequest) =>
    apiFetch<Token>('/auth/login/', jsonRequest('POST', data)),

  logout: () =>
    apiFetch<RestAuthDetail>('/auth/logout/', jsonRequest('POST', { refresh: getStoredRefreshToken() })),

  register: (data: CustomUserRegistrationRequest) =>
    apiFetch<RestAuthDetail>('/auth/registration/', jsonRequest('POST', data)),

  resendEmailVerification: (data: ResendEmailVerificationRequest) =>
    apiFetch<RestAuthDetail>('/auth/registration/resend-email/', jsonRequest('POST', data)),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiFetch<RestAuthDetail>('/auth/registration/verify-email/', jsonRequest('POST', data)),

  changePassword: (data: PasswordChangeRequest) =>
    apiFetch<RestAuthDetail>('/auth/password/change/', jsonRequest('POST', data)),

  resetPassword: (data: PasswordResetRequest) =>
    apiFetch<RestAuthDetail>('/auth/password/reset/', jsonRequest('POST', data)),

  resetPasswordConfirm: (data: PasswordResetConfirmRequest) =>
    apiFetch<RestAuthDetail>('/auth/password/reset/confirm/', jsonRequest('POST', data)),

  getUser: () =>
    apiFetch<CustomUserDetails>('/auth/user/', { method: 'GET' }),

  updateUser: (data: PatchedCustomUserDetailsRequest) =>
    apiFetch<CustomUserDetails>('/auth/user/', jsonRequest('PATCH', data))
};
