import React, { useState } from 'react';
import { ApiConfigProvider } from './context/ApiConfigContext';
import { AuthProvider } from './context/AuthContext';
import { Header, ActiveTab } from './components/Header';
import { ApiConfigModal } from './components/ApiConfigModal';
import { AuthModal, AuthMode } from './components/AuthModal';
import { JobsView } from './views/JobsView';
import { ApplicationsView } from './views/ApplicationsView';
import { EmployerDashboard } from './views/EmployerDashboard';
import { CompaniesView } from './views/CompaniesView';
import { ProfileView } from './views/ProfileView';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const handleOpenAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={(m) => handleOpenAuthModal(m || 'login')}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'jobs' && (
          <JobsView
            onNavigateToEmployer={() => setActiveTab('employer')}
            onNavigateToCompanies={() => setActiveTab('companies')}
          />
        )}

        {activeTab === 'ai-match' && (
          <JobsView
            onNavigateToEmployer={() => setActiveTab('employer')}
            onNavigateToCompanies={() => setActiveTab('companies')}
          />
        )}

        {activeTab === 'applications' && <ApplicationsView />}

        {activeTab === 'employer' && <EmployerDashboard />}

        {activeTab === 'companies' && (
          <CompaniesView onSelectJob={(jobId) => setActiveTab('jobs')} />
        )}

        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 JobBoard — Powered by Django REST Framework & React 19</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              API Base URL Settings
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenAuthModal('login')}
              className="hover:text-slate-300 transition-colors"
            >
              Auth Gateway
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ApiConfigProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ApiConfigProvider>
  );
}
