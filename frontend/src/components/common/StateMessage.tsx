import React from 'react';
import { RefreshCw, AlertCircle, LucideIcon } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <div className="py-20 text-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
    <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
    <p className="text-xs text-slate-400">{message}</p>
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs text-center space-y-3">
    <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
    <p className="leading-relaxed">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => (
  <div className="py-16 text-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
    <Icon className="w-10 h-10 text-slate-600 mx-auto" />
    <h3 className="text-base font-bold text-slate-200">{title}</h3>
    <p className="text-xs text-slate-400 max-w-md mx-auto">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-sky-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-sky-400 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);
