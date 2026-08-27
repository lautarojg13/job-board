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
  testConnection: (overrideUrl?: string) => Promise<{ success: boolean; message: string }>;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseUrl, setBaseUrlState] = useState<string>(getStoredApiBaseUrl());
  const [demoMode, setDemoModeState] = useState<boolean>(isDemoModeEnabled());
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  const handleSetBaseUrl = (url: string) => {
    const cleaned = url.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    setStoredApiBaseUrl(cleaned);
    setBaseUrlState(cleaned);
  };

  const handleSetDemoMode = (enabled: boolean) => {
    setDemoModeEnabled(enabled);
    setDemoModeState(isDemoModeEnabled());
  };

  const testConnection = async (overrideUrl?: string): Promise<{ success: boolean; message: string }> => {
    setIsTestingConnection(true);
    const rawUrl = overrideUrl !== undefined ? overrideUrl : baseUrl;
    const targetUrl = rawUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    try {
      const response = await fetch(`${targetUrl}/jobs/get-jobs-list/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      setIsTestingConnection(false);

      const contentType = response.headers.get('content-type') || '';
      // If the response is HTML, it hit the SPA web server instead of a Django REST backend
      if (contentType.includes('text/html')) {
        return {
          success: false,
          message: `The server at ${targetUrl} returned HTML (SPA fallback), not a valid JSON API response.`
        };
      }

      if (response.ok || response.status === 401 || response.status === 403) {
        return { success: true, message: `Connected successfully to ${targetUrl}` };
      } else {
        return { success: false, message: `Server responded with HTTP status ${response.status}` };
      }
    } catch (err: any) {
      setIsTestingConnection(false);
      return { success: false, message: err.message || `Could not reach ${targetUrl}` };
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
