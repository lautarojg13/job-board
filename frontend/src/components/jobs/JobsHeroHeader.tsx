import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

interface JobsHeroHeaderProps {
  showAiAgent: boolean;
  onToggleAiAgent: () => void;
  onNavigateToEmployer: () => void;
}

export const JobsHeroHeader: React.FC<JobsHeroHeaderProps> = ({
  showAiAgent,
  onToggleAiAgent,
  onNavigateToEmployer,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>DRF Open API Job Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Find your next engineering role
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Search, match, and apply directly to verified full-time, part-time, and contract roles powered by Django REST Framework.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onToggleAiAgent}
          className="px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-sky-400 text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{showAiAgent ? 'Hide AI Agent' : 'AI Match Agent'}</span>
        </button>

        <button
          onClick={onNavigateToEmployer}
          className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors shadow-md shadow-sky-500/10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Job</span>
        </button>
      </div>
    </div>
  );
};
