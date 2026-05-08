/**
 * Custom hook for Type pagination handlers in Type of Use Master
 * Handles page and page size changes for the Types section
 */

import { useCallback } from "react";
import type { UseGroup } from "@/types/typeOfUse.types";
import { getGroupApiId } from "@/components/modules/property-tax/typeofusemaster/typeOfUseMasterUtils";

interface UseTypePaginationHandlersProps {
  allGroups: UseGroup[];
  selectedGroupId: string | number | null;
  typePageSize: number;
  pushUrl: (params: Record<string, string | number>) => void;
}

/**
 * Hook to manage type pagination handlers
 * Provides stable callback functions for page and page size changes
 */
export function useTypePaginationHandlers({
  allGroups,
  selectedGroupId,
  typePageSize,
  pushUrl,
}: UseTypePaginationHandlersProps) {
  const handleTypePageChange = useCallback(
    (page: number) => {
      const currentGroup = allGroups.find(
        (g) => g.typeOfUseGroupId === selectedGroupId
      );
      const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";
      pushUrl({
        groupId: currentGroupApiId,
        typePn: page,
        typePs: typePageSize,
      });
    },
    [allGroups, selectedGroupId, typePageSize, pushUrl]
  );

  const handleTypePageSizeChange = useCallback(
    (size: number) => {
      const currentGroup = allGroups.find(
        (g) => g.typeOfUseGroupId === selectedGroupId
      );
      const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";
      pushUrl({
        groupId: currentGroupApiId,
        typePn: 1,
        typePs: size,
      });
    },
    [allGroups, selectedGroupId, pushUrl]
  );

  return {
    handleTypePageChange,
    handleTypePageSizeChange,
  };
}
