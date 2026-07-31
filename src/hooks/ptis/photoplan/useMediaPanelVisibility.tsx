'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getMediaPanelVisibleFromCookie,
  setMediaPanelVisibleInCookie,
} from '@/lib/utils/cookie';

interface MediaPanelContextType {
  isPanelVisible: boolean;
  togglePanel: () => void;
  setIsPanelVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
}

const MediaPanelContext = createContext<MediaPanelContextType | undefined>(undefined);

interface MediaPanelProviderProps {
  children: React.ReactNode;
  initialVisible?: boolean;
}

/**
 * Provider to supply panel visibility state and actions to deep components.
 * Syncs visibility state with cookie `ptis_media_panel_visible`.
 */
export function MediaPanelProvider({
  children,
  initialVisible = false,
}: MediaPanelProviderProps): React.ReactElement {
  const [isPanelVisible, setIsPanelVisibleState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const cookieVal = getMediaPanelVisibleFromCookie();
      if (typeof cookieVal === 'boolean') return cookieVal;
    }
    return initialVisible;
  });

  const setIsPanelVisible = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsPanelVisibleState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      setMediaPanelVisibleInCookie(next);
      return next;
    });
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelVisible((prev) => !prev);
  }, [setIsPanelVisible]);

  return (
    <MediaPanelContext.Provider value={{ isPanelVisible, togglePanel, setIsPanelVisible }}>
      {children}
    </MediaPanelContext.Provider>
  );
}

/**
 * Hook to consume media panel visibility context.
 */
export function useMediaPanel(): MediaPanelContextType {
  const context = useContext(MediaPanelContext);
  if (!context) {
    throw new Error('useMediaPanel must be used within a MediaPanelProvider');
  }
  return context;
}
