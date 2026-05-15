'use server';

import { fetchApartmentQCDetailsPagedAction } from './appartmentQC/action';
import { PagedResponse, ApartmentQCDetail } from '@/types/apartmentQC.types';

const emptyPaged: PagedResponse<ApartmentQCDetail> = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

export async function getApartmentQCDataAction(
  wardId: number,
  propertyNo: string,
  appartmentTab: string = 'amenities',
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm: string = '',
  propertyId?: number
) {
  try {
    // We only fetch the active tab data to keep it efficient, 
    // but return the structure expected by the component.
    // Map appartmentTab to the code expected by the API
    let partType = '';
    if (appartmentTab === 'residential') partType = 'R';
    else if (appartmentTab === 'commercial') partType = 'C';
    else if (appartmentTab === 'amenities') partType = 'utilsub';

    const params = {
      wardId,
      propertyNo,
      pageNumber,
      pageSize,
      searchTerm,
      partType,
      propertyDetailsId: propertyId // passing propertyId as propertyDetailsId
    };

    const result = await fetchApartmentQCDetailsPagedAction(params);

    const data = result.success && result.data ? result.data : emptyPaged;

    return {
      amenities: appartmentTab === 'amenities' ? data : emptyPaged,
      commercial: appartmentTab === 'commercial' ? data : emptyPaged,
      residential: appartmentTab === 'residential' ? data : emptyPaged,
    };
  } catch (error) {
    console.error('[getApartmentQCDataAction] Error:', error);
    return {
      amenities: emptyPaged,
      commercial: emptyPaged,
      residential: emptyPaged,
    };
  }
}
