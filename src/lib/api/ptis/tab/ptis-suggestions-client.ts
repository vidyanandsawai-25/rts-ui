import type { PropertyListItem } from '@/types/ptis.types';

interface SuggestionPayloadItem {
  propertyId: number;
  propertyNo: string;
  partitionNo?: string;
  displayLabel?: string;
}

export const ptisSuggestionsClient = {
  async getSuggestions(params: {
    wardId: number;
    propertyNo?: string;
    partitionNo?: string;
  }): Promise<{ success: boolean; data?: PropertyListItem[]; error?: string }> {
    const searchParams = new URLSearchParams();
    searchParams.append('wardId', params.wardId.toString());
    if (params.propertyNo) searchParams.append('propertyNo', params.propertyNo);
    if (params.partitionNo) searchParams.append('partitionNo', params.partitionNo);

    try {
      const res = await fetch(`/api/ptis/suggestions?${searchParams.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        const suggestions: PropertyListItem[] = result.data.map((item: SuggestionPayloadItem) => ({
          propertyId: item.propertyId,
          propertyNo: item.propertyNo,
          partitionNo: item.partitionNo || '',
          upicId: '',
          ownerName: '',
          address: '',
          displayProperty: item.displayLabel || item.propertyNo,
        }));
        return { success: true, data: suggestions };
      }
      return { success: false, error: result.error || 'Failed to fetch suggestions' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { success: false, error: message };
    }
  }
};
