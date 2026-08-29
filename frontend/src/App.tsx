import React, { useState, useEffect } from 'react';
import { ApiConfigProvider, useApiConfig } from './context/ApiConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { ApiConfigModal } from './components/ApiConfigModal';
import { AuthModal, AuthMode } from './components/AuthModal';
import { RequireAuth } from './components/auth/RequireAuth';
import { JobsView } from './views/JobsView';
import { AiAgentView } from './views/AiAgentView';
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
  const { isAuthenticated, getAndClearPostLoginRedirect } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = getAndClearPostLoginRedirect();
      if (redirectTo) {
        setActiveTab(redirectTo);
      }
    }
  }, [isAuthenticated, getAndClearPostLoginRedirect]);

  const handleOpenAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <JobsView
            onNavigateToCompanies={() => setActiveTab('companies')}
          />
        );
      case 'ai-match':
        return <AiAgentView />;
      case 'applications':
        return (
          <RequireAuth redirectTo="applications" onOpenAuthModal={handleOpenAuthModal}>
            <ApplicationsView />
          </RequireAuth>
        );
      case 'employer':
        return (
          <RequireAuth redirectTo="employer" onOpenAuthModal={handleOpenAuthModal}>
            <EmployerDashboard />
          </RequireAuth>
        );
      case 'companies':
        return <CompaniesView onSelectJob={() => setActiveTab('jobs')} />;
      case 'profile':
        return (
          <RequireAuth redirectTo="profile" onOpenAuthModal={handleOpenAuthModal}>
            <ProfileView />
          </RequireAuth>
        );
      default:
        return (
          <JobsView
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
