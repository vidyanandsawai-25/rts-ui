'use client';

import React, { createContext, useContext, useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { PropertyListItem } from '@/types/ptis.types';

interface PtisNavigationContextType {
  isPending: boolean;
  currentPage: number;
  totalPages: number;
  properties: PropertyListItem[];
  navigateToPage: (page: number) => void;
}

const PtisNavigationContext = createContext<PtisNavigationContextType | null>(null);

export function usePtisNavigation() {
  const context = useContext(PtisNavigationContext);
  if (!context) {
    throw new Error('usePtisNavigation must be used within a PtisNavigationProvider');
  }
  return context;
}

export function useOptionalPtisNavigation() {
  return useContext(PtisNavigationContext);
}

interface PtisNavigationProviderProps {
  children: React.ReactNode;
  properties: PropertyListItem[];
}

export function PtisNavigationProvider({ children, properties }: PtisNavigationProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();
  // Get active index from URL searchParams
  const activePropertyId = searchParams.get('propertyId') ? Number(searchParams.get('propertyId')) : null;
  const activeIndex = activePropertyId && properties.length > 0
    ? properties.findIndex((p) => p.propertyId === activePropertyId)
    : -1;

  const activePropertySelected = activeIndex !== -1;
  const totalPages = properties.length;
  const initialPage = activePropertySelected ? activeIndex + 1 : 0;

  const [localPage, setLocalPage] = useState<number>(initialPage);

  // Keep localPage in sync with URL changes when not transitioning
  useEffect(() => {
    if (!isPending) {
      const timer = setTimeout(() => {
        setLocalPage(initialPage);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPage, isPending]);

  // Silently prefetch adjacent, first, and last property pages
  useEffect(() => {
    if (properties.length === 0 || localPage === 0) return;

    const prefetchUrl = (index: number) => {
      const p = properties[index];
      if (!p) return;
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('propertyId', String(p.propertyId));
      newParams.set('propertyNo', p.propertyNo);
      const rawPart = p.partitionNo;
      newParams.set('partitionNo', rawPart && rawPart.trim() !== '' && rawPart !== '0' ? rawPart : '0');
      newParams.delete('pageNumber');
      router.prefetch(`${pathname}?${newParams.toString()}`);
    };

    // Prefetch first property
    prefetchUrl(0);

    // Prefetch adjacent (previous and next) properties
    if (localPage > 1) {
      prefetchUrl(localPage - 2);
    }
    if (localPage < totalPages) {
      prefetchUrl(localPage);
    }

    // Prefetch last property
    if (totalPages > 1) {
      prefetchUrl(totalPages - 1);
    }
  }, [localPage, properties, totalPages, pathname, searchParams, router]);

  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setLocalPage(page);

    const targetProperty = properties[page - 1];
    if (targetProperty) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('propertyId', String(targetProperty.propertyId));
      newParams.set('propertyNo', targetProperty.propertyNo);
      const rawPart = targetProperty.partitionNo;
      newParams.set('partitionNo', rawPart && rawPart.trim() !== '' && rawPart !== '0' ? rawPart : '0');
      newParams.delete('pageNumber');
      newParams.delete('valuationTab');

      startTransition(() => {
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      });
    }
  };

  return (
    <PtisNavigationContext.Provider
      value={{
        isPending,
        currentPage: localPage,
        totalPages,
        properties,
        navigateToPage,
      }}
    >
      {children}
    </PtisNavigationContext.Provider>
  );
}
