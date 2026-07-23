'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface MediaPanelContextType {
  isPanelVisible: boolean;
  togglePanel: () => void;
}

const MediaPanelContext = createContext<MediaPanelContextType | undefined>(undefined);

interface MediaPanelProviderProps {
  children: React.ReactNode;
  initialVisible: boolean;
}

/**
 * Provider to supply panel visibility state and actions to deep components.
 */
export function MediaPanelProvider({ children, initialVisible }: MediaPanelProviderProps): React.ReactElement {
  const [isPanelVisible, setIsPanelVisible] = useState(initialVisible);

  const togglePanel = useCallback(() => {
    setIsPanelVisible((prev) => !prev);
  }, []);

  return (
    <MediaPanelContext.Provider value={{ isPanelVisible, togglePanel }}>
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
