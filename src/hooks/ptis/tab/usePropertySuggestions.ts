import { useState, useEffect } from 'react';
import type { PropertyListItem } from '@/types/ptis.types';
import { ptisSuggestionsClient } from '@/lib/api/ptis/tab/ptis-suggestions-client';

export function usePropertySuggestions(
  wardId: number | null | undefined,
  debouncedSearchText: string,
  draftPropertyId: string | null | undefined,
  initialProperties: PropertyListItem[] = []
) {
  const [propertiesList, setPropertiesList] = useState<PropertyListItem[]>([]);
  const [isSearchingProperties, setIsSearchingProperties] = useState(false);

  useEffect(() => {
    if (!wardId || !debouncedSearchText) {
      const timer = setTimeout(() => {
        setPropertiesList((prev) => {
          const selectedPropId = draftPropertyId ? Number(draftPropertyId) : null;
          const currentSelected = prev.find((p) => p.propertyId === selectedPropId);
          
          const merged = [...initialProperties];
          if (currentSelected && !merged.some((p) => p.propertyId === currentSelected.propertyId)) {
            merged.unshift(currentSelected);
          }
          return merged;
        });
      }, 0);
      return () => clearTimeout(timer);
    }

    let active = true;
    const timer = setTimeout(() => {
      setIsSearchingProperties(true);
    }, 0);

    let propNo = debouncedSearchText;
    let partNo = '';
    if (debouncedSearchText.includes('-')) {
      const parts = debouncedSearchText.split('-');
      propNo = parts[0];
      partNo = parts.slice(1).join('-');
    }

    ptisSuggestionsClient.getSuggestions({
      wardId,
      propertyNo: propNo,
      partitionNo: partNo,
    })
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) {
          setPropertiesList((prev) => {
            const selectedPropId = draftPropertyId ? Number(draftPropertyId) : null;
            const currentSelected = prev.find((p) => p.propertyId === selectedPropId);

            // Merge initialProperties + API suggestions and de-duplicate by propertyId
            const merged = [...initialProperties, ...res.data!];
            const unique = merged.filter((item, index, self) =>
              self.findIndex((p) => p.propertyId === item.propertyId) === index
            );

            if (currentSelected && !unique.some((p) => p.propertyId === currentSelected.propertyId)) {
              unique.unshift(currentSelected);
            }
            return unique;
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setIsSearchingProperties(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [debouncedSearchText, wardId, draftPropertyId, initialProperties]);

  return {
    propertiesList,
    setPropertiesList,
    isSearchingProperties,
  };
}
