import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { TaskStatusResponse, ResumeAnalysisResult } from '../types';

interface UseTaskStatusOptions {
  intervalMs?: number;
  maxAttempts?: number;
  enabled?: boolean;
}

interface UseTaskStatusReturn<T = ResumeAnalysisResult> {
  status: string | null;
  result: T | null;
  error: string | null;
  isPolling: boolean;
  timedOut: boolean;
  attempts: number;
  reset: () => void;
}

export function useTaskStatus<T = ResumeAnalysisResult>(
  taskId: string | null,
  options: UseTaskStatusOptions = {}
): UseTaskStatusReturn<T> {
  const {
    intervalMs = 2000,
    maxAttempts = 60,
    enabled = true
  } = options;

  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [timedOut, setTimedOut] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const currentTaskIdRef = useRef<string | null>(taskId);
  currentTaskIdRef.current = taskId;

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus(null);
    setResult(null);
    setError(null);
    setIsPolling(false);
    setTimedOut(false);
    setAttempts(0);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!taskId || !enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    // Reset state for new taskId
    setStatus(null);
    setResult(null);
    setError(null);
    setTimedOut(false);
    setAttempts(0);
    setIsPolling(true);

    let attemptCount = 0;
    const activeTaskId = taskId;

    const pollTask = async (): Promise<boolean> => {
      if (!isMountedRef.current || currentTaskIdRef.current !== activeTaskId) {
        return true; // Stop polling
      }

      attemptCount += 1;
      setAttempts(attemptCount);

      if (attemptCount > maxAttempts) {
        if (isMountedRef.current && currentTaskIdRef.current === activeTaskId) {
          setTimedOut(true);
          setIsPolling(false);
          setError('The analysis is taking longer than expected. Please try again.');
        }
        return true; // Stop polling
      }

      try {
        const response: TaskStatusResponse<T> = await apiService.getTaskStatus<T>(activeTaskId);

        if (!isMountedRef.current || currentTaskIdRef.current !== activeTaskId) {
          return true;
        }

        const taskStatus = response.status;
        setStatus(taskStatus);

        const taskResult = response.result;
        if (taskResult) {
          setResult(taskResult);
        }

        if (taskStatus === 'SUCCESS') {
          setIsPolling(false);
          return true; // Complete
        }

        if (taskStatus === 'FAILURE' || taskStatus === 'REVOKED') {
          setIsPolling(false);
          const raw = taskResult as any;
          const errorMsg =
            (response as any)?.error ||
            raw?.error ||
            raw?.details ||
            (typeof raw === 'string' && raw) ||
            `Task ended with status: ${taskStatus}`;
          setError(errorMsg);
          return true; // Stop polling
        }

        return false; // Continue polling
      } catch (err: any) {
        if (!isMountedRef.current || currentTaskIdRef.current !== activeTaskId) {
          return true;
        }
        // If consecutive network failures or final attempt
        if (attemptCount >= maxAttempts) {
          setIsPolling(false);
          setError(err.message || 'Failed to check task status.');
          return true;
        }
        return false; // Retry next interval
      }
    };

    // Execute immediately on start
    pollTask().then((shouldStop) => {
      if (!shouldStop && isMountedRef.current && currentTaskIdRef.current === activeTaskId) {
        timerRef.current = setInterval(async () => {
          const stop = await pollTask();
          if (stop && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }, intervalMs);
      }
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [taskId, enabled, intervalMs, maxAttempts]);

  return {
    status,
    result,
    error,
    isPolling,
    timedOut,
    attempts,
    reset
  };
}
