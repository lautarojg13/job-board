import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { JobPost, PublicCompany } from '../types';
import { apiService } from '../services/api';
import { JobDetailContent } from './jobs/JobDetailContent';

interface JobDetailModalProps {
  jobId: number | null;
  onClose: () => void;
  onApply: (job: JobPost) => void;
  onAnalyzeResume: (job: JobPost) => void;
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

  if (!jobId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <p className="text-sm">Fetching job specification...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400">
            <p>{error}</p>
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
      </div>
    </div>
  );
};
