import React from 'react';
import { Lock } from 'lucide-react';

interface AuthRequiredStateProps {
  title?: string;
  description?: string;
  onSignIn: () => void;
}

export const AuthRequiredState: React.FC<AuthRequiredStateProps> = ({
  title = 'Authentication Required',
  description = 'Please sign in to access this section.',
  onSignIn,
}) => {
  return (
    <div className="max-w-xl mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
      <Lock className="w-12 h-12 text-slate-600 mx-auto" />
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-xs text-slate-400">{description}</p>
      <button
        onClick={onSignIn}
        className="mt-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-sky-500/10"
      >
        Sign In
      </button>
    </div>
  );
};
