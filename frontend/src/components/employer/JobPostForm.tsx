import React from 'react';
import { Briefcase, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { PublicCompany, EmploymentTypeEnum, WorkModeEnum, JobPostStatusEnum } from '../../types';

interface JobPostFormProps {
  editingJobId: number | null;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  companyId: number | undefined;
  setCompanyId: (val: number) => void;
  location: string;
  setLocation: (val: string) => void;
  salary: number | undefined;
  setSalary: (val: number | undefined) => void;
  employmentType: EmploymentTypeEnum;
  setEmploymentType: (val: EmploymentTypeEnum) => void;
  workMode: WorkModeEnum;
  setWorkMode: (val: WorkModeEnum) => void;
  status: JobPostStatusEnum;
  setStatus: (val: JobPostStatusEnum) => void;
  companies: PublicCompany[];
  isSubmittingJob: boolean;
  jobSubmitSuccess: string | null;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const JobPostForm: React.FC<JobPostFormProps> = ({
  editingJobId,
  title,
  setTitle,
  description,
  setDescription,
  companyId,
  setCompanyId,
  location,
  setLocation,
  salary,
  setSalary,
  employmentType,
  setEmploymentType,
  workMode,
  setWorkMode,
  status,
  setStatus,
  companies,
  isSubmittingJob,
  jobSubmitSuccess,
  error,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">
            {editingJobId ? `Edit Job Posting #${editingJobId}` : 'Publish New Job Posting'}
          </h2>
          <p className="text-xs text-slate-400">Endpoint: POST /jobs/post-job/ or PATCH /jobs/edit-job-post/&#123;id&#125;/</p>
        </div>
      </div>

      {jobSubmitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{jobSubmitSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Job Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Backend Engineer (Python/Django)"
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Company
            </label>
            <select
              value={companyId || ''}
              onChange={(e) => setCompanyId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, CA or Remote"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentTypeEnum)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="FT">Full-Time (FT)</option>
              <option value="PT">Part-Time (PT)</option>
              <option value="CT">Contract (CT)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as WorkModeEnum)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobPostStatusEnum)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Annual Salary ($ USD)
          </label>
          <input
            type="number"
            value={salary || ''}
            onChange={(e) => setSalary(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 150000"
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Detailed Job Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Specify requirements, tech stack, and benefits..."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmittingJob}
            className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors"
          >
            {isSubmittingJob ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{editingJobId ? 'Save Changes' : 'Publish Job Post'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
