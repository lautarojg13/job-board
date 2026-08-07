import React from 'react';
import { User as UserIcon, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';

interface ProfileDetailsFormProps {
  username: string;
  setUsername: (val: string) => void;
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  isUpdating: boolean;
  profileMsg: string | null;
  profileError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileDetailsForm: React.FC<ProfileDetailsFormProps> = ({
  username,
  setUsername,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  isUpdating,
  profileMsg,
  profileError,
  onSubmit,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
        <UserIcon className="w-5 h-5 text-sky-400" />
        <h2 className="text-base font-bold text-white">Update Personal Details</h2>
      </div>

      {profileMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{profileMsg}</span>
        </div>
      )}

      {profileError && (
        <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-2 transition-colors"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
