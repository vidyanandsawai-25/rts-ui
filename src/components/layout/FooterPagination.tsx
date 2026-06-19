'use client';

import React from 'react';
import { Tooltip } from '@/components/common/Tooltip';
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PrevPageButton,
} from '@/components/common/ActionButtons';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FooterPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  leftContent?: React.ReactNode;
  isPropertyPagination?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  isPropertySelected?: boolean;
}

export const FooterPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  leftContent,
  isPropertyPagination = false,
  isLoading = false,
  disabled = false,
  isPropertySelected = true,
}: FooterPaginationProps) => {
  const t = useTranslations('ptis');

  const firstTooltip = isPropertyPagination ? t('buttons.firstProperty') : t('buttons.firstPage');
  const prevTooltip = isPropertyPagination ? t('buttons.previousProperty') : t('buttons.previousPage');
  const nextTooltip = isPropertyPagination ? t('buttons.nextProperty') : t('buttons.nextPage');
  const lastTooltip = isPropertyPagination ? t('buttons.lastProperty') : t('buttons.lastPage');

  const displayCurrent = currentPage === 0 ? '-' : currentPage;
  const middleText = isPropertyPagination
    ? t('table.property', { current: displayCurrent, total: totalPages })
    : t('table.page', { current: displayCurrent, total: totalPages });

  const handleDisabledClick = () => {
    toast.error(t('error.selectPropertyFirst') || 'Please select a property first.');
  };

  return (
    <nav 
      aria-label={t('pagination.label')} 
      className="flex flex-col sm:flex-row items-center justify-center sm:justify-between md:justify-start gap-2.5 sm:gap-3 w-full md:w-auto shrink-0"
    >
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-sm" role="group" aria-label={t('pagination.controls')}>
        <Tooltip content={firstTooltip} placement="top">
          <FirstPageButton
            onClick={isPropertySelected ? () => onPageChange?.(1) : handleDisabledClick}
            disabled={isPropertySelected ? (disabled || currentPage <= 1 || !onPageChange) : false}
            className={`hidden sm:flex w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer ${!isPropertySelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={firstTooltip}
          />
        </Tooltip>
        <Tooltip content={prevTooltip} placement="top">
          <PrevPageButton
            onClick={isPropertySelected ? () => onPageChange?.(currentPage - 1) : handleDisabledClick}
            disabled={isPropertySelected ? (disabled || currentPage <= 1 || !onPageChange) : false}
            className={`w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer ${!isPropertySelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={prevTooltip}
          />
        </Tooltip>
        
        <div 
          className="px-2 flex sm:px-2.5 items-center justify-center min-w-[110px] sm:min-w-[130px] select-none h-7"
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
              <span className="sr-only">{t('loading.rendering')}</span>
            </>
          ) : (
            <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 tracking-tight whitespace-nowrap">
              {middleText}
            </span>
          )}
        </div>

        <Tooltip content={nextTooltip} placement="top">
          <NextPageButton
            onClick={isPropertySelected ? () => onPageChange?.(currentPage + 1) : handleDisabledClick}
            disabled={isPropertySelected ? (disabled || currentPage === 0 || currentPage === totalPages || !onPageChange) : false}
            className={`w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer ${!isPropertySelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={nextTooltip}
          />
        </Tooltip>
        <Tooltip content={lastTooltip} placement="top">
          <LastPageButton
            onClick={isPropertySelected ? () => onPageChange?.(totalPages) : handleDisabledClick}
            disabled={isPropertySelected ? (disabled || currentPage === 0 || currentPage === totalPages || !onPageChange) : false}
            className={`hidden sm:flex w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer ${!isPropertySelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={lastTooltip}
          />
        </Tooltip>
      </div>

      {leftContent && (
        <div className="flex items-center gap-2 sm:gap-3 pl-0 sm:pl-3 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-2.5 sm:pt-0 ml-0 sm:ml-2">
          {leftContent}
        </div>
      )}
    </nav>
  );
};
