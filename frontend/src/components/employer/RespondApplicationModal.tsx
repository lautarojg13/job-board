import React from 'react';
import { Send, XCircle, Loader2 } from 'lucide-react';
import { ApplicationDetail, ApplicationStatusEnum } from '../../types';

interface RespondApplicationModalProps {
  respondingAppId: number | null;
  appDetail: ApplicationDetail | null;
  responseStatus: ApplicationStatusEnum;
  setResponseStatus: (val: ApplicationStatusEnum) => void;
  responseMessage: string;
  setResponseMessage: (val: string) => void;
  isSubmittingResponse: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RespondApplicationModal: React.FC<RespondApplicationModalProps> = ({
  respondingAppId,
  appDetail,
  responseStatus,
  setResponseStatus,
  responseMessage,
  setResponseMessage,
  isSubmittingResponse,
  onClose,
  onSubmit,
}) => {
  if (!respondingAppId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Respond to Application #{respondingAppId}</h2>
            <p className="text-xs text-slate-400">PATCH /applications/respond-to-application/&#123;id&#125;/</p>
          </div>
        </div>

        {appDetail && (
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Cover Letter:</span>
              <p className="text-slate-300 italic">{appDetail.cover_letter || 'No cover letter provided.'}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Resume URL:</span>
              <a
                href={appDetail.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline break-all"
              >
                {appDetail.resume}
              </a>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Update Application Status
            </label>
            <select
              value={responseStatus}
              onChange={(e) => setResponseStatus(e.target.value as ApplicationStatusEnum)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Custom Response Message
            </label>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={3}
              placeholder="e.g. We are excited to invite you to an initial interview!"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingResponse}
              className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2"
            >
              {isSubmittingResponse ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Status</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
