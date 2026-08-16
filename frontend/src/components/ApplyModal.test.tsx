import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplyModal } from './ApplyModal';
import { apiService } from '../services/api';
import { JobPost } from '../types';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      applyToJob: vi.fn()
    }
  };
});

describe('ApplyModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const sampleJob: JobPost = {
    id: 42,
    title: 'Senior Python Engineer',
    description: 'Work with Django and AI agents.',
    company: 101,
    location: 'Remote',
    posted_by: 1,
    posted_at: new Date().toISOString(),
    status: 'active',
    employment_type: 'FT',
    salary: 130000,
    work_mode: 'remote'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders error message when submitting without resume file or URL', async () => {
    const user = userEvent.setup();
    render(
      <ApplyModal
        job={sampleJob}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Application/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Please attach a resume file or enter a valid resume URL/i)).toBeInTheDocument();
    expect(apiService.applyToJob).not.toHaveBeenCalled();
  });

  it('submits application with File and cover letter, displays success message and triggers onClose after timer', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    vi.mocked(apiService.applyToJob).mockResolvedValueOnce({
      cover_letter: 'I am excited about this role.',
      resume: 'cv.pdf'
    });

    render(
      <ApplyModal
        job={sampleJob}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const file = new File(['dummy resume content'], 'my_cv.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });

    const coverLetterTextarea = screen.getByPlaceholderText(/Explain briefly why you are a great fit/i);
    fireEvent.change(coverLetterTextarea, { target: { value: 'I am excited about this role.' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.applyToJob).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          cover_letter: 'I am excited about this role.',
          resume: file
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
    });

    // Advance fake timers
    vi.advanceTimersByTime(1600);

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
