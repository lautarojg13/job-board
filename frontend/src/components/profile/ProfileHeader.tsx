import React from 'react';
import { Mail, Shield, LogOut } from 'lucide-react';
import { CustomUserDetails } from '../../types';

interface ProfileHeaderProps {
  user: CustomUserDetails | null;
  onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-xl shrink-0">
          {user?.first_name?.[0] || user?.username?.[0] || 'U'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {user?.first_name} {user?.last_name} ({user?.username})
          </h1>
          <p className="text-xs text-slate-400 flex items-center mt-0.5">
            <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {user?.email}
            <span className="mx-2">•</span>
            <Shield className="w-3.5 h-3.5 mr-1 text-sky-400" />
            Role: <span className="font-semibold text-sky-300 ml-1">{user?.role || 'USER'}</span>
          </p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/80 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors shrink-0"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};
