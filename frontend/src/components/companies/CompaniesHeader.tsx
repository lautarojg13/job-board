import React from 'react';
import { Building2, Plus } from 'lucide-react';

interface CompaniesHeaderProps {
  onRegisterClick: () => void;
}

export const CompaniesHeader: React.FC<CompaniesHeaderProps> = ({ onRegisterClick }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Building2 className="w-6 h-6 mr-2.5 text-sky-400" />
          Verified Companies Directory
        </h1>
        <p className="text-xs text-slate-400 mt-1">Browse participating employers or register a new corporate profile</p>
      </div>

      <button
        onClick={onRegisterClick}
        className="px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Register Company</span>
      </button>
    </div>
  );
};
