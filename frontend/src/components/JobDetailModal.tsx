import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { JobPost, PublicCompany } from '../types';
import { apiService } from '../services/api';
import { JobDetailContent } from './jobs/JobDetailContent';
import { Modal } from './common/Modal';

interface JobDetailModalProps {
  jobId: number | null;
  onClose: () => void;
  onApply?: (job: JobPost) => void;
  onAnalyzeResume?: (job: JobPost) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  jobId,
  onClose,
  onApply,
  onAnalyzeResume,
}) => {
  const [job, setJob] = useState<JobPost | null>(null);
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setCompany(null);
      return;
    }

    const loadJobDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const j = await apiService.getJobDetails(jobId);
        setJob(j);

        if (j.company) {
          try {
            const comp = await apiService.getCompanyDetail(j.company);
            setCompany(comp);
          } catch {
            setCompany(null);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId]);

  return (
    <Modal isOpen={Boolean(jobId)} onClose={onClose} maxWidth="2xl">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <h2 className="text-base font-semibold text-slate-300">Loading Job Specification...</h2>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-rose-400 space-y-2">
          <h2 className="text-base font-bold">Failed to Load Job</h2>
          <p className="text-xs">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      ) : job ? (
        <JobDetailContent
          job={job}
          company={company}
          onClose={onClose}
          onApply={onApply}
          onAnalyzeResume={onAnalyzeResume}
        />
      ) : null}
    </Modal>
  );
};
