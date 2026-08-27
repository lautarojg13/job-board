import React, { useState, useEffect } from 'react';
import { AuthAlert } from './auth/AuthAlert';
import { AuthModalFooter } from './auth/AuthModalFooter';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { PasswordResetForm } from './auth/PasswordResetForm';
import { PasswordConfirmForm } from './auth/PasswordConfirmForm';
import { PasswordChangeForm } from './auth/PasswordChangeForm';
import { EmailVerificationForm } from './auth/EmailVerificationForm';
import { Modal } from './common/Modal';

export type AuthMode =
  | 'login'
  | 'register'
  | 'password_reset'
  | 'password_confirm'
  | 'password_change'
  | 'resend_email'
  | 'verify_email';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  const handleResetAlerts = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    handleResetAlerts();
  };

  const getTitle = (currentMode: AuthMode) => {
    switch (currentMode) {
      case 'login':
        return 'Sign In to JobBoard';
      case 'register':
        return 'Create Account';
      case 'password_reset':
        return 'Reset Password';
      case 'password_confirm':
        return 'Confirm Password Reset';
      case 'password_change':
        return 'Change Password';
      case 'resend_email':
        return 'Resend Email Verification';
      case 'verify_email':
        return 'Verify Email Address';
      default:
        return 'Authentication';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={getTitle(mode)}
      subtitle="Secure Account Gateway"
    >
      {/* Alert Messages */}
      <AuthAlert error={error} successMsg={successMsg} />

      {/* Dynamic Auth Form */}
      {mode === 'login' && (
        <LoginForm
          onSuccess={setSuccessMsg}
          onError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onClose={onClose}
          onResetAlerts={handleResetAlerts}
        />
      )}

      {mode === 'register' && (
        <RegisterForm
          onSuccess={setSuccessMsg}
          onError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onSwitchMode={handleModeSwitch}
          onResetAlerts={handleResetAlerts}
        />
      )}

      {mode === 'password_reset' && (
        <PasswordResetForm
          onSuccess={setSuccessMsg}
          onError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onResetAlerts={handleResetAlerts}
        />
      )}

      {mode === 'password_confirm' && (
        <PasswordConfirmForm
          onSuccess={setSuccessMsg}
          onError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onSwitchMode={handleModeSwitch}
          onResetAlerts={handleResetAlerts}
        />
      )}

      {mode === 'password_change' && (
        <PasswordChangeForm
          onSuccess={setSuccessMsg}
          onError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onResetAlerts={handleResetAlerts}
        />
      )}

      {(mode === 'resend_email' || mode === 'verify_email') && (
        <EmailVerificationForm
          mode={mode}
          onSuccess={setSuccessMsg}
          onError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onResetAlerts={handleResetAlerts}
        />
      )}

      {/* Footer Mode Switcher */}
      <AuthModalFooter mode={mode} onSwitchMode={handleModeSwitch} />
    </Modal>
  );
};
