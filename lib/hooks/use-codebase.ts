'use client';

import { useState, useCallback } from 'react';
import type { CodebaseRequest, CodebaseResponse, GeneratedFile } from '@/lib/config';

export function useCodebase() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codebase, setCodebase] = useState<CodebaseResponse | null>(null);

  const generateCodebase = useCallback(async (request: CodebaseRequest) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate codebase');
      }

      const result: CodebaseResponse = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.instructions);
      }

      setCodebase(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const deployCodebase = useCallback(async (codebaseResponse: CodebaseResponse) => {
    setIsDeploying(true);
    setError(null);
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codebaseResponse }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deploy codebase');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy codebase';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, []);

  const optimizeCodebase = useCallback(async (
    files: GeneratedFile[],
    optimizationType: 'performance' | 'readability' | 'security' | 'all'
  ) => {
    setIsOptimizing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files, optimizationType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize codebase');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize codebase';
      setError(errorMessage);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetCodebase = useCallback(() => {
    setCodebase(null);
    setError(null);
  }, []);

  return {
    // State
    isGenerating,
    isDeploying,
    isOptimizing,
    error,
    codebase,
    
    // Actions
    generateCodebase,
    deployCodebase,
    optimizeCodebase,
    clearError,
    resetCodebase,
  };
}
