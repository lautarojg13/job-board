import React from 'react';
import { FileCheck, FileText, ExternalLink } from 'lucide-react';
import { ApplicationDetail, JobPost } from '../../types';
import { ApplicationStatusBadge } from '../common/ApplicationStatusBadge';
import { Modal } from '../common/Modal';

interface ApplicationDetailModalProps {
  appDetail: ApplicationDetail | null;
  selectedJob: JobPost | null;
  onClose: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  appDetail,
  selectedJob,
  onClose,
}) => {
  return (
    <Modal
      isOpen={Boolean(appDetail)}
      onClose={onClose}
      maxWidth="lg"
      icon={<FileCheck className="w-5 h-5" />}
      title={appDetail ? `Application #${appDetail.id}` : ''}
      subtitle={appDetail ? `Applied on ${new Date(appDetail.created_at).toLocaleString()}` : ''}
    >
      {appDetail && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Status:</span>
              <ApplicationStatusBadge status={appDetail.status} />
            </div>
            {selectedJob && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block">Target Job Title:</span>
                <span className="font-bold text-white text-sm">{selectedJob.title}</span>
                <span className="text-slate-400 block mt-0.5">{selectedJob.location || 'Remote'}</span>
              </div>
            )}
          </div>

          {appDetail.cover_letter && (
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Cover Letter Submitted
              </span>
              <p className="p-3 bg-slate-900/60 rounded-xl text-xs text-slate-300 leading-relaxed border border-slate-800">
                {appDetail.cover_letter}
              </p>
            </div>
          )}

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
              Attached Resume
            </span>
            <a
              href={appDetail.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-mono border border-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span className="truncate max-w-[260px]">{appDetail.resume}</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
