'use client';

import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, description?: string) => {
    addToast({ type: 'success', message, description });
  }, [addToast]);

  const error = useCallback((message: string, description?: string) => {
    addToast({ type: 'error', message, description });
  }, [addToast]);

  const info = useCallback((message: string, description?: string) => {
    addToast({ type: 'info', message, description });
  }, [addToast]);

  const warning = useCallback((message: string, description?: string) => {
    addToast({ type: 'warning', message, description });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
}

