import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../../context/AuthContext';
import { apiService } from '../../services/api';

vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api')>();
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      login: vi.fn(),
      getUser: vi.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_employer: false
      })
    }
  };
});

describe('LoginForm Component', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  const setIsLoading = vi.fn();
  const onClose = vi.fn();
  const onResetAlerts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (isLoading = false) => {
    return render(
      <AuthProvider>
        <LoginForm
          onSuccess={onSuccess}
          onError={onError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onClose={onClose}
          onResetAlerts={onResetAlerts}
        />
      </AuthProvider>
    );
  };

  it('completes username + password, submits, calls apiService.login and triggers onSuccess on successful login', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.login).mockResolvedValueOnce({
      access: 'access-token-123',
      refresh: 'refresh-token-123'
    });

    renderLoginForm();

    const usernameInput = screen.getByPlaceholderText('e.g. alex_dev');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await user.type(usernameInput, 'alex_dev');
    await user.type(passwordInput, 'SecretPass123!');
    await user.click(submitBtn);

    expect(onResetAlerts).toHaveBeenCalled();
    expect(setIsLoading).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith({
        username: 'alex_dev',
        email: '',
        password: 'SecretPass123!'
      });
      expect(onSuccess).toHaveBeenCalledWith('Logged in successfully!');
    });
  });

  it('triggers onError when apiService.login fails', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.login).mockRejectedValueOnce(
      new Error('Invalid credentials provided')
    );

    renderLoginForm();

    const usernameInput = screen.getByPlaceholderText('e.g. alex_dev');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await user.type(usernameInput, 'wrong_user');
    await user.type(passwordInput, 'wrong_pass');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Invalid credentials provided');
    });
  });

  it('shows email input only when username is empty', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    expect(screen.getByPlaceholderText('alex@example.com')).toBeInTheDocument();

    const usernameInput = screen.getByPlaceholderText('e.g. alex_dev');
    await user.type(usernameInput, 'john_doe');

    expect(screen.queryByPlaceholderText('alex@example.com')).not.toBeInTheDocument();
  });
});
