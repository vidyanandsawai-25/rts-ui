import { useTranslations } from 'next-intl';
import { SearchInput, Select, PrevPageButton, NextPageButton } from '@/components/common';
import { WardItem } from '@/types/wardMaster.types';
import { WardListItem } from './WardListItem';

interface ViewWardsProps {
  wards: WardItem[];
  checkedWards: Set<string>;
  onToggleWard: (wardNo: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  totalPages: number;
  pageSizeOptions: Array<{ label: string; value: string }>;
  getZoneLabel: (zoneId: number | undefined | null) => string | null;
  isWardAssigned: (ward: WardItem) => boolean;
}

export function ViewWards({
  wards,
  checkedWards,
  onToggleWard,
  searchTerm,
  onSearchChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalPages,
  pageSizeOptions,
}: ViewWardsProps) {
  const t = useTranslations('zoneMaster');

  return (
    <>
      <div className="px-4 py-2 bg-white/40 border-b border-blue-100/50">
        <SearchInput
          className="w-full rounded-sm border-gray-300 mb-0"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={t('wardList.searchPlaceholder')}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {wards.map((ward) => (
            <WardListItem
              key={ward.wardNo}
              wardNo={ward.wardNo}
              description={ward.description ?? undefined}
              checked={checkedWards.has(ward.wardNo)}
              onToggle={() => onToggleWard(ward.wardNo)}
              colorScheme="blue"
            />
        ))}
        {wards.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            {t('wardList.noWardsFound')}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center px-4 py-2 bg-white/40 border-t border-blue-100/50">
        <div className="flex items-center gap-2">
          <Select
            options={pageSizeOptions}
            value={String(pageSize)}
            onChange={(val) => onPageSizeChange(Number(val))}
            selectSize="sm"
            className="w-20"
          />
        </div>
        <div className="flex items-center gap-1">
          <PrevPageButton
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={t('pagination.previous')}
          />
          <span className="text-xs text-gray-600">
            {page} / {totalPages || 1}
          </span>
          <NextPageButton
            onClick={() => onPageChange(page + 1)}
            disabled={page >= (totalPages || 1)}
            aria-label={t('pagination.next')}
          />
        </div>
      </div>
    </>
  );
}
