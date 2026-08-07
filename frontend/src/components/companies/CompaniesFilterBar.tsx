import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface CompaniesFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  ordering: string;
  onOrderingChange: (val: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const CompaniesFilterBar: React.FC<CompaniesFilterBarProps> = ({
  search,
  onSearchChange,
  ordering,
  onOrderingChange,
  loading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
      <div className="relative w-full sm:max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search company name or description..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <select
          value={ordering}
          onChange={(e) => onOrderingChange(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
        >
          <option value="">Default Order</option>
          <option value="name">Name (A-Z)</option>
          <option value="-followers_count">Most Followers</option>
        </select>

        <button
          onClick={onRefresh}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
