import React from 'react';
import { PlusCircle } from 'lucide-react';

interface EmployerHeaderProps {
  activeTab: 'my_jobs' | 'post_job';
  totalOwnerJobs: number;
  onTabChange: (tab: 'my_jobs' | 'post_job') => void;
}

export const EmployerHeader: React.FC<EmployerHeaderProps> = ({
  activeTab,
  totalOwnerJobs,
  onTabChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center">
          <PlusCircle className="w-6 h-6 mr-2.5 text-sky-400" />
          Employer & Recruiter Portal
        </h1>
        <p className="text-xs text-slate-400 mt-1">Publish job posts, manage company listings, and process candidates</p>
      </div>

      <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => onTabChange('my_jobs')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'my_jobs'
              ? 'bg-sky-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My Job Postings ({totalOwnerJobs})
        </button>
        <button
          onClick={() => onTabChange('post_job')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'post_job'
              ? 'bg-sky-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          + Post New Job
        </button>
      </div>
    </div>
  );
};
