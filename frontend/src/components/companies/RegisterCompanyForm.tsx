import React, { useState } from 'react';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { PublicCompany } from '../../types';
import { apiService } from '../../services/api';

interface RegisterCompanyFormProps {
  onClose: () => void;
  onCompanyCreated?: (comp: PublicCompany) => void;
}

export const RegisterCompanyForm: React.FC<RegisterCompanyFormProps> = ({
  onClose,
  onCompanyCreated,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiService.createCompany({
        name,
        description: description || null,
        website: website || null,
      });
      if (onCompanyCreated) onCompanyCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};
