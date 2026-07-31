import React from 'react';
import { MapPin, DollarSign, Clock, Building2, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';
import { JobPostList, PublicCompany } from '../types';

interface JobCardProps {
  job: JobPostList;
  company?: PublicCompany;
  onSelect: (jobId: number) => void;
  onQuickApply?: (jobId: number) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, company, onSelect, onQuickApply }) => {
  const getWorkModeBadge = (mode?: string) => {
    switch (mode) {
      case 'remote':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Remote</span>;
      case 'hybrid':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Hybrid</span>;
      case 'onsite':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Onsite</span>;
      default:
        return null;
    }
  };

  const getEmploymentTypeLabel = (type?: string) => {
    switch (type) {
      case 'FT':
        return 'Full-Time';
      case 'PT':
        return 'Part-Time';
      case 'CT':
        return 'Contract';
      default:
        return type || 'Full-Time';
    }
  };

  return (
    <div
      onClick={() => onSelect(job.id)}
      className="group bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900/90 rounded-xl p-5 transition-all duration-200 cursor-pointer relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:bg-sky-500/10 group-hover:border-sky-500/30 transition-colors">
            <Building2 className="w-6 h-6 text-slate-400 group-hover:text-sky-400 transition-colors" />
          </div>

          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                {job.title}
              </h3>
            </div>

            <p className="text-xs font-medium text-slate-400 mt-1 flex items-center space-x-2">
              <span>{company?.name || `Company #${job.company || 'N/A'}`}</span>
              {job.location && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center text-slate-400">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {job.location}
                  </span>
                </>
              )}
            </p>

            <div className="flex items-center space-x-2 mt-3 flex-wrap gap-2">
              {getWorkModeBadge(job.work_mode)}
              <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {getEmploymentTypeLabel(job.employment_type)}
              </span>
              {job.salary && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center">
                  <DollarSign className="w-3 h-3 mr-0.5 text-sky-400" />
                  {job.salary.toLocaleString()}/yr
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:block mb-2">Active Role</span>
          <div className="flex items-center space-x-2">
            {onQuickApply && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickApply(job.id);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-sm"
              >
                Apply
              </button>
            )}
            <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-sky-500/10 text-slate-400 group-hover:text-sky-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
