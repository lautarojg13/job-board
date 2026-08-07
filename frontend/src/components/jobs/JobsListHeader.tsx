import React from 'react';
import { RefreshCw } from 'lucide-react';

interface JobsListHeaderProps {
  totalJobs: number;
  loading: boolean;
  onRefresh: () => void;
}

export const JobsListHeader: React.FC<JobsListHeaderProps> = ({
  totalJobs,
  loading,
  onRefresh,
}) => {
  return (
    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
      <span className="font-semibold text-slate-200">
        Showing {totalJobs} job post{totalJobs !== 1 && 's'}
      </span>
      <button
        onClick={onRefresh}
        className="flex items-center space-x-1 hover:text-white transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
};
