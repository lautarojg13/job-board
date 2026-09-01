import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from './navConfig';
import { ActiveTab } from '../Header';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { isAuthenticated } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs overflow-x-auto gap-1">
      {items.map((item) => {
        const active = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`px-2.5 py-1 rounded-md ${
              active ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {item.labelMobile}
          </button>
        );
      })}
    </div>
  );
};
