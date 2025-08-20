import { useState, useCallback, useRef } from 'react';
import { withRetry, RetryOptions } from '../utils/retryMechanism';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOperationOptions<T> {
  initialData?: T;
  retryOptions?: RetryOptions;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsyncOperation<T>(
  options: UseAsyncOperationOptions<T> = {}
) {
  const { initialData = null, retryOptions, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>) => {
      // Cancel any ongoing operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const wrappedOperation = async () => {
          if (signal.aborted) {
            throw new Error('Operation was cancelled');
          }
          return await operation();
        };

        const result = retryOptions
          ? await withRetry(wrappedOperation, retryOptions)
          : await wrappedOperation();

        if (!signal.aborted) {
          setState({
            data: result,
            loading: false,
            error: null,
          });

          onSuccess?.(result);
        }

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        if (!signal.aborted) {
          setState({
            data: null,
            loading: false,
            error: errorObj,
          });

          onError?.(errorObj);
        }

        throw errorObj;
      }
    },
    [retryOptions, onSuccess, onError]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      loading: false,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
    isIdle: !state.loading && !state.error && state.data === null,
    isSuccess: !state.loading && !state.error && state.data !== null,
  };
}