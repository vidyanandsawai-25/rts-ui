'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CommonPropertyTable from './CommonPropertyTable';
import TaxDetailsTable from './TaxDetailsTable';
import { ApartmentQCDetail } from '@/types/apartmentQC.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AmenitiesRow = Record<string, any>;

interface AmenitiesProps {
  data: ApartmentQCDetail[];
  // pageNumber: number;
  // pageSize: number;
  // totalCount: number;
  // totalPages: number;
}

const Amenities = ({ data }: AmenitiesProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('subTab') || 'rateable';

  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const toggleAutoScroll = () => {
    setIsAutoScrolling((prev) => !prev);
  };

  const handleRowClick = useCallback(
    (row: AmenitiesRow) => {
      // Navigate to amenities edit page with property ID
      const propertyId = row.propertyNo || row.propertyId;
      router.push(`/property-tax/appartmentQC/amenities/edit/${propertyId}`);
    },
    [router]
  );

  // Define columns based on active tab
  const columns = useMemo(() => {
    const baseColumns = [
      { key: 'propertyNo', label: 'Property No' },
      { key: 'floor', label: 'Floor' },
      { key: 'assessmentYear', label: 'Asst Year' },
      { key: 'constructionYear', label: 'Con Year' },
      { key: 'typeOfUse', label: 'Use' },
      { key: 'carpetArea', label: 'Carpet A (sqFt/sqMtr)' },
      { key: 'builtupArea', label: 'Buildup A (sqFt/sqMtr)' },
      { key: 'oldConstArea', label: 'Old Con A' },
      { key: 'oldRV', label: 'Old RV' },
    ];

    // Add CV/RV columns based on active tab
    if (activeTab === 'capital') {
      baseColumns.push({ key: 'cv', label: 'CV' });
    } else if (activeTab === 'dual-method') {
      // For dual-method, show both CV and New RV
      baseColumns.push({ key: 'cv', label: 'CV' });
      baseColumns.push({ key: 'newRV', label: 'New RV' });
    } else {
      // Default rateable tab
      baseColumns.push({ key: 'newRV', label: 'New RV' });
    }

    baseColumns.push({ key: 'totalTax', label: 'Total Tax' });
    return baseColumns;
  }, [activeTab]);

  // Convert data to the format expected by CommonPropertyTable
  const convertedData: AmenitiesRow[] = useMemo(() => {
    return data.map((item) => ({
      propertyNo: item.propertyNo,
      floor: item.floor,
      assessmentYear: item.assessmentYear,
      constructionYear: item.constructionYear,
      typeOfUse: item.typeOfUse,
      carpetArea: `${item.carpetASqFt} / ${item.carpetASqMtr}`,
      builtupArea: `${item.builtupASqFt} / ${item.builtupASqMtr}`,
      oldConstArea: item.oldConstArea || '-',
      oldRV: item.oldRV || '-',
      newRV: item.newTaxTotalRV || '-',
      cv: item.newTaxTotalCV || '-',
      totalTax: item.newTaxTotal,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <CommonPropertyTable
        columns={columns}
        data={convertedData}
        title="Property Tax Amenities"
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRowClick={handleRowClick}
        isAutoScrolling={isAutoScrolling}
        onToggleAutoScroll={toggleAutoScroll}
        // pageNumber={pageNumber}
        // pageSize={pageSize}
        // totalCount={totalCount}
        // totalPages={totalPages}
      />
      <TaxDetailsTable />
    </div>
  );
};

export default Amenities;
