import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredApiBaseUrl,
  setStoredApiBaseUrl,
  isDemoModeEnabled,
  setDemoModeEnabled,
  IS_DEMO_FEATURE_ALLOWED
} from '../services/api';

interface ApiConfigContextType {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  showDemoConfigUI: boolean;
  isTestingConnection: boolean;
  testConnection: () => Promise<{ success: boolean; message: string }>;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseUrl, setBaseUrlState] = useState<string>(getStoredApiBaseUrl());
  const [demoMode, setDemoModeState] = useState<boolean>(isDemoModeEnabled());
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  const handleSetBaseUrl = (url: string) => {
    setStoredApiBaseUrl(url);
    setBaseUrlState(url);
  };

  const handleSetDemoMode = (enabled: boolean) => {
    setDemoModeEnabled(enabled);
    setDemoModeState(isDemoModeEnabled());
  };

  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    setIsTestingConnection(true);
    try {
      const response = await fetch(`${baseUrl}/jobs/get-jobs-list/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      setIsTestingConnection(false);
      if (response.ok || response.status === 401 || response.status === 403) {
        return { success: true, message: `Connected successfully to ${baseUrl}` };
      } else {
        return { success: false, message: `Server responded with HTTP status ${response.status}` };
      }
    } catch (err: any) {
      setIsTestingConnection(false);
      return { success: false, message: err.message || `Could not reach ${baseUrl}` };
    }
  };

  return (
    <ApiConfigContext.Provider
      value={{
        baseUrl,
        setBaseUrl: handleSetBaseUrl,
        demoMode,
        setDemoMode: handleSetDemoMode,
        showDemoConfigUI: IS_DEMO_FEATURE_ALLOWED,
        isTestingConnection,
        testConnection
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) {
    throw new Error('useApiConfig must be used within an ApiConfigProvider');
  }
  return context;
};
