'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isCacheValid } from './usePropertyPhotosQuery';

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const togglePanel = useCallback(() => {
    const next = !isPanelVisible;
    setIsPanelVisible(next);
    document.cookie = `ptis_media_panel_visible=${next}; path=/; max-age=31536000; SameSite=Lax`;

    if (next) {
      const propertyIdParam = searchParams.get('propertyId');
      const propertyId = propertyIdParam ? parseInt(propertyIdParam, 10) : undefined;
      const isCached = propertyId && isCacheValid(propertyId);
      if (!isCached) {
        router.refresh();
      }
    }
  }, [isPanelVisible, router, searchParams]);

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
