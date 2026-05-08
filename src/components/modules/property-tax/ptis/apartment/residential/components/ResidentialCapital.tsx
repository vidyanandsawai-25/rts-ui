"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { ApartmentQCDetail } from '@/types/apartmentQC.types';
import { QCTable, getCapitalColumns } from '../../shared';

interface ResidentialCapitalProps {
  data: ApartmentQCDetail[];
  loading?: boolean;
  error?: string | null;
}

const ResidentialCapital: React.FC<ResidentialCapitalProps> = ({
  data,
  loading = false,
  error = null,
}) => {
  const t = useTranslations('ptis.apartmentTabs');
  const columns = getCapitalColumns(t);

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

export default ResidentialCapital;
