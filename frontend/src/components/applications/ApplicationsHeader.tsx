import React from 'react';
import { FileCheck, RefreshCw } from 'lucide-react';
import { ApplicationStatusEnum } from '../../types';

interface ApplicationsHeaderProps {
  statusFilter: ApplicationStatusEnum | '';
  onStatusFilterChange: (status: ApplicationStatusEnum | '') => void;
  loading: boolean;
  onRefresh: () => void;
}

export const ApplicationsHeader: React.FC<ApplicationsHeaderProps> = ({
  statusFilter,
  onStatusFilterChange,
  loading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FileCheck className="w-6 h-6 mr-2.5 text-sky-400" />
          My Submitted Applications
        </h1>
        <p className="text-xs text-slate-400 mt-1">Track the status of your submitted job applications</p>
      </div>

      {/* Status Filter */}
      <div className="flex items-center space-x-2">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ApplicationStatusEnum | '')}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="">All Application Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
