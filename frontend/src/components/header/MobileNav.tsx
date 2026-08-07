import React from 'react';
import { ActiveTab } from '../Header';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs overflow-x-auto gap-1">
      <button
        onClick={() => setActiveTab('jobs')}
        className={`px-2.5 py-1 rounded-md ${
          activeTab === 'jobs' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'
        }`}
      >
        Jobs
      </button>
      <button
        onClick={() => setActiveTab('ai-match')}
        className={`px-2.5 py-1 rounded-md ${
          activeTab === 'ai-match' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'
        }`}
      >
        AI Agent
      </button>
      <button
        onClick={() => setActiveTab('applications')}
        className={`px-2.5 py-1 rounded-md ${
          activeTab === 'applications' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'
        }`}
      >
        Applications
      </button>
      <button
        onClick={() => setActiveTab('employer')}
        className={`px-2.5 py-1 rounded-md ${
          activeTab === 'employer' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'
        }`}
      >
        Employer
      </button>
      <button
        onClick={() => setActiveTab('companies')}
        className={`px-2.5 py-1 rounded-md ${
          activeTab === 'companies' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'
        }`}
      >
        Companies
      </button>
    </div>
  );
};
