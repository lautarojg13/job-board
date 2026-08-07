import React from 'react';
import { Users, XCircle, Loader2 } from 'lucide-react';
import { JobPost, ApplicationList } from '../../types';

interface JobApplicantsModalProps {
  selectedJob: JobPost | null;
  applications: ApplicationList[];
  loadingApps: boolean;
  onClose: () => void;
  onRespond: (appId: number) => void;
}

export const JobApplicantsModal: React.FC<JobApplicantsModalProps> = ({
  selectedJob,
  applications,
  loadingApps,
  onClose,
  onRespond,
}) => {
  if (!selectedJob) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-slate-100 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Applicants for "{selectedJob.title}"</h2>
            <p className="text-xs text-slate-400">Endpoint: GET /applications/get-job-applications/&#123;job_id&#125;/</p>
          </div>
        </div>

        {loadingApps ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400" />
            <p className="text-xs">Fetching applicants...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic bg-slate-900/40 rounded-xl border border-slate-800">
            No job applications submitted for this role yet.
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">Application #{app.id}</span>
                  <span className="text-slate-400 text-[11px]">
                    Submitted {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="capitalize font-semibold text-sky-400">{app.status}</span>
                  <button
                    onClick={() => onRespond(app.id)}
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
