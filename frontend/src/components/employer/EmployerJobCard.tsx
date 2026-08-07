import React from 'react';
import { Users, Edit, Trash2 } from 'lucide-react';
import { JobPost } from '../../types';

interface EmployerJobCardProps {
  job: JobPost;
  onViewApplicants: (job: JobPost) => void;
  onEdit: (job: JobPost) => void;
  onDelete: (id: number) => void;
}

export const EmployerJobCard: React.FC<EmployerJobCardProps> = ({
  job,
  onViewApplicants,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-100">
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-white">{job.title}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
            job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
          }`}>
            {job.status}
          </span>
        </div>

        <p className="text-xs text-slate-400 flex items-center space-x-3">
          <span>{job.location || 'Remote'}</span>
          <span>•</span>
          <span>{job.salary ? `$${job.salary.toLocaleString()}/yr` : 'Undisclosed'}</span>
          <span>•</span>
          <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
        </p>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={() => onViewApplicants(job)}
          className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center space-x-1.5 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          <span>View Applicants</span>
        </button>

        <button
          onClick={() => onEdit(job)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Edit Job"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(job.id)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors"
          title="Delete Job"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
