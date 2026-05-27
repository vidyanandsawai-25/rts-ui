'use client';

import { Briefcase } from 'lucide-react';
import TableHeader from '@/components/common/TableHeader';
import { ModuleFilters } from './ModuleFilters';

interface ModuleMasterHeaderProps {
  t: (key: string) => string;
  onAdd?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function ModuleMasterHeader({ t, onAdd, search, onSearchChange }: ModuleMasterHeaderProps) {
  return (
    <TableHeader
      title={t('title')}
      subtitle={t('subtitle')}
      icon={Briefcase}
      actionLabel={onAdd ? t('addLabel') : undefined}
      onActionClick={onAdd}
      rightContent={<ModuleFilters search={search} onSearchChange={onSearchChange} t={t} />}
    />
  );
}
