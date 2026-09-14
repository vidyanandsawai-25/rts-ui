'use client';

import { useRef, useCallback, useEffect } from 'react';

export function useApartmentWingScrollControl() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const leftArrowRef = useRef<HTMLDivElement>(null);
  const rightArrowRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    
    // Add a 5px tolerance to account for subpixel rendering or slight flexbox rounding
    const isScrollable = scrollWidth > clientWidth + 5;
    
    if (leftArrowRef.current) {
      leftArrowRef.current.style.display = (isScrollable && scrollLeft > 5) ? 'block' : 'none';
    }
    if (rightArrowRef.current) {
      rightArrowRef.current.style.display = (isScrollable && Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5) ? 'block' : 'none';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el?.firstElementChild) return;
    el.scrollBy({ left: el.firstElementChild.clientWidth + 16, behavior: 'smooth' });
  }, []);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el?.firstElementChild) return;
    el.scrollBy({ left: -(el.firstElementChild.clientWidth + 16), behavior: 'smooth' });
  }, []);

  const initScrollRef = useCallback((node: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (node) setTimeout(checkScroll, 100);
  }, [checkScroll]);

  return { leftArrowRef, rightArrowRef, scrollNext, scrollPrev, checkScroll, initScrollRef };
}

export { useApartmentWingScrollControl as useWingScrollControl };
