import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthAlertProps {
  error?: string | null;
  successMsg?: string | null;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ error, successMsg }) => {
  if (!error && !successMsg) return null;

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="leading-relaxed">{successMsg}</span>
        </div>
      )}
    </>
  );
};
