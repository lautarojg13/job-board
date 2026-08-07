import React from 'react';
import { Building2, MapPin, Calendar, ExternalLink, Sparkles, Send } from 'lucide-react';
import { JobPost, PublicCompany } from '../../types';

interface JobDetailContentProps {
  job: JobPost;
  company: PublicCompany | null;
  onClose: () => void;
  onApply: (job: JobPost) => void;
  onAnalyzeResume: (job: JobPost) => void;
}

export const JobDetailContent: React.FC<JobDetailContentProps> = ({
  job,
  company,
  onClose,
  onApply,
  onAnalyzeResume,
}) => {
  return (
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
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">
            Employment Type
          </span>
          <span className="font-semibold text-slate-200">
            {job.employment_type === 'FT'
              ? 'Full-Time'
              : job.employment_type === 'PT'
              ? 'Part-Time'
              : job.employment_type === 'CT'
              ? 'Contract'
              : job.employment_type || 'Full-Time'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">
            Work Mode
          </span>
          <span className="font-semibold text-slate-200 capitalize">
            {job.work_mode || 'Remote'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">
            Salary Range
          </span>
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
          <p className="text-slate-300 leading-relaxed">
            {company.description || 'No company description provided.'}
          </p>
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
  );
};
