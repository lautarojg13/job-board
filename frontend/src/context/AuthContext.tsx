import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CustomUserDetails,
  LoginRequest,
  CustomUserRegistrationRequest,
  PatchedCustomUserDetailsRequest
} from '../types';
import type { ActiveTab } from '../components/Header';
import {
  apiService,
  getStoredAuthToken,
  setStoredAuthToken,
  setStoredRefreshToken
} from '../services/api';

interface AuthContextType {
  user: CustomUserDetails | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: CustomUserRegistrationRequest) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: PatchedCustomUserDetailsRequest) => Promise<void>;
  setPostLoginRedirect: (tab: ActiveTab) => void;
  getAndClearPostLoginRedirect: () => ActiveTab | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUserDetails | null>(null);
  const [token, setToken] = useState<string | null>(getStoredAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const postLoginRedirectRef = React.useRef<ActiveTab | null>(null);

  const setPostLoginRedirect = (tab: ActiveTab) => {
    postLoginRedirectRef.current = tab;
  };

  const getAndClearPostLoginRedirect = (): ActiveTab | null => {
    const tab = postLoginRedirectRef.current;
    postLoginRedirectRef.current = null;
    return tab;
  };

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const u = await apiService.getUser();
      setUser(u);
    } catch (err) {
      // If fetching user fails or unauthorized
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (data: LoginRequest) => {
    const res = await apiService.login(data);
    setStoredAuthToken(res.access);
    setStoredRefreshToken(res.refresh);
    setToken(res.access);
    await fetchCurrentUser();
  };

  const register = async (data: CustomUserRegistrationRequest): Promise<string> => {
    const res = await apiService.register(data);
    return res.detail || 'Registration successful. Please log in.';
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch {
      // ignore
    } finally {
      setStoredAuthToken(null);
      setStoredRefreshToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateProfile = async (data: PatchedCustomUserDetailsRequest) => {
    const updated = await apiService.updateUser(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        setPostLoginRedirect,
        getAndClearPostLoginRedirect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
