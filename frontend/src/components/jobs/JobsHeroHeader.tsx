import React from 'react';
import { Sparkles } from 'lucide-react';

export const JobsHeroHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Verified Tech & Engineering Roles</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Find your next engineering role
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Search, match, and apply directly to verified full-time, part-time, and contract engineering roles.
        </p>
      </div>
    </div>
  );
};
