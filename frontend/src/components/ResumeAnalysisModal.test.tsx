import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResumeAnalysisModal } from './ResumeAnalysisModal';
import { apiService } from '../services/api';
import { JobPost } from '../types';
import * as taskStatusHook from '../hooks/useTaskStatus';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      getResumeAnalysis: vi.fn(),
      getTaskStatus: vi.fn()
    }
  };
});

describe('ResumeAnalysisModal Component', () => {
  const mockOnClose = vi.fn();

  const sampleJob: JobPost = {
    id: 10,
    title: 'Lead Fullstack Developer',
    description: 'Work with React, TypeScript and Celery.',
    company: 101,
    location: 'Remote',
    posted_by: 1,
    posted_at: new Date().toISOString(),
    status: 'active',
    employment_type: 'FT',
    salary: 140000,
    work_mode: 'remote'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error message when submitting without resume file', async () => {
    const user = userEvent.setup();
    render(<ResumeAnalysisModal job={sampleJob} onClose={mockOnClose} />);

    const submitBtn = screen.getByRole('button', { name: /Run Match Analysis/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Please select a resume PDF file/i)).toBeInTheDocument();
    expect(apiService.getResumeAnalysis).not.toHaveBeenCalled();
  });

  it('submits resume file, triggers getResumeAnalysis and displays Task ID', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.getResumeAnalysis).mockResolvedValueOnce({
      task_id: 'celery-task-9988',
      message: 'Resume analysis task initiated'
    });

    render(<ResumeAnalysisModal job={sampleJob} onClose={mockOnClose} />);

    const file = new File(['mock resume data'], 'candidate_cv.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Run Match Analysis/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiService.getResumeAnalysis).toHaveBeenCalledWith(10, file);
    });

    expect(await screen.findByText('celery-task-9988')).toBeInTheDocument();
    expect(screen.getByText(/Resume analysis task initiated/i)).toBeInTheDocument();
  });

  it('displays analysis match percentage, skills, and summary on SUCCESS task status', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.getResumeAnalysis).mockResolvedValueOnce({
      task_id: 'celery-task-1234',
      message: 'Analysis initiated'
    });

    // Mock hook return
    vi.spyOn(taskStatusHook, 'useTaskStatus').mockReturnValue({
      status: 'SUCCESS',
      result: {
        match_percentage: 95,
        matching_skills: ['TypeScript', 'React'],
        missing_skills: ['Docker'],
        summary: 'Strong overall match for the role.'
      },
      error: null,
      isPolling: false,
      timedOut: false,
      attempts: 2,
      reset: vi.fn()
    });

    render(<ResumeAnalysisModal job={sampleJob} onClose={mockOnClose} />);

    const file = new File(['dummy'], 'cv.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Run Match Analysis/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Docker')).toBeInTheDocument();
      expect(screen.getByText(/Strong overall match for the role/i)).toBeInTheDocument();
    });
  });
});
