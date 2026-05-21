import { Button } from '@/components/common/ActionButton';
import { ValueDisplay } from './components/ValueDisplay';
import FieldShell from '@/components/common/FieldShell';
import { MasterTable, Column } from '@/components/common/MasterTable';
import type { OldFloorDetailsData, OldDetailsData, OldTaxesData } from '@/types/ptis.types';
import React from 'react';
import { useTranslations } from 'next-intl';
import { OldTaxDetailsTable } from './OldTaxDetailsTable';

export interface OldDetailsTabProps {
  showOldFloorInfo: boolean;
  setShowOldFloorInfo: (value: boolean) => void;
  showOldTaxInfo: boolean;
  setShowOldTaxInfo: (value: boolean) => void;
  oldFloorTableData: OldFloorDetailsData[];
  oldDetailsData?: OldDetailsData;
  oldTaxesData?: OldTaxesData | null;
}

const OldDetailsTab: React.FC<OldDetailsTabProps> = ({
  showOldFloorInfo,
  setShowOldFloorInfo,
  showOldTaxInfo,
  setShowOldTaxInfo,
  oldFloorTableData,
  oldDetailsData,
  oldTaxesData,
}) => {
  const t = useTranslations('ptis');

  // ✅ Check if we have data in oldDetailsData that should be shown in the table if table is empty
  const tableData = React.useMemo(() => {
    if (oldFloorTableData.length > 0) return oldFloorTableData;

    // Fallback to single row from oldDetailsData if available
    if (oldDetailsData?.oldConstructionYear || oldDetailsData?.oldCarpetAreaSqMeter) {
      return [
        {
          floor: '0',
          subFloor: '',
          assessmentYear: '',
          year: oldDetailsData.oldConstructionYear || '',
          constructionType: oldDetailsData.oldConstructionTypeId || '',
          typeOfUse: oldDetailsData.oldTypeOfUseId || '',
          subType: '',
          carpetArea: `${oldDetailsData.oldCarpetAreaSqFeet || 0} / ${oldDetailsData.oldCarpetAreaSqMeter || 0}`,
          builtupArea: `${oldDetailsData.oldBuiltupAreaSqFeet || 0} / ${oldDetailsData.oldBuiltupAreaSqMeter || 0}`,
        },
      ];
    }
    return [];
  }, [oldFloorTableData, oldDetailsData]);

  // ✅ SOLUTION: Define columns inside component to access handlers via closure
  const oldFloorColumns: Column<Record<string, unknown>>[] = [
    { key: 'floor', label: t('fields.floor') },
    { key: 'subFloor', label: t('fields.subFloor') },
    { key: 'assessmentYear', label: t('fields.assmtYear') },
    { key: 'year', label: t('fields.constYear') },
    { key: 'constructionType', label: t('fields.constType') },
    { key: 'typeOfUse', label: t('fields.typeOfUse') },
    { key: 'subType', label: t('fields.subType') },
    {
      key: 'carpetArea',
      label: t('fields.carpetAreaSqFtMtr'),
    },
    {
      key: 'builtupArea',
      label: t('fields.builtupAreaSqFtMtr'),
    },
  ];

  return (
    <div className="bg-white rounded p-0.5 shadow-inner">
      <div className="space-y-0.5">
        <div className="w-full">
          <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50 rounded p-0.5 shadow-sm">
            <div className="grid grid-cols-7 gap-x-0.5">
              <FieldShell id="oldZoneName" label={t('fields.oldZoneName')}>
                <ValueDisplay value={oldDetailsData?.oldZoneName || ''} />
              </FieldShell>

              <FieldShell id="oldWardNo" label={t('fields.oldWardNo')}>
                <ValueDisplay value={oldDetailsData?.oldWardNo || ''} />
              </FieldShell>

              <FieldShell id="oldPropertyNo" label={t('fields.oldPropertyNo')}>
                <ValueDisplay value={oldDetailsData?.oldPropertyNo || ''} />
              </FieldShell>

              <FieldShell id="oldPartitionNo" label={t('fields.oldPartitionNo')}>
                <ValueDisplay value={oldDetailsData?.oldPartitionNo || ''} />
              </FieldShell>

              <FieldShell id="oldEGovNo" label={t('fields.oldEGovNo')}>
                <ValueDisplay value={oldDetailsData?.oldEGovernanceNo || ''} />
              </FieldShell>

              <FieldShell id="oldPlotArea" label={t('fields.oldPlotAreaWithUnit')}>
                <ValueDisplay value={oldDetailsData?.oldPlotArea || ''} />
              </FieldShell>

              <FieldShell id="oldPlotNo" label={t('fields.oldPlotNo')}>
                <ValueDisplay value={oldDetailsData?.oldPlotNo || ''} />
              </FieldShell>
            </div>

            <div className="grid grid-cols-6 gap-x-0.5 mt-0.5">
              <FieldShell id="oldBuiltupArea" label={t('fields.oldBuiltupAreaWithUnit')}>
                <ValueDisplay value={oldDetailsData?.oldBuiltupAreaSqMeter || ''} />
              </FieldShell>

              <FieldShell id="oldRV" label={t('fields.oldRV')}>
                <ValueDisplay value={oldDetailsData?.oldRV || ''} />
              </FieldShell>

              <FieldShell id="oldALV" label={t('fields.oldALV')}>
                <ValueDisplay value={oldDetailsData?.oldALV || ''} />
              </FieldShell>

              <FieldShell id="oldPropTax" label={t('fields.oldPropTax')}>
                <ValueDisplay value={oldDetailsData?.oldPropertyTax || ''} />
              </FieldShell>

              <FieldShell id="oldTotalTax" label={t('fields.oldTotalTax')}>
                <ValueDisplay value={oldDetailsData?.oldTotalTax || ''} />
              </FieldShell>

              <div className="flex items-end gap-0.5">
                <Button
                  size="sm"
                  onClick={() => setShowOldFloorInfo(!showOldFloorInfo)}
                  className="h-5 min-h-[20px] max-h-[35px] px-1.5 mb-3 text-base bg-indigo-600 hover:bg-indigo-700 leading-none flex-1"
                >
                  {showOldFloorInfo ? t('actions.hideFloorDetails') : t('actions.showFloorDetails')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowOldTaxInfo(!showOldTaxInfo)}
                  className="h-5 min-h-[20px] max-h-[35px] px-1.5 mb-3 text-base bg-orange-600 hover:bg-orange-700 leading-none flex-1"
                >
                  {showOldTaxInfo ? t('actions.hideOldTax') : t('actions.showOldTax')}
                </Button>
              </div>
            </div>

            {/* Dynamic Tax Details Section */}
            <OldTaxDetailsTable oldTaxesData={oldTaxesData} showOldTaxInfo={showOldTaxInfo} />
          </div>
        </div>

        {showOldFloorInfo && (
          <div className="w-full">
            <div className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-teal-50 rounded p-0.5 shadow-md">
              <div className="rounded overflow-hidden shadow-sm">
                <MasterTable<Record<string, unknown>>
                  data={tableData as unknown as Record<string, unknown>[]}
                  columns={oldFloorColumns}
                  emptyText={t('fields.noFloorDetails')}
                  paginationConfig={{ enabled: false }}
                  maxBodyHeightClassName="max-h-[150px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OldDetailsTab;
