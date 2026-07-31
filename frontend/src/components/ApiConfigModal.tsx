import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Key, Globe } from 'lucide-react';
import { useApiConfig } from '../context/ApiConfigContext';
import { useAuth } from '../context/AuthContext';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const { baseUrl, setBaseUrl, demoMode, setDemoMode, isTestingConnection, testConnection } = useApiConfig();
  const { token } = useAuth();
  const [inputUrl, setInputUrl] = useState<string>(baseUrl);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setBaseUrl(inputUrl);
    onClose();
  };

  const handleTest = async () => {
    setBaseUrl(inputUrl);
    const res = await testConnection();
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Django API Configuration</h2>
            <p className="text-xs text-slate-400">Configure connection settings to the Django REST Framework server</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Mode Switcher */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-200">Interactive Demo Mode</span>
              <p className="text-xs text-slate-400 mt-0.5">
                {demoMode
                  ? 'Active: Local mock state handles all requests instantly.'
                  : 'Disabled: Requests target the live Django server directly.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* API Base URL Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Django REST Server Base URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="e.g. http://localhost:8000"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Expected endpoints include <code className="text-sky-400 font-mono">/jobs/get-jobs-list/</code>, <code className="text-sky-400 font-mono">/auth/login/</code>, etc.
            </p>
          </div>

          {/* Current Auth Token Info */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-300 mb-1">
              <Key className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold">Current Authorization Header:</span>
            </div>
            <p className="text-xs font-mono text-slate-400 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
              {token ? `Authorization: Token ${token}` : 'No Auth Token active (Public endpoints accessible)'}
            </p>
          </div>

          {/* Test Connection Button & Result */}
          <div>
            <button
              onClick={handleTest}
              disabled={isTestingConnection}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-800 transition-colors"
            >
              {isTestingConnection ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Pinging Django Server...</span>
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 text-sky-400" />
                  <span>Test API Connection</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`mt-2.5 p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                )}
                <p className="leading-relaxed">{testResult.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
