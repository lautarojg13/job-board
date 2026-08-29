import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthRequiredState } from './AuthRequiredState';
import { LoadingState } from '../common/StateMessage';
import { ActiveTab } from '../Header';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo: ActiveTab;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  redirectTo,
  onOpenAuthModal,
}) => {
  const { isAuthenticated, isLoading, setPostLoginRedirect } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setPostLoginRedirect(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, setPostLoginRedirect]);

  if (isLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <AuthRequiredState onSignIn={() => onOpenAuthModal('login')} />;
  }

  return <>{children}</>;
};
