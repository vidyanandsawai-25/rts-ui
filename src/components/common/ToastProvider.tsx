'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * ToastProvider provides a context-based API for triggering toasts from any client component.
 * It now forwards all calls to 'sonner' to ensure a single, consistent toast stack.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const addToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const toastFn = 
      type === 'success' ? sonnerToast.success : 
      type === 'error' ? sonnerToast.error : 
      type === 'warning' ? sonnerToast.warning : 
      sonnerToast.info;
    
    toastFn(message, { duration });
  }, []);

  const contextValue = useMemo(() => ({
    toast: addToast,
    success: (msg: string, dur?: number) => addToast(msg, 'success', dur),
    error: (msg: string, dur?: number) => addToast(msg, 'error', dur),
    info: (msg: string, dur?: number) => addToast(msg, 'info', dur),
    warning: (msg: string, dur?: number) => addToast(msg, 'warning', dur),
  }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

const shownToasts = new Set<string>();

/**
 * SSR-Friendly Notifier.
 * Since Server Components cannot call hooks or trigger side effects, they can render
 * this component with a message prop. This component, being a client component,
 * will trigger a sonner toast on mount.
 */
export function ToastNotifier({ 
  message, 
  type = 'error',
  id
}: { 
  message: string; 
  type?: ToastType;
  id?: string;
}) {
  const triggeredMessage = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Use an explicit ID if provided, otherwise fallback to the message itself.
    // This allows unique errors to be shown once per session, preventing 
    // duplicate firing on tab re-mounts or hydration.
    const toastId = id || message;

    if (message && !shownToasts.has(toastId)) {
      const toastFn = 
        type === 'success' ? sonnerToast.success : 
        type === 'error' ? sonnerToast.error : 
        type === 'warning' ? sonnerToast.warning : 
        sonnerToast.info;
      
      toastFn(message);
      shownToasts.add(toastId);
      triggeredMessage.current = message;
    }
  }, [message, type, id]);

  return null;
}

