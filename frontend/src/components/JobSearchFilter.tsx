import React from 'react';
import { Search, MapPin, Filter, DollarSign, ArrowUpDown, X } from 'lucide-react';
import { EmploymentTypeEnum, JobsListQueryParams } from '../types';

interface JobSearchFilterProps {
  filters: JobsListQueryParams;
  onChange: (newFilters: JobsListQueryParams) => void;
  onReset: () => void;
}

export const JobSearchFilter: React.FC<JobSearchFilterProps> = ({ filters, onChange, onReset }) => {
  const handleInputChange = (field: keyof JobsListQueryParams, value: any) => {
    onChange({
      ...filters,
      [field]: value === '' ? undefined : value
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.title,
    filters.location,
    filters.employment_type,
    filters.min_salary,
    filters.max_salary,
    filters.ordering
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 mb-6 text-slate-100 shadow-xl space-y-4">
      {/* Primary Search Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Title / Keyword Search */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search || filters.title || ''}
            onChange={(e) => {
              handleInputChange('search', e.target.value);
              handleInputChange('title', e.target.value);
            }}
            placeholder="Job title, keywords, or company"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Location Search */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Location (e.g. San Francisco, Remote)"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Employment Type Selector */}
        <div className="md:col-span-3">
          <select
            value={filters.employment_type || ''}
            onChange={(e) => handleInputChange('employment_type', e.target.value as EmploymentTypeEnum)}
            className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          >
            <option value="">All Employment Types</option>
            <option value="FT">Full-Time (FT)</option>
            <option value="PT">Part-Time (PT)</option>
            <option value="CT">Contract (CT)</option>
          </select>
        </div>
      </div>

      {/* Secondary Filters: Salary & Ordering */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Min Salary */}
          <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Min Salary:</span>
            <input
              type="number"
              value={filters.min_salary || ''}
              onChange={(e) => handleInputChange('min_salary', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 80000"
              className="w-24 bg-transparent text-white font-mono placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Max Salary */}
          <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Max Salary:</span>
            <input
              type="number"
              value={filters.max_salary || ''}
              onChange={(e) => handleInputChange('max_salary', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 200000"
              className="w-24 bg-transparent text-white font-mono placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Ordering & Reset */}
        <div className="flex items-center space-x-3 justify-end">
          <div className="flex items-center space-x-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Order:</span>
            <select
              value={filters.ordering || ''}
              onChange={(e) => handleInputChange('ordering', e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="" className="bg-slate-900">Default</option>
              <option value="salary" className="bg-slate-900">Salary (Low to High)</option>
              <option value="-salary" className="bg-slate-900">Salary (High to Low)</option>
              <option value="title" className="bg-slate-900">Title (A-Z)</option>
              <option value="-posted_at" className="bg-slate-900">Newest First</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
