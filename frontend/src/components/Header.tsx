import React from 'react';
import { BrandLogo } from './header/BrandLogo';
import { DesktopNav } from './header/DesktopNav';
import { MobileNav } from './header/MobileNav';
import { UserActions } from './header/UserActions';

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
  onOpenConfigModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <BrandLogo onSelect={() => setActiveTab('jobs')} />

          {/* Desktop Nav Items */}
          <DesktopNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Right Action Controls */}
          <UserActions
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenAuthModal={onOpenAuthModal}
            onOpenConfigModal={onOpenConfigModal}
          />
        </div>

        {/* Mobile Sub-Navigation */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </header>
  );
};
