"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { ApartmentQCDetail } from '@/types/apartmentQC.types';
import { QCTable, getDualColumns } from '../../shared';

interface AmenitiesDualProps {
  data: ApartmentQCDetail[];
  loading?: boolean;
  error?: string | null;
}

const AmenitiesDual: React.FC<AmenitiesDualProps> = ({
  data,
  loading = false,
  error = null,
}) => {
  const t = useTranslations('ptis.apartmentTabs');
  const columns = getDualColumns(t);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <QCTable 
        data={data} 
        columns={columns} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default AmenitiesDual;
