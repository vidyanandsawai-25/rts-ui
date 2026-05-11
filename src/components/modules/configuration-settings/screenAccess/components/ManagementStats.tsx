'use client';

import React from 'react';
import { Card } from '@/components/common/Card';
import { Monitor, FolderTree, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ManagementStatsProps {
  totalScreens: number;
  totalGroups: number;
  activeScreens: number;
  inactiveScreens: number;
}

export const ManagementStats: React.FC<ManagementStatsProps> = ({
  totalScreens,
  totalGroups,
  activeScreens,
  inactiveScreens,
}) => {
  const t = useTranslations('screenAccess');

  const stats = [
    {
      label: t('stats.totalScreens'),
      value: totalScreens,
      icon: Monitor,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('stats.totalGroups'),
      value: totalGroups,
      icon: FolderTree,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: t('stats.activeScreens'),
      value: activeScreens,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: t('stats.inactiveScreens'),
      value: inactiveScreens,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="p-4 flex items-center gap-4 border-none shadow-sm bg-white hover:shadow-md transition-shadow"
        >
          <div className={`${stat.bgColor} p-3 rounded-xl`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
