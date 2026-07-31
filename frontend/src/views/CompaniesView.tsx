import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, Users, Globe, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { PublicCompany } from '../types';
import { apiService } from '../services/api';
import { CompanyModal } from '../components/CompanyModal';

interface CompaniesViewProps {
  onSelectJob?: (jobId: number) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ onSelectJob }) => {
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [search, setSearch] = useState<string>('');
  const [ordering, setOrdering] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCompanies({
        search: search || undefined,
        ordering: ordering || undefined
      });
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [search, ordering]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Building2 className="w-6 h-6 mr-2.5 text-sky-400" />
            Verified Companies Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">Browse participating employers or register a new corporate profile</p>
        </div>

        <button
          onClick={() => setIsRegistering(true)}
          className="px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Company</span>
        </button>
      </div>

      {/* Search & Order Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="">Default Order</option>
            <option value="name">Name (A-Z)</option>
            <option value="-followers_count">Most Followers</option>
          </select>

          <button
            onClick={loadCompanies}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Companies List Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400" />
          <p className="text-xs">Fetching companies directory...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs text-center space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
          <p>{error}</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Companies Found</h3>
          <p className="text-xs text-slate-500">No organizations matched your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => (
            <div
              key={comp.id}
              onClick={() => setSelectedCompanyId(comp.id)}
              className="bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-900/90 space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:bg-sky-500/20 transition-colors">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                      {comp.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                      <Users className="w-3 h-3 mr-1 text-slate-500" />
                      {comp.followers_count} followers
                    </span>
                  </div>
                </div>

                {comp.description && (
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {comp.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-semibold">
                <span>View Job Openings</span>
                {comp.website && (
                  <span className="text-slate-500 text-[11px] font-mono flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    {comp.website.replace(/^https?:\/\//, '').split('/')[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Company Detail Modal */}
      <CompanyModal
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
        onSelectJob={onSelectJob}
      />

      {/* Register Company Modal */}
      <CompanyModal
        companyId={null}
        isCreateMode={true}
        onClose={() => setIsRegistering(false)}
        onCompanyCreated={() => loadCompanies()}
      />
    </div>
  );
};
