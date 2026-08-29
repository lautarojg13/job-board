import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from './navConfig';
import { ActiveTab } from '../Header';

interface DesktopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ activeTab, setActiveTab }) => {
  const { isAuthenticated } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
      {items.map((item) => {
        const active = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`flex items-center space-x-2 py-1 transition-colors ${
              active
                ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <item.icon className={`w-4 h-4 ${item.key === 'ai-match' ? 'text-sky-400' : item.key === 'employer' ? 'text-emerald-400' : ''}`} />
            <span>{item.labelDesktop}</span>
          </button>
        );
      })}
    </nav>
  );
};
