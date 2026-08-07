import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { PublicCompany, JobPostList } from '../types';
import { apiService } from '../services/api';
import { RegisterCompanyForm } from './companies/RegisterCompanyForm';
import { CompanyDetailContent } from './companies/CompanyDetailContent';

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
  onSelectJob,
}) => {
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [jobs, setJobs] = useState<JobPostList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
          <RegisterCompanyForm onClose={onClose} onCompanyCreated={onCompanyCreated} />
        ) : loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-sky-400" />
            <p className="text-xs">Loading company details...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 space-y-3">
            <p className="text-xs">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        ) : company ? (
          <CompanyDetailContent
            company={company}
            jobs={jobs}
            onClose={onClose}
            onSelectJob={onSelectJob}
          />
        ) : null}
      </div>
    </div>
  );
};
