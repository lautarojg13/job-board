import React from 'react';
import { User, LogOut, Server, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab } from '../Header';

interface UserActionsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenConfigModal: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenConfigModal,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { demoMode, baseUrl, showDemoConfigUI } = useApiConfig();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-3">
      {/* Theme Switcher Toggle Button */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Nocturno'}
        className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors flex items-center space-x-1.5 text-slate-300"
      >
        {theme === 'dark' ? (
          <>
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline text-[11px] font-medium">Modo Nocturno</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="hidden lg:inline text-[11px] font-medium">Modo Claro</span>
          </>
        )}
      </button>

      {/* API Config Badge */}
      {showDemoConfigUI && (
        <button
          onClick={onOpenConfigModal}
          title={`API Base: ${baseUrl} (${demoMode ? 'Demo Mode' : 'Live Mode'})`}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono transition-colors text-slate-300"
        >
          <Server className="w-3.5 h-3.5 text-sky-400" />
          <span className="truncate max-w-[120px]">
            {demoMode ? 'Demo Mode' : baseUrl.replace(/^https?:\/\//, '')}
          </span>
          <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        </button>
      )}

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
            <span className="font-semibold">{user?.username || user?.email || 'Account'}</span>
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
  );
};
