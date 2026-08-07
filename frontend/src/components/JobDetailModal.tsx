import React, { useEffect, useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  Sparkles,
  FileText,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { JobPost, PublicCompany } from '../types';
import { apiService } from '../services/api';

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
  onAnalyzeResume
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
          <div className="space-y-6">
            {/* Job Header */}
            <div className="flex items-start space-x-4 pr-8">
              <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{job.title}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 flex-wrap gap-y-1">
                  <span className="font-semibold text-sky-400">
                    {company?.name || `Company #${job.company || 'N/A'}`}
                  </span>
                  {job.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {job.location}
                      </span>
                    </>
                  )}
                  {job.posted_at && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {new Date(job.posted_at).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">Employment Type</span>
                <span className="font-semibold text-slate-200">
                  {job.employment_type === 'FT' ? 'Full-Time' : job.employment_type === 'PT' ? 'Part-Time' : job.employment_type === 'CT' ? 'Contract' : job.employment_type || 'Full-Time'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">Work Mode</span>
                <span className="font-semibold text-slate-200 capitalize">{job.work_mode || 'Remote'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">Salary Range</span>
                <span className="font-semibold text-sky-400">
                  {job.salary ? `$${job.salary.toLocaleString()}/yr` : 'Undisclosed'}
                </span>
              </div>
            </div>

            {/* Company Bio preview if available */}
            {company && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sky-400 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                    About {company.name}
                  </span>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">{company.description || 'No company description provided.'}</p>
              </div>
            )}

            {/* Job Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">About the role</h3>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                {job.description || 'No detailed description provided for this job post.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => onAnalyzeResume(job)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-sky-400 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>AI Resume Match Check</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onApply(job)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply Now</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
