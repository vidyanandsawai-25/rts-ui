import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaPanelVisibility } from '@/hooks/asset/asset-register/useMediaPanelVisibility';

describe('useMediaPanelVisibility', () => {
  it('initialises panel as hidden by default', () => {
    const { result } = renderHook(() => useMediaPanelVisibility());
    expect(result.current.isPanelVisible).toBe(false);
  });

  it('initialises panel as hidden when initialVisible=false', () => {
    const { result } = renderHook(() => useMediaPanelVisibility(false));
    expect(result.current.isPanelVisible).toBe(false);
  });

  it('initialises panel as visible when initialVisible=true', () => {
    const { result } = renderHook(() => useMediaPanelVisibility(true));
    expect(result.current.isPanelVisible).toBe(true);
  });

  it('togglePanel flips visibility from false → true', () => {
    const { result } = renderHook(() => useMediaPanelVisibility(false));
    act(() => {
      result.current.togglePanel();
    });
    expect(result.current.isPanelVisible).toBe(true);
  });

  it('togglePanel flips visibility from true → false', () => {
    const { result } = renderHook(() => useMediaPanelVisibility(true));
    act(() => {
      result.current.togglePanel();
    });
    expect(result.current.isPanelVisible).toBe(false);
  });

  it('togglePanel can be called multiple times and stays in sync', () => {
    const { result } = renderHook(() => useMediaPanelVisibility(false));
    act(() => {
      result.current.togglePanel(); // false -> true
    });
    expect(result.current.isPanelVisible).toBe(true);
    act(() => {
      result.current.togglePanel(); // true -> false
    });
    expect(result.current.isPanelVisible).toBe(false);
    act(() => {
      result.current.togglePanel(); // false -> true
    });
    expect(result.current.isPanelVisible).toBe(true);
  });
});
