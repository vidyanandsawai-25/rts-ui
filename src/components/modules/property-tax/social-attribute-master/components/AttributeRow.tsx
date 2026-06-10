'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/common';
import type { SocialAttribute } from '@/types/social-attribute.types';

function getDataTypeBadgeVariant(dataType: string): 'success' | 'warning' | 'default' {
  if (dataType === 'BIT') return 'success';
  if (dataType === 'INTEGER' || dataType === 'INT') return 'warning';
  return 'default';
}

interface ActionButtonsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ActionButtons({ onEdit, onDelete }: ActionButtonsProps) {
  const t = useTranslations('socialAttribute');
  return (
    <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
      <button
        onClick={onEdit}
        className="border border-blue-600 text-blue-600 px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-50 transition-colors"
      >
        {t('list.buttons.edit')}
      </button>
      <button
        onClick={onDelete}
        className="border border-red-600 text-red-600 px-3 py-1 rounded-md text-xs font-semibold hover:bg-red-50 transition-colors"
      >
        {t('list.buttons.delete')}
      </button>
    </div>
  );
}

// ─── Parent Row ───────────────────────────────────────────────────────────────

interface ParentRowProps {
  item: SocialAttribute;
  onEdit: (item: SocialAttribute) => void;
  onDelete: (item: SocialAttribute) => void;
}

export function ParentRow({ item, onEdit, onDelete }: ParentRowProps) {
  const t = useTranslations('socialAttribute');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 gap-3 hover:bg-slate-50 transition-colors shadow-xs">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-slate-900 text-sm">{item.socialAttributeCode}</span>
          <span className="text-slate-400">|</span>
          <span className="font-bold text-slate-600 text-sm md:text-base">
            {item.socialAttributeName}
          </span>
          <Badge variant={getDataTypeBadgeVariant(item.dataType)} size="sm">
            {item.dataType}
          </Badge>
          <Badge variant={item.isActive ? 'success' : 'secondary'} size="sm">
            {item.isActive ? t('list.status.active') : t('list.status.inactive')}
          </Badge>
          {item.isDiscountApplicable && (
            <Badge variant="destructive" size="sm">
              {t('list.discount')}
            </Badge>
          )}
          {item.unit && (
            <Badge variant="secondary" size="sm">
              {item.unit}
            </Badge>
          )}
        </div>
        <span className="text-xs text-slate-400">{t('list.parentAttribute')}</span>
      </div>
      <ActionButtons
        onEdit={(e) => {
          e.stopPropagation();
          onEdit(item);
        }}
        onDelete={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
      />
    </div>
  );
}

// ─── Child Row ────────────────────────────────────────────────────────────────

interface ChildRowProps {
  item: SocialAttribute;
  parentCode: string;
  onEdit: (item: SocialAttribute) => void;
  onDelete: (item: SocialAttribute) => void;
}

export function ChildRow({ item, parentCode, onEdit, onDelete }: ChildRowProps) {
  const t = useTranslations('socialAttribute');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border-l-4 border-l-blue-500 border border-slate-200 gap-3 hover:bg-slate-50 transition-colors shadow-xs">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-blue-500 font-bold">{t('list.subAttributeIndicator')}</span>
          <span className="text-slate-900 text-sm">{item.socialAttributeCode}</span>
          <span className="text-slate-400">|</span>
          <span className="font-bold text-slate-600 text-sm md:text-base">
            {item.socialAttributeName}
          </span>
          <Badge variant={getDataTypeBadgeVariant(item.dataType)} size="sm">
            {item.dataType}
          </Badge>
          <Badge variant={item.isActive ? 'success' : 'secondary'} size="sm">
            {item.isActive ? t('list.status.active') : t('list.status.inactive')}
          </Badge>
          {item.isDiscountApplicable && (
            <Badge variant="destructive" size="sm">
              {t('list.discount')}
            </Badge>
          )}
          {item.unit && (
            <Badge variant="secondary" size="sm">
              {item.unit}
            </Badge>
          )}
        </div>
        <span className="text-xs text-slate-400 pl-6">
          {item.isRequiredWhenParentTrue
            ? t('list.parentInfoWithRequired', { code: parentCode })
            : t('list.parentInfo', { code: parentCode })}
        </span>
      </div>
      <ActionButtons
        onEdit={(e) => {
          e.stopPropagation();
          onEdit(item);
        }}
        onDelete={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
      />
    </div>
  );
}
