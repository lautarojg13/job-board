import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, Users, Briefcase, Plus, Loader2, ExternalLink } from 'lucide-react';
import { PublicCompany, JobPostList, PublicCompanyRequest } from '../types';
import { apiService } from '../services/api';

interface CompanyModalProps {
  companyId: number | null;
  isCreateMode?: boolean;
  onClose: () => void;
  onCompanyCreated?: (comp: PublicCompany) => void;
  onSelectJob?: (jobId: number) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  companyId,
  isCreateMode = false,
  onClose,
  onCompanyCreated,
  onSelectJob
}) => {
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [jobs, setJobs] = useState<JobPostList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for creating company
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isCreateMode || !companyId) return;

    const loadCompanyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const comp = await apiService.getCompanyDetail(companyId);
        setCompany(comp);

        try {
          const compJobs = await apiService.getCompanyJobs(companyId);
          setJobs(compJobs);
        } catch {
          setJobs([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load company info');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [companyId, isCreateMode]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiService.createCompany({
        name,
        description: description || null,
        website: website || null
      });
      if (onCompanyCreated) onCompanyCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCreateMode && !companyId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isCreateMode ? (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Register New Company</h2>
                <p className="text-xs text-slate-400">Add an organization to publish job listings</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nexus Software Solutions"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://nexus.example.com"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Overview of company mission and products..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Create Company Profile</span>
                </button>
              </div>
            </form>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-sky-400" />
            <p className="text-xs">Loading company details...</p>
          </div>
        ) : company ? (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{company.name}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center text-slate-300">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {company.followers_count} followers
                  </span>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center"
                    >
                      <Globe className="w-3.5 h-3.5 mr-1" />
                      <span>{company.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {company.description && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {company.description}
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                <span>Active Job Openings ({jobs.length})</span>
              </h3>

              {jobs.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                  No active job posts currently listed for this company.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {jobs.map((j) => (
                    <div
                      key={j.id}
                      onClick={() => {
                        if (onSelectJob) onSelectJob(j.id);
                        onClose();
                      }}
                      className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 flex items-center justify-between cursor-pointer transition-colors text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{j.title}</span>
                        <span className="text-slate-400 text-[11px]">{j.location || 'Remote'}</span>
                      </div>
                      <span className="text-sky-400 font-bold">{j.salary ? `$${j.salary.toLocaleString()}/yr` : 'View'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
