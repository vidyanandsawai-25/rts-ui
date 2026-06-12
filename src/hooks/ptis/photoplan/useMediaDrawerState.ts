import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useMediaDrawerState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isDrawerOpen = searchParams.get('drawer') === 'photo-plan';
  const categoryIndexParam = searchParams.get('photoCategoryIndex');
  const parsedIndex = categoryIndexParam ? parseInt(categoryIndexParam, 10) : 0;
  const drawerInitialCategoryIndex = isNaN(parsedIndex) ? 0 : parsedIndex;

  const openDrawer = useCallback(
    (idx: number, selectedImageIndex?: number, action?: string) => {
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
      router.push(`${pathname}?${p.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const closeDrawer = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('drawer');
    p.delete('photoCategoryIndex');
    p.delete('selectedImageIndex');
    p.delete('viewMode');
    p.delete('action');
    router.push(`${pathname}?${p.toString()}`);
  }, [searchParams, pathname, router]);

  return {
    isDrawerOpen,
    drawerInitialCategoryIndex,
    openDrawer,
    closeDrawer,
  };
}
