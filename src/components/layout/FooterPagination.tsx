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

interface FooterPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  leftContent?: React.ReactNode;
}

export const FooterPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  leftContent,
}: FooterPaginationProps) => {
  const t = useTranslations('ptis');

  return (
    <nav 
      aria-label={t('pagination.label')} 
      className="flex flex-col sm:flex-row items-center justify-center sm:justify-between md:justify-start gap-2.5 sm:gap-3 w-full md:w-auto shrink-0"
    >
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-sm" role="group" aria-label={t('pagination.controls')}>
        <Tooltip content={t('buttons.firstPage')} placement="top">
          <FirstPageButton
            onClick={() => onPageChange?.(1)}
            disabled={currentPage === 1 || !onPageChange}
            className="hidden sm:flex w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer"
            aria-label={t('buttons.firstPage')}
          />
        </Tooltip>
        <Tooltip content={t('buttons.previousPage')} placement="top">
          <PrevPageButton
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1 || !onPageChange}
            className="w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer"
            aria-label={t('buttons.previousPage')}
          />
        </Tooltip>
        
        <div 
          className="px-2 flex sm:px-2.5 items-center justify-center min-w-[36px] sm:min-w-[40px] select-none"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 tracking-tight">
            {t('table.page', {
              current: currentPage,
              total: totalPages
            })}
          </span>
        </div>

        <Tooltip content={t('buttons.nextPage')} placement="top">
          <NextPageButton
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages || !onPageChange}
            className="w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer"
            aria-label={t('buttons.nextPage')}
          />
        </Tooltip>
        <Tooltip content={t('buttons.lastPage')} placement="top">
          <LastPageButton
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage === totalPages || !onPageChange}
            className="hidden sm:flex w-7 h-7 !p-0 !min-w-0 bg-transparent border-none hover:bg-white hover:shadow-sm cursor-pointer"
            aria-label={t('buttons.lastPage')}
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
