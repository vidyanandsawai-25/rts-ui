import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useMediaDrawerState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state for instant UI responsiveness
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialCategoryIndex, setDrawerInitialCategoryIndex] = useState(0);

  // Sync state with URL searchParams (e.g., on initial load or back/forward navigation)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const hasDrawer = searchParams.get('drawer') === 'photo-plan';
    setIsDrawerOpen(hasDrawer);

    if (hasDrawer) {
      const idx = searchParams.get('photoCategoryIndex');
      if (idx) {
        const parsed = parseInt(idx, 10);
        if (!isNaN(parsed)) {
          setDrawerInitialCategoryIndex(parsed);
        }
      }
    }
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openDrawer = useCallback(
    (idx: number, selectedImageIndex?: number, action?: string) => {
      // 1. URL update synchronously to prevent race conditions with child components reading window.location.search
      const p = new URLSearchParams(searchParams.toString());
      p.set('drawer', 'photo-plan');
      p.set('photoCategoryIndex', idx.toString());
      if (selectedImageIndex !== undefined) {
        p.set('selectedImageIndex', selectedImageIndex.toString());
        p.set('viewMode', 'viewer');
      } else {
        p.delete('selectedImageIndex');
        p.delete('viewMode');
      }
      if (action) {
        p.set('action', action);
      } else {
        p.delete('action');
      }

      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `${pathname}?${p.toString()}`);
      }

      // 2. Instant state update for UX responsiveness
      setIsDrawerOpen(true);
      setDrawerInitialCategoryIndex(idx);

      // 3. Sync Next.js router state asynchronously
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const closeDrawer = useCallback(() => {
    // 1. URL update synchronously
    const p = new URLSearchParams(searchParams.toString());
    p.delete('drawer');
    p.delete('photoCategoryIndex');
    p.delete('selectedImageIndex');
    p.delete('viewMode');
    p.delete('action');

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${pathname}?${p.toString()}`);
    }

    // 2. Instant state update for UX responsiveness (drawer unmounts instantly)
    setIsDrawerOpen(false);

    // 3. Sync Next.js router state asynchronously
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  return {
    isDrawerOpen,
    drawerInitialCategoryIndex,
    openDrawer,
    closeDrawer,
  };
}
