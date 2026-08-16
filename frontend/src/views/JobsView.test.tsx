import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobsView } from './JobsView';
import { apiService } from '../services/api';
import { AuthProvider } from '../context/AuthContext';
import { ApiConfigProvider } from '../context/ApiConfigContext';
import { ThemeProvider } from '../context/ThemeContext';
import { JobPost, PublicCompany } from '../types';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      getJobsList: vi.fn(),
      getCompanies: vi.fn().mockResolvedValue([]),
      getJobDetails: vi.fn(),
      getUser: vi.fn().mockResolvedValue(null)
    }
  };
});

describe('JobsView View Component', () => {
  const mockNavigateToEmployer = vi.fn();
  const mockNavigateToCompanies = vi.fn();

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
    },
    {
      id: 2,
      title: 'Django Core Engineer',
      description: 'Scale DRF and Celery services.',
      company: 101,
      location: 'New York, NY',
      posted_by: 1,
      posted_at: new Date().toISOString(),
      status: 'active',
      employment_type: 'FT',
      salary: 140000,
      work_mode: 'hybrid'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderJobsView = () => {
    return render(
      <ThemeProvider>
        <ApiConfigProvider>
          <AuthProvider>
            <JobsView
              onNavigateToEmployer={mockNavigateToEmployer}
              onNavigateToCompanies={mockNavigateToCompanies}
            />
          </AuthProvider>
        </ApiConfigProvider>
      </ThemeProvider>
    );
  };

  it('renders loading state initially and then shows jobs when loaded', async () => {
    vi.mocked(apiService.getJobsList).mockResolvedValueOnce(sampleJobs);
    vi.mocked(apiService.getCompanies).mockResolvedValueOnce(sampleCompanies);

    renderJobsView();

    expect(screen.getByText(/Querying DRF jobs API/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Architect')).toBeInTheDocument();
      expect(screen.getByText('Django Core Engineer')).toBeInTheDocument();
    });
  });

  it('shows EmptyState when no jobs are returned', async () => {
    vi.mocked(apiService.getJobsList).mockResolvedValueOnce([]);
    vi.mocked(apiService.getCompanies).mockResolvedValueOnce([]);

    renderJobsView();

    await waitFor(() => {
      expect(screen.getByText('No Job Listings Found')).toBeInTheDocument();
    });
  });

  it('shows ErrorState when API call fails and allows retry', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.getJobsList).mockRejectedValueOnce(new Error('Network error loading jobs'));
    vi.mocked(apiService.getCompanies).mockResolvedValue(sampleCompanies);

    renderJobsView();

    await waitFor(() => {
      expect(screen.getByText('Network error loading jobs')).toBeInTheDocument();
    });

    // Mock successful retry
    vi.mocked(apiService.getJobsList).mockResolvedValue(sampleJobs);
    const retryBtn = screen.getByRole('button', { name: /Retry|Try Again/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Architect')).toBeInTheDocument();
    });
  });

  it('calls getJobsList with updated filters when search input changes', async () => {
    vi.mocked(apiService.getJobsList).mockResolvedValue(sampleJobs);
    vi.mocked(apiService.getCompanies).mockResolvedValue(sampleCompanies);

    renderJobsView();

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Architect')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Job title, keywords, or company/i);
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(apiService.getJobsList).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'React' })
      );
    });
  });

  it('fetches job details and opens detail modal when clicking a job card', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.getJobsList).mockResolvedValueOnce(sampleJobs);
    vi.mocked(apiService.getCompanies).mockResolvedValueOnce(sampleCompanies);
    vi.mocked(apiService.getJobDetails).mockResolvedValueOnce(sampleJobs[0]);

    renderJobsView();

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Architect')).toBeInTheDocument();
    });

    const jobCard = screen.getByText('Senior Frontend Architect');
    await user.click(jobCard);

    await waitFor(() => {
      expect(apiService.getJobDetails).toHaveBeenCalledWith(1);
    });
  });
});
