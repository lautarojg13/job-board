import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PublicCompany, JobPost } from '../types';
import { apiService } from '../services/api';
import { RegisterCompanyForm } from './companies/RegisterCompanyForm';
import { CompanyDetailContent } from './companies/CompanyDetailContent';
import { Modal } from './common/Modal';

interface CompanyModalProps {
  isOpen?: boolean;
  companyId: number | null;
  isCreateMode?: boolean;
  onClose: () => void;
  onCompanyCreated?: (comp: PublicCompany) => void;
  onViewJob?: (jobId: number) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  companyId,
  isCreateMode = false,
  onClose,
  onCompanyCreated,
  onViewJob,
}) => {
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const showModal = isOpen ?? (isCreateMode ? true : Boolean(companyId));

  useEffect(() => {
    if (!showModal || isCreateMode || !companyId) return;

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
  }, [showModal, companyId, isCreateMode]);

  return (
    <Modal isOpen={showModal} onClose={onClose} maxWidth="xl">
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
          onViewJob={onViewJob}
        />
      ) : null}
    </Modal>
  );
};
