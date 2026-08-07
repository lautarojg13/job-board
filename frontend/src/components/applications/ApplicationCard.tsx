import React from 'react';
import { ApplicationList } from '../../types';
import { ApplicationStatusBadge } from '../common/ApplicationStatusBadge';

interface ApplicationCardProps {
  application: ApplicationList;
  onSelect: (id: number) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(application.id)}
      className="bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-900/90 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500">App #{application.id}</span>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <div>
        <span className="text-xs font-semibold text-slate-400 block">Target Job ID</span>
        <span className="text-sm font-bold text-white">Job Post #{application.job_id}</span>
      </div>

      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
        <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
        <span>Updated: {new Date(application.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
