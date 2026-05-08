import { useEffect, useRef, useCallback } from "react";

export const useTableAutoScroll = (isAutoScrolling: boolean) => {
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollDirectionRef = useRef<number>(1);

  const findScrollableElement = useCallback(() => {
    const selectors = [
      '[class*="overflow-x-auto"]', '[class*="overflow-auto"]', '[style*="overflow"]',
      'div[class*="table"]', '.table-container', '#table-wrapper div[style*="overflow"]',
      '.master-table-container',
    ];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const htmlEl = el as HTMLElement;
        if (htmlEl.scrollWidth > htmlEl.clientWidth) return htmlEl;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const smoothScroll = () => {
      if (!scrollContainerRef.current || !isAutoScrolling) return;
      const el = scrollContainerRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 1) scrollDirectionRef.current = -1;
      else if (el.scrollLeft <= 1) scrollDirectionRef.current = 1;
      el.scrollLeft = Math.max(0, Math.min(maxScroll, el.scrollLeft + scrollDirectionRef.current));
      animationFrameRef.current = requestAnimationFrame(smoothScroll);
    };

    if (isAutoScrolling) {
      let activeContainer: HTMLElement | null = null;
      let mouseEnterHandler: () => void;
      let mouseLeaveHandler: () => void;

      const timeoutId = setTimeout(() => {
        const container = findScrollableElement();
        if (!container) return;
        activeContainer = container;
        scrollContainerRef.current = container;
        container.style.outline = "1px solid #5a81ec";
        
        mouseEnterHandler = () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
        mouseLeaveHandler = () => { if (isAutoScrolling) animationFrameRef.current = requestAnimationFrame(smoothScroll); };
        
        container.addEventListener('mouseenter', mouseEnterHandler);
        container.addEventListener('mouseleave', mouseLeaveHandler);
        animationFrameRef.current = requestAnimationFrame(smoothScroll);
      }, 150);

      return () => {
        clearTimeout(timeoutId);
        if (activeContainer) {
          activeContainer.removeEventListener('mouseenter', mouseEnterHandler);
          activeContainer.removeEventListener('mouseleave', mouseLeaveHandler);
          activeContainer.style.outline = "";
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.outline = "";
        scrollContainerRef.current = null;
      }
    }
  }, [isAutoScrolling, findScrollableElement]);

  useEffect(() => () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); }, []);
};
