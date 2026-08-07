import React from 'react';
import { Building2, Globe, Users } from 'lucide-react';
import { PublicCompany, JobPostList } from '../../types';

interface CompanyDetailContentProps {
  company: PublicCompany;
  jobs: JobPostList[];
  onClose: () => void;
  onSelectJob?: (jobId: number) => void;
}

export const CompanyDetailContent: React.FC<CompanyDetailContentProps> = ({
  company,
  jobs,
  onClose,
  onSelectJob,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{company.name}</h2>
          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center text-slate-300">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {company.followers_count} followers
            </span>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline flex items-center"
              >
                <Globe className="w-3.5 h-3.5 mr-1" />
                <span>{company.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {company.description && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          {company.description}
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Active Job Openings ({jobs.length})</span>
        </h3>

        {jobs.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 bg-slate-900/40 rounded-xl border border-slate-800">
            No active job posts currently listed for this company.
          </p>
        ) : (
          <div className="space-y-2.5">
            {jobs.map((j) => (
              <div
                key={j.id}
                onClick={() => {
                  if (onSelectJob) onSelectJob(j.id);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 flex items-center justify-between cursor-pointer transition-colors text-xs"
              >
                <div>
                  <span className="font-semibold text-white block">{j.title}</span>
                  <span className="text-slate-400 text-[11px]">{j.location || 'Remote'}</span>
                </div>
                <span className="text-sky-400 font-bold">
                  {j.salary ? `$${j.salary.toLocaleString()}/yr` : 'View'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
