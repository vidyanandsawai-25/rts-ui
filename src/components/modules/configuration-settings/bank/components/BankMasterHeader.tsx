'use client';

import { Landmark } from 'lucide-react';
import TableHeader from '@/components/common/TableHeader';
import { BankFilters } from '../BankFilters';

interface BankMasterHeaderProps {
  t: (key: string) => string;
  onAdd?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function BankMasterHeader({ t, onAdd, search, onSearchChange }: BankMasterHeaderProps) {
  return (
    <TableHeader
      title={t('title')}
      subtitle={t('subtitle')}
      icon={Landmark}
      actionLabel={onAdd ? t('addBank') : undefined}
      onActionClick={onAdd}
      rightContent={<BankFilters search={search} onSearchChange={onSearchChange} t={t} />}
    />
  );
}
