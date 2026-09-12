import { useSearchParams } from 'next/navigation';
import { toPositiveInt, normalizePartition } from '@/lib/utils/format';

export function useSyncedSearchParams() {
  const searchParams = useSearchParams();

  const wardNo = searchParams.get('wardNo') || '';
  const rawPropertyNo = searchParams.get('propertyNo') || '';
  const propertyNo =
    wardNo && rawPropertyNo.startsWith(`${wardNo}-`)
      ? rawPropertyNo.slice(wardNo.length + 1)
      : rawPropertyNo;
  const partitionNo = normalizePartition(searchParams.get('partitionNo'));
  const wardId = toPositiveInt(searchParams.get('wardId')) || null;

  const propertyIdRaw = searchParams.get('propertyId');
  const propertyId = propertyIdRaw && propertyIdRaw.trim() ? propertyIdRaw : null;

  const societyDetailId = toPositiveInt(searchParams.get('societyDetailId')) || null;
  const societyId = toPositiveInt(searchParams.get('societyId')) || null;
  const wingId = toPositiveInt(searchParams.get('wingId')) || null;
  const wingDetailId = toPositiveInt(searchParams.get('wingDetailId')) || null;
  const wingName = searchParams.get('wingName') || null;

  return {
    wardNo,
    propertyNo,
    partitionNo,
    wardId,
    propertyId,
    societyDetailId,
    societyId,
    wingId,
    wingDetailId,
    wingName,
  };
}
