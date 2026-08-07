import React from 'react';
import { Building2, Users, Globe } from 'lucide-react';
import { PublicCompany } from '../../types';

interface CompanyCardProps {
  company: PublicCompany;
  onSelect: (id: number) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(company.id)}
      className="bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-900/90 space-y-4 group flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:bg-sky-500/20 transition-colors">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
              {company.name}
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
              <Users className="w-3 h-3 mr-1 text-slate-500" />
              {company.followers_count} followers
            </span>
          </div>
        </div>

        {company.description && (
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {company.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-semibold">
        <span>View Job Openings</span>
        {company.website && (
          <span className="text-slate-500 text-[11px] font-mono flex items-center">
            <Globe className="w-3 h-3 mr-1" />
            {company.website.replace(/^https?:\/\//, '').split('/')[0]}
          </span>
        )}
      </div>
    </div>
  );
};
