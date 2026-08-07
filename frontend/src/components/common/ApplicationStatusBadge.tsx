import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ApplicationStatusEnum } from '../../types';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatusEnum;
  className?: string;
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'accepted':
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accepted
        </span>
      );
    case 'rejected':
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center ${className}`}>
          <XCircle className="w-3.5 h-3.5 mr-1" /> Rejected
        </span>
      );
    case 'reviewed':
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center ${className}`}>
          <Clock className="w-3.5 h-3.5 mr-1" /> Reviewed
        </span>
      );
    case 'withdrawn':
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center ${className}`}>
          Withdrawn
        </span>
      );
    case 'pending':
    default:
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center ${className}`}>
          <Clock className="w-3.5 h-3.5 mr-1" /> Pending
        </span>
      );
  }
};
