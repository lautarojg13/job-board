import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import { JobPost, ApplicationList } from '../../types';
import { Modal } from '../common/Modal';

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
  return (
    <Modal
      isOpen={Boolean(selectedJob)}
      onClose={onClose}
      maxWidth="2xl"
      icon={<Users className="w-5 h-5" />}
      title={selectedJob ? `Applicants for "${selectedJob.title}"` : ''}
      subtitle="Endpoint: GET /applications/get-job-applications/{job_id}/"
    >
      {selectedJob && (
        <>
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
        </>
      )}
    </Modal>
  );
};
