'use client';

import { useTransition, Fragment } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FooterAction } from '@/lib/api/footer.service';
import { FooterPagination } from './FooterPagination';
import { UtilityActions, RightActions } from './FooterActionButtons';
import { useFooterActions } from '@/hooks/layout/useFooterActions';
import type { PropertyListItem } from '@/types/ptis.types';
import type { PropertyWorkflowStage } from '@/types/propertyWorkflowStage.types';
import { useOptionalPtisNavigation } from '@/components/modules/property-tax/ptis/shared/PtisNavigationContext';
import { useFooterActionHandler } from '@/hooks/layout/useFooterActionHandler';

interface BottomActionBarProps {
  actions?: FooterAction[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onAction?: (command: string) => void;
  isLoading?: boolean;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  properties?: PropertyListItem[];
  categoryId?: number;
  societyDetailId?: number;
  isCombined?: boolean;
  workflowStages?: PropertyWorkflowStage[];
  currentWorkflowStageId?: number;
}

export function BottomActionBar({
  actions = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onAction,
  isLoading = false,
  leftContent,
  centerContent,
  rightContent,
  properties = [],
  categoryId,
  societyDetailId,
  isCombined = false,
  workflowStages = [],
  currentWorkflowStageId,
}: BottomActionBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startPaginationTransition] = useTransition();

  const ptisNav = useOptionalPtisNavigation();
  const { handleActionClick, isPending: isActionPending, clickedCommand } = useFooterActionHandler(
    onAction,
    categoryId,
    societyDetailId
  );

  const groupedActions = useFooterActions(actions);

  // Check if properties array is present
  const hasProperties = properties.length > 0;

  // Resolve pagination state either from our optimized context or fallback parameters
  let resolvedCurrentPage = currentPage;
  let resolvedTotalPages = totalPages;
  let handlePageChange = onPageChange;
  let isPaginationPending = false;

  if (ptisNav) {
    resolvedCurrentPage = ptisNav.currentPage;
    resolvedTotalPages = ptisNav.totalPages;
    handlePageChange = ptisNav.navigateToPage;
    isPaginationPending = ptisNav.isPending;
  } else {
    // Fallback standard pagination logic
    const activePropertyId = searchParams.get('propertyId') ? Number(searchParams.get('propertyId')) : null;
    const activeIndex = activePropertyId && hasProperties
      ? properties.findIndex((p) => p.propertyId === activePropertyId)
      : -1;

    resolvedCurrentPage = hasProperties
      ? (activeIndex !== -1 ? activeIndex + 1 : 0)
      : currentPage;
    resolvedTotalPages = hasProperties ? properties.length : totalPages;

    handlePageChange = onPageChange || ((page: number) => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (hasProperties) {
        const targetProperty = properties[page - 1];
        if (targetProperty) {
          newParams.set('propertyId', String(targetProperty.propertyId));
          newParams.set('propertyNo', targetProperty.propertyNo);
          const rawPart = targetProperty.partitionNo;
          newParams.set('partitionNo', rawPart && rawPart.trim() !== '' && rawPart !== '0' ? rawPart : '0');
          // Reset table pageNumber as we are switching properties
          newParams.delete('pageNumber');
          newParams.delete('valuationTab');
        }
      } else {
        newParams.set('pageNumber', String(page));
      }
      startPaginationTransition(() => {
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      });
    });
  }

  const isPaginationDisabled = hasProperties && resolvedCurrentPage === 0;
  const isPropertySelected = !!searchParams.get('propertyId');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[50] h-auto min-h-[48px] md:h-14 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-8px_40px_rgb(0,0,0,0.06)] print:hidden transition-all duration-300 layout-content-shifted flex flex-col md:flex-row items-stretch md:items-center justify-between px-3 sm:px-6 py-2 md:py-0">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

      <div className="w-full max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4">
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 md:gap-3 shrink-0">
          <FooterPagination
            currentPage={resolvedCurrentPage}
            totalPages={resolvedTotalPages}
            onPageChange={handlePageChange}
            leftContent={leftContent}
            isPropertyPagination={hasProperties}
            isLoading={isPaginationPending || isLoading}
            disabled={isPaginationDisabled}
            isPropertySelected={isPropertySelected}
          />
        </div>

        <div className="w-full md:flex-1 flex items-center justify-between md:justify-end gap-2 md:gap-4 min-w-0">
          <div className="relative flex-1 min-w-0 flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />
            <div className="flex-1 flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar px-2 min-w-0">
              <UtilityActions
                actions={groupedActions.utility}
                onActionClick={handleActionClick}
                isLoading={isLoading}
                isCombined={isCombined}
                workflowStages={workflowStages}
                currentWorkflowStageId={currentWorkflowStageId}
              />
              {centerContent && <Fragment key="center-content-wrapper">{centerContent}</Fragment>}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-2 border-l border-slate-100 md:border-l-0 md:pl-0">
            <RightActions
              actions={groupedActions.right}
              onActionClick={handleActionClick}
              isLoading={isLoading}
              isActionPending={isActionPending}
              clickedCommand={clickedCommand}
              iconOnly={true}
            />
            {rightContent && <Fragment key="right-content-wrapper">{rightContent}</Fragment>}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}