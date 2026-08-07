import React from 'react';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ProfilePasswordFormProps {
  newPassword1: string;
  setNewPassword1: (val: string) => void;
  newPassword2: string;
  setNewPassword2: (val: string) => void;
  isChangingPass: boolean;
  passMsg: string | null;
  passError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfilePasswordForm: React.FC<ProfilePasswordFormProps> = ({
  newPassword1,
  setNewPassword1,
  newPassword2,
  setNewPassword2,
  isChangingPass,
  passMsg,
  passError,
  onSubmit,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
        <Lock className="w-5 h-5 text-sky-400" />
        <h2 className="text-base font-bold text-white">Change Account Password</h2>
      </div>

      {passMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{passMsg}</span>
        </div>
      )}

      {passError && (
        <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{passError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isChangingPass}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-2 transition-colors"
          >
            {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
};
