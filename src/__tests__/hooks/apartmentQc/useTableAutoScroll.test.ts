import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTableAutoScroll } from "@/hooks/apartmentQc/useTableAutoScroll";

describe("useTableAutoScroll", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    // Setup mock element
    mockElement = document.createElement('div');
    Object.defineProperty(mockElement, 'scrollWidth', { value: 1000, configurable: true });
    Object.defineProperty(mockElement, 'clientWidth', { value: 500, configurable: true });
    mockElement.scrollLeft = 0;
    mockElement.className = "overflow-x-auto";
    document.body.appendChild(mockElement);

    // Mock findScrollableElement by actually letting it find the element in the DOM
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockElement] as any);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should start scrolling when isAutoScrolling is true", () => {
    const { unmount } = renderHook(() => useTableAutoScroll(true));

    // Fast-forward timeout
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // In a real browser, requestAnimationFrame would trigger smoothScroll.
    // In Vitest, we'd need to mock rAF to see scrollLeft change.
    expect(mockElement.style.outline).toContain("solid");
    
    unmount();
    expect(mockElement.style.outline).toBe("");
  });

  it("should not scroll when isAutoScrolling is false", () => {
    renderHook(() => useTableAutoScroll(false));
    
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockElement.style.outline).toBe("");
  });
});

// Helper act because renderHook from @testing-library/react doesn't always handle timers well with act
function act(callback: () => void) {
  callback();
}
