import React from 'react';
import { AuthMode } from './AuthModal';

interface FooterProps {
  showDemoConfigUI: boolean;
  onOpenConfigModal: () => void;
  onOpenAuthModal: (mode: AuthMode) => void;
}

export const Footer: React.FC<FooterProps> = ({
  showDemoConfigUI,
  onOpenConfigModal,
  onOpenAuthModal,
}) => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 JobBoard.io — Remote Engineering & Tech Career Portal</p>
        <div className="flex items-center space-x-4">
          {showDemoConfigUI && (
            <>
              <button
                onClick={onOpenConfigModal}
                className="hover:text-slate-300 transition-colors"
              >
                API Base URL Settings
              </button>
              <span>•</span>
            </>
          )}
          <button
            onClick={() => onOpenAuthModal('login')}
            className="hover:text-slate-300 transition-colors"
          >
            Auth Gateway
          </button>
        </div>
      </div>
    </footer>
  );
};
