import { getTranslations } from 'next-intl/server';
import { Building, Building2, School, Hospital } from 'lucide-react';
import { Card } from '@/components/common';
import { mapAssetToRow } from '@/components/modules/assets/municipal-Asset/asset-register/registerMappers';
import type { AssetRegisterViewProps } from '@/types/asset/asset-register/municipal-asset-register.types';
import type { AssetRegisterApiRecord } from '@/types/asset/asset-register/municipal-asset-service.types';
import { AssetRegisterBackButton } from './AssetRegisterBackButton';
import { AssetRegisterControls } from './AssetRegisterControls';
import { AssetRegisterHeaderSummary } from './AssetRegisterHeaderSummary';
import { AssetRegisterTable } from './AssetRegisterTable';

function getAssetTypeIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes('commercial') || lower.includes('shop') || lower.includes('market') || lower.includes('business')) {
    return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (lower.includes('school') || lower.includes('education') || lower.includes('college') || lower.includes('university') || lower.includes('institute')) {
    return <School className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('medical') || lower.includes('health') || lower.includes('dispensary')) {
    return <Hospital className="w-3.5 h-3.5 text-blue-600" />;
  }
  return <Building className="w-3.5 h-3.5 text-blue-600" />;
}

export async function AssetRegisterView({
  locale,
  categoryId,
  categoryName,
  safeSearch,
  safeSearchField,
  AssetNo,
  AssetTypeId,
  ZoneId,
  WardId,
  DepartmentId,
  safePageSize,
  finalPage,
  totalPages,
  assetsResult,
  typesResult,
  zonesResult,
  wardsResult,
  departmentsResult,
  updatedDate,
  categoryOptions = [],
  sortBy,
  sortOrder,
}: AssetRegisterViewProps) {
  let t: (key: string) => string;
  try {
    const translations = await getTranslations({ locale, namespace: 'assetRegister' });
    t = (key: string) => translations(key);
  } catch {
    t = (key: string) => {
      const fallback: Record<string, string> = {
        MUNICIPAL_CORPORATION_ASSET_REGISTER: 'MUNICIPAL CORPORATION ASSET REGISTER',
        All_Asset_Types: 'All Asset Types',
        All_Zones: 'All Zones',
        All_Wards: 'All Wards',
        All_Departments: 'All Departments',
        All_Asset_Categories: 'All Asset Categories',
        Asset_Register: 'Asset Register',
        Register_of: 'Register of',
        Private_municipal_asset_register: 'Private municipal asset register',
      };
      return fallback[key] || key;
    };
  }

  const mappedAssets = assetsResult.items.map((item: AssetRegisterApiRecord) =>
    mapAssetToRow(item, categoryName || 'Asset Register')
  );

  const assetTypeOptions = [
    { label: t('All_Asset_Types'), value: 'all' },
    ...typesResult.map((type) => ({
      value: String(type.id),
      label: type.label,
    })),
  ];

  const zoneOptions = [
    { label: t('All_Zones'), value: 'all' },
    ...zonesResult.map((zone) => ({ label: zone.label, value: String(zone.id) })),
  ];

  const wardOptions = [
    { label: t('All_Wards'), value: 'all' },
    ...wardsResult
      .filter((ward) => ZoneId === 'all' || ward.zoneId == null || String(ward.zoneId) === ZoneId)
      .map((ward) => ({ label: ward.label, value: String(ward.id) })),
  ];

  const owningDepartmentOptions = [
    { label: t('All_Departments'), value: 'all' },
    ...departmentsResult.map((dept) => ({ label: dept.label, value: String(dept.id) })),
  ];

  const mappedCategoryOptions = categoryOptions.length > 0 ? [
    { label: t('All_Asset_Categories'), value: 'all' },
    ...categoryOptions.map((cat) => ({ label: cat.label, value: String(cat.id) })),
  ] : [];

  const resolvedCategoryName = categoryName || t('Asset_Register');
  const registerSubtitle = categoryName
    ? `${t('Register_of')} ${resolvedCategoryName}`
    : t('Private_municipal_asset_register');

  return (
    <div className="mx-auto flex w-full max-w-437.5 flex-col gap-2.5">
      <Card variant="bordered" padding="none" className="overflow-hidden border-2 border-gray-800 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg !rounded-none">
        <div className="relative border-b-2 border-gray-800 p-4 pb-3 mb-2 text-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <AssetRegisterBackButton />
          </div>
          <div className="min-w-0 flex flex-col items-center">
            <h1 className="truncate text-lg font-bold leading-tight text-slate-900 uppercase">
              {t('MUNICIPAL_CORPORATION_ASSET_REGISTER')}
            </h1>
            <p className="truncate text-sm font-semibold text-blue-600 mt-0.5 flex items-center gap-1.5 justify-center">
              {getAssetTypeIcon(resolvedCategoryName)}
              <span>{resolvedCategoryName}</span>
            </p>
          </div>
        </div>

        <AssetRegisterHeaderSummary
          registerSubtitle={registerSubtitle}
          updatedDate={updatedDate}
          totalCount={assetsResult.totalCount}
          totalPurchaseValue={assetsResult.totalPurchaseValue ?? 0}
          totalMarketValue={assetsResult.totalMarketValue ?? 0}
          totalDepreciation={assetsResult.totalDepreciation ?? 0}
          netBookValue={assetsResult.netBookValue ?? 0}
          totalCapitalValue={assetsResult.totalCapitalValue ?? 0}
          activeAssetsCount={assetsResult.activeAssetsCount ?? 0}
          translate={t}
        />
      </Card>

      <AssetRegisterTable
        assets={mappedAssets}
        totalCount={assetsResult.totalCount}
        pageNumber={finalPage}
        pageSize={safePageSize}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        controls={
          <AssetRegisterControls
            categoryId={categoryId}
            categoryName={resolvedCategoryName}
            search={safeSearch}
            searchField={safeSearchField}
            AssetNo={AssetNo}
            AssetTypeId={AssetTypeId}
            ZoneId={ZoneId}
            WardId={WardId}
            DepartmentId={DepartmentId}
            sortBy={sortBy}
            sortOrder={sortOrder}
            assetTypeOptions={assetTypeOptions}
            zoneOptions={zoneOptions}
            wardOptions={wardOptions}
            owningDepartmentOptions={owningDepartmentOptions}
            categoryOptions={mappedCategoryOptions}
          />
        }
      />
    </div>
  );
}
