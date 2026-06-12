'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Layers } from 'lucide-react';
import type { SocialAttributeProps } from '@/types/social-attribute.types';
import { PageContainer } from '@/components/common';
import TableHeader from '@/components/common/TableHeader';
import { useSocialAttributeList } from '@/hooks/social-attribute-master/useSocialAttributeList';
import { AttributeFilterBar } from './components/AttributeFilterBar';
import { ParentRow, ChildRow } from './components/AttributeRow';

interface ExtendedSocialAttributeProps extends SocialAttributeProps {
  dataTypeFilter?: string;
  attributeTypeFilter?: string;
  currentSearchTerm?: string;
}

export function SocialAttributeMaster({
  data,
  dataTypeFilter: dataTypeFilterProp,
  attributeTypeFilter: attributeTypeFilterProp,
  currentSearchTerm,
}: ExtendedSocialAttributeProps): React.ReactElement {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('socialAttribute');
  const [, startTransition] = React.useTransition();

  const {
    searchQueryState,
    dataTypeFilter,
    attributeFilter,
    hasActiveFilters,
    handleSearchChange,
    handleDataTypeChange,
    handleAttributeFilterChange,
    handleResetFilters,
    handleEdit,
    handleDelete,
    parentItems,
  } = useSocialAttributeList({
    data,
    dataTypeFilterProp,
    attributeTypeFilterProp,
    currentSearchTerm,
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        <TableHeader
          title={t('list.title')}
          subtitle={t('list.subtitle')}
          icon={Layers}
          actionLabel={t('list.buttons.add')}
          onActionClick={() =>
            startTransition(() =>
              router.push(`/${locale}/property-tax/social-attribute-master/add`)
            )
          }
        />

        <AttributeFilterBar
          searchValue={searchQueryState}
          dataTypeValue={dataTypeFilter}
          attributeValue={attributeFilter}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={handleSearchChange}
          onDataTypeChange={handleDataTypeChange}
          onAttributeChange={handleAttributeFilterChange}
          onReset={handleResetFilters}
        />

        {/* Flat attribute tree */}
        <div className="space-y-6 min-h-70 max-w-[100rem] mx-auto">
          {parentItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-medium">
              {t('list.filters.noResults')}
            </div>
          ) : (
            parentItems.map(({ parent, children }) => (
              <div key={parent.id} className="space-y-6">
                <ParentRow item={parent} onEdit={handleEdit} onDelete={handleDelete} />

                {children.length > 0 && (
                  <div className="pl-6 md:pl-10 max-w-[85rem] mx-auto space-y-3 relative before:absolute before:left-3 before:top-0 before:bottom-6 before:w-[2px] before:bg-blue-100">
                    {children.map((child) => (
                      <ChildRow
                        key={child.id}
                        item={child}
                        parentCode={parent.socialAttributeCode}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
