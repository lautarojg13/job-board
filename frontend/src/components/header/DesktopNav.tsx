import React from 'react';
import { Briefcase, Sparkles, FileCheck, PlusCircle, Building2 } from 'lucide-react';
import { ActiveTab } from '../Header';

interface DesktopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
      <button
        onClick={() => setActiveTab('jobs')}
        className={`flex items-center space-x-2 py-1 transition-colors ${
          activeTab === 'jobs'
            ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Briefcase className="w-4 h-4" />
        <span>Find Jobs</span>
      </button>

      <button
        onClick={() => setActiveTab('ai-match')}
        className={`flex items-center space-x-2 py-1 transition-colors ${
          activeTab === 'ai-match'
            ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sparkles className="w-4 h-4 text-sky-400" />
        <span>AI Agent</span>
      </button>

      <button
        onClick={() => setActiveTab('applications')}
        className={`flex items-center space-x-2 py-1 transition-colors ${
          activeTab === 'applications'
            ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileCheck className="w-4 h-4" />
        <span>Applications</span>
      </button>

      <button
        onClick={() => setActiveTab('employer')}
        className={`flex items-center space-x-2 py-1 transition-colors ${
          activeTab === 'employer'
            ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <PlusCircle className="w-4 h-4 text-emerald-400" />
        <span>Employer Portal</span>
      </button>

      <button
        onClick={() => setActiveTab('companies')}
        className={`flex items-center space-x-2 py-1 transition-colors ${
          activeTab === 'companies'
            ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span>Companies</span>
      </button>
    </nav>
  );
};
