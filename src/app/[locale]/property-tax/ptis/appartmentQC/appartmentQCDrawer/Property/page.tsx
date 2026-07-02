import { fetchApartmentQCDetailsSafeAction, fetchAllPropertyTypesAction, fetchOldPropertyDataAction } from '@/app/[locale]/property-tax/ptis/appartmentQC/action';
import Propertybasicform from '@/components/modules/property-tax/ptis/appartmentQC/appartmentQCDrawer/Property-basic-info/Propertybasicform';

export default async function PropertyPage({
  searchParams
}: {
  searchParams: Promise<{
    propertyId?: string;
    editPropertyId?: string;
    wardId?: string;
    propertyNo?: string;
    oldPropertyNo?: string
  }>;
  params: Promise<{ locale: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const {
    propertyId: spPropertyId,
    editPropertyId,
    wardId,
    propertyNo,
    oldPropertyNo
  } = resolvedSearchParams;

  const actualPropertyId = editPropertyId || spPropertyId;

  let propertyData = null;
  if (actualPropertyId) {
    const res = await fetchApartmentQCDetailsSafeAction({ propertyId: actualPropertyId });
    propertyData = res[0] || null;
  } else if (wardId && propertyNo) {
    const res = await fetchApartmentQCDetailsSafeAction({ wardId, propertyNo });
    propertyData = res[0] || null;
  }

  let oldPropertyFetchResult = null;
  if (oldPropertyNo) {
    oldPropertyFetchResult = await fetchOldPropertyDataAction(oldPropertyNo);
  }

  const propertyTypesRes = await fetchAllPropertyTypesAction();
  const propertyTypes = propertyTypesRes.success && propertyTypesRes.data
    ? propertyTypesRes.data.map(item => ({
      id: parseInt(item.value, 10),
      code: item.value,
      propertyDescription: item.label
    }))
    : [];

  return (
    <>
      <Propertybasicform
        propertyData={propertyData}
        propertyTypes={propertyTypes}
        oldPropertyFetchResult={oldPropertyFetchResult}
      />
    </>
  );
}