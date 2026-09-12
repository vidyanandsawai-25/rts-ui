import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  MediaPanelProvider,
  useMediaPanel,
} from '@/hooks/ptis/photoplan/useMediaPanelVisibility';

describe('useMediaPanelVisibility', () => {
  it('provides visibility state and toggle functions via context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MediaPanelProvider initialVisible={true}>{children}</MediaPanelProvider>
    );

    const { result } = renderHook(() => useMediaPanel(), { wrapper });

    expect(result.current.isPanelVisible).toBe(true);

    act(() => {
      result.current.togglePanel();
    });

    expect(result.current.isPanelVisible).toBe(false);

    act(() => {
      result.current.setIsPanelVisible(true);
    });

    expect(result.current.isPanelVisible).toBe(true);
  });
});
