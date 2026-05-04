import { LoadingPage } from '@/components/common/LoadingPage';

/**
 * PtisTabSkeleton
 * Reusable loading fallback used by Suspense in PtisMainScreen for each tab section
 * (Rateable, Capital, Dual Method). Uses the shared LoadingPage spinner component.
 */
export function PtisTabSkeleton() {
  return <LoadingPage />;
}

/**
 * PtisLoading (default export)
 * Next.js route-level loading boundary for the entire PTIS page.
 */
export default function PtisLoading() {
  return <LoadingPage />;
}
