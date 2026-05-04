import { useSearchParams } from 'next/navigation';
import { toPositiveInt, normalizePartition } from '@/lib/utils/format';

export function useSyncedSearchParams() {
  const searchParams = useSearchParams();

  const wardNo = searchParams.get('wardNo') || '';
  const propertyNo = searchParams.get('propertyNo') || '';
  const partitionNo = normalizePartition(searchParams.get('partitionNo'));
  const wardId = toPositiveInt(searchParams.get('wardId')) || null;

  const propertyIdRaw = searchParams.get('propertyId');
  const propertyId = propertyIdRaw && propertyIdRaw.trim() ? propertyIdRaw : null;

  return {
    wardNo,
    propertyNo,
    partitionNo,
    wardId,
    propertyId,
  };
}
