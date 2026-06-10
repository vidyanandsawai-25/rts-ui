import type { Column } from '@/components/common/MasterTable';
import type { SocialAttribute } from '@/types/social-attribute.types';

/**
 * Returns the table column configuration for Social Attribute Master.
 */
export function getSocialAttributeColumns(t: (key: string) => string): Column<SocialAttribute>[] {
  return [
    {
      key: 'socialAttributeCode',
      label: t('list.table.socialAttributeCode'),
      width: '20%',
      render: (value) => (typeof value === 'string' ? value : ''),
    },
    {
      key: 'socialAttributeName',
      label: t('list.table.socialAttributeName'),
      width: '20%',
      render: (value) => (typeof value === 'string' ? value : ''),
    },
    {
      key: 'dataType',
      label: t('list.table.dataType'),
      width: '15%',
      render: (value) => (typeof value === 'string' ? value : ''),
    },
    {
      key: 'unit',
      label: t('list.table.unit'),
      width: '15%',
      render: (value) => (typeof value === 'string' ? value : '-'),
    },
    {
      key: 'displayOrder',
      label: t('list.table.displayOrder'),
      width: '10%',
      render: (value) => (typeof value === 'number' ? value : '-'),
    },
    {
      key: 'isActive',
      label: t('list.table.status'),
      width: '10%',
      isStatus: true,
    },
  ];
}
