import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiAgentView } from './AiAgentView';
import { apiService } from '../services/api';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { ApiConfigProvider } from '../context/ApiConfigContext';
import { JobPost, PublicCompany } from '../types';
import * as taskStatusHook from '../hooks/useTaskStatus';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      getCompanies: vi.fn(),
      getJobsByAgent: vi.fn(),
      getJobDetails: vi.fn(),
      getUser: vi.fn().mockResolvedValue(null)
    }
  };
});

describe('AiAgentView View Component', () => {
  const sampleCompanies: PublicCompany[] = [
    { id: 101, name: 'Starlight Tech', website: 'https://starlight.test', followers_count: 50 }
  ];

  const sampleJobs: JobPost[] = [
    {
      id: 1,
      title: 'Senior Frontend Architect',
      description: 'Build high-scale React apps.',
      company: 101,
      location: 'Remote',
      posted_by: 1,
      posted_at: new Date().toISOString(),
      status: 'active',
      employment_type: 'FT',
      salary: 150000,
      work_mode: 'remote'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getCompanies).mockResolvedValue(sampleCompanies);
  });

  const renderView = () => {
    return render(
      <ThemeProvider>
        <ApiConfigProvider>
          <AuthProvider>
            <AiAgentView />
          </AuthProvider>
        </ApiConfigProvider>
      </ThemeProvider>
    );
  };

  it('renders the AI agent header', async () => {
    renderView();
    expect(screen.getAllByText(/AI Job Match Agent/i).length).toBeGreaterThan(0);
  });

  it('shows matched job listings when the agent task succeeds', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.getJobsByAgent).mockResolvedValueOnce({
      task_id: 'celery-agent-42'
    });

    vi.spyOn(taskStatusHook, 'useTaskStatus').mockReturnValue({
      status: 'SUCCESS',
      result: sampleJobs,
      error: null,
      isPolling: false,
      timedOut: false,
      attempts: 2,
      reset: vi.fn()
    });

    renderView();

    const textarea = screen.getByPlaceholderText(/I want a senior remote React role/i) as HTMLTextAreaElement;
    await user.type(textarea, 'Find a senior remote React role over $150k');

    fireEvent.submit(textarea.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(apiService.getJobsByAgent).toHaveBeenCalledWith(
        expect.objectContaining({ user_prompt: 'Find a senior remote React role over $150k' })
      );
    });

    expect(await screen.findByText('Senior Frontend Architect')).toBeInTheDocument();
  });

  it('shows empty state when the agent returns no matches', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.getJobsByAgent).mockResolvedValueOnce({
      task_id: 'celery-agent-99'
    });

    vi.spyOn(taskStatusHook, 'useTaskStatus').mockReturnValue({
      status: 'SUCCESS',
      result: [],
      error: null,
      isPolling: false,
      timedOut: false,
      attempts: 2,
      reset: vi.fn()
    });

    renderView();

    const textarea = screen.getByPlaceholderText(/I want a senior remote React role/i) as HTMLTextAreaElement;
    await user.type(textarea, 'A niche role that does not exist');

    fireEvent.submit(textarea.closest('form') as HTMLFormElement);

    expect(await screen.findByText('No AI Matches Found')).toBeInTheDocument();
  });
});
