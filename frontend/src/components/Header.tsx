import React from 'react';
import {
  Briefcase,
  Sparkles,
  FileCheck,
  Building2,
  User,
  Settings,
  PlusCircle,
  LogOut,
  LogIn,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApiConfig } from '../context/ApiConfigContext';

export type ActiveTab = 'jobs' | 'ai-match' | 'applications' | 'employer' | 'companies' | 'profile';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenConfigModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenConfigModal
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { demoMode, baseUrl } = useApiConfig();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-slate-950 shadow-md shadow-sky-500/20">
              <Briefcase className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-xl tracking-tight text-white">
                  JobBoard<span className="text-sky-400">.io</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  DRF API
                </span>
              </div>
              <p className="text-[11px] text-slate-500">REST Framework Portal</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
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

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* API Config Badge */}
            <button
              onClick={onOpenConfigModal}
              title={`API Base: ${baseUrl} (${demoMode ? 'Demo Mode' : 'Live Mode'})`}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono transition-colors text-slate-300"
            >
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate max-w-[120px]">{demoMode ? 'Demo Mode' : baseUrl.replace(/^https?:\/\//, '')}</span>
              <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </button>

            {/* User Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-slate-800 text-sky-400 border-sky-500/50'
                      : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold">{user?.username || 'Account'}</span>
                </button>
                <button
                  onClick={() => logout()}
                  title="Log Out"
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'jobs' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('ai-match')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'ai-match' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            AI Agent
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'applications' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('employer')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'employer' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Employer
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'companies' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Companies
          </button>
        </div>
      </div>
    </header>
  );
};
