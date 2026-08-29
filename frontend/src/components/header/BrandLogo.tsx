import React from 'react';
import { Briefcase } from 'lucide-react';
import { ActiveTab } from '../Header';

interface BrandLogoProps {
  onSelect: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ onSelect }) => {
  return (
    <div className="flex items-center space-x-3 cursor-pointer" onClick={onSelect}>
      <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-slate-950 shadow-md shadow-sky-500/20">
        <Briefcase className="w-4 h-4 text-slate-950" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-xl tracking-tight text-white">
            JobBoard
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Careers
          </span>
        </div>
        <p className="text-[11px] text-slate-400">Tech & Remote Career Portal</p>
      </div>
    </div>
  );
};
