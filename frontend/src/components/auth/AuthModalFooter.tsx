import React from 'react';
import { AuthMode } from '../AuthModal';

interface AuthModalFooterProps {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
}

export const AuthModalFooter: React.FC<AuthModalFooterProps> = ({ mode, onSwitchMode }) => {
  return (
    <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap gap-2 justify-center">
      {mode === 'login' ? (
        <>
          <span>Need an account?</span>
          <button
            type="button"
            onClick={() => onSwitchMode('register')}
            className="text-sky-400 font-bold hover:underline"
          >
            Register
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onSwitchMode('password_reset')}
            className="text-slate-400 hover:text-white"
          >
            Forgot password?
          </button>
        </>
      ) : mode === 'register' ? (
        <>
          <span>Already registered?</span>
          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className="text-sky-400 font-bold hover:underline"
          >
            Sign In
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onSwitchMode('resend_email')}
            className="text-slate-400 hover:text-white"
          >
            Resend Verification
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onSwitchMode('login')}
          className="text-sky-400 font-bold hover:underline"
        >
          Back to Sign In
        </button>
      )}
    </div>
  );
};
