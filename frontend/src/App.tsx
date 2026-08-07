import React, { useState } from 'react';
import { ApiConfigProvider, useApiConfig } from './context/ApiConfigContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
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
  const { showDemoConfigUI } = useApiConfig();

  const handleOpenAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'jobs':
      case 'ai-match':
        return (
          <JobsView
            onNavigateToEmployer={() => setActiveTab('employer')}
            onNavigateToCompanies={() => setActiveTab('companies')}
          />
        );
      case 'applications':
        return <ApplicationsView />;
      case 'employer':
        return <EmployerDashboard />;
      case 'companies':
        return <CompaniesView onSelectJob={() => setActiveTab('jobs')} />;
      case 'profile':
        return <ProfileView />;
      default:
        return (
          <JobsView
            onNavigateToEmployer={() => setActiveTab('employer')}
            onNavigateToCompanies={() => setActiveTab('companies')}
          />
        );
    }
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
      <main className="flex-1">{renderActiveView()}</main>

      {/* Footer Navigation & Settings */}
      <Footer
        showDemoConfigUI={showDemoConfigUI}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenAuthModal={(m) => handleOpenAuthModal(m || 'login')}
      />

      {/* Global Modals */}
      {showDemoConfigUI && (
        <ApiConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}

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
    <ThemeProvider>
      <ApiConfigProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ApiConfigProvider>
    </ThemeProvider>
  );
}
