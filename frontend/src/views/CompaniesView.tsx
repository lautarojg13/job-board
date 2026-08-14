import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { PublicCompany } from '../types';
import { apiService } from '../services/api';
import { CompanyModal } from '../components/CompanyModal';
import { CompaniesHeader } from '../components/companies/CompaniesHeader';
import { CompaniesFilterBar } from '../components/companies/CompaniesFilterBar';
import { CompanyCard } from '../components/companies/CompanyCard';
import { LoadingState, ErrorState, EmptyState } from '../components/common/StateMessage';

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
      <CompaniesHeader onRegisterClick={() => setIsRegistering(true)} />

      {/* Search & Order Filters */}
      <CompaniesFilterBar
        search={search}
        onSearchChange={setSearch}
        ordering={ordering}
        onOrderingChange={setOrdering}
        loading={loading}
        onRefresh={loadCompanies}
      />

      {/* Companies List Grid */}
      {loading ? (
        <LoadingState message="Fetching companies directory..." />
      ) : error ? (
        <ErrorState error={error} onRetry={loadCompanies} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description="No organizations matched your search filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => (
            <CompanyCard
              key={comp.id}
              company={comp}
              onSelect={setSelectedCompanyId}
            />
          ))}
        </div>
      )}

      {/* View Company Detail Modal */}
      <CompanyModal
        isOpen={Boolean(selectedCompanyId)}
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
        onSelectJob={onSelectJob}
      />

      {/* Register Company Modal */}
      <CompanyModal
        isOpen={isRegistering}
        companyId={null}
        isCreateMode={true}
        onClose={() => setIsRegistering(false)}
        onCompanyCreated={() => loadCompanies()}
      />
    </div>
  );
};
