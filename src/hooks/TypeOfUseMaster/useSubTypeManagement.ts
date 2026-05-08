import { useState, useMemo } from 'react';
import type { UseSubType, UseGroup } from '@/types/typeOfUse.types';

function getGroupApiId(g: UseGroup): string {
  return String(g.typeOfUseGroupId);
}

interface UseSubTypeManagementParams {
  subTypes: UseSubType[];
  subTotalCount: number;
  subTotalPages: number;
  pageNumber: number;
  pageSize: number;
  urlQ: string;
  selectedTypeId: string;
  selectedGroupId: number;
  allGroups: UseGroup[];
  pushUrl: (params: {
    groupId?: string;
    typeId?: string;
    pn?: number;
    ps?: number;
    q?: string;
  }) => void;
}

export function useSubTypeManagement({
  subTypes,
  subTotalCount,
  subTotalPages,
  pageNumber,
  pageSize,
  urlQ,
  selectedTypeId,
  selectedGroupId,
  allGroups,
  pushUrl,
}: UseSubTypeManagementParams) {
  const [subTypeSearch, setSubTypeSearch] = useState(urlQ);
  const [subLoading] = useState(false);
  const [loadingAll] = useState(false);

  const searchActive = subTypeSearch.trim().length > 0;

  const subPageSize = pageSize;
  const subPageNumber = pageNumber;

  const effectivePageNumber = subPageNumber;
  const effectiveTotalCount = subTotalCount;
  const effectiveTotalPages = subTotalPages;

  const subTypeTableRows = useMemo(() => {
    return (subTypes ?? []).map((s, idx) => ({
      ...s,
      srNo: (subPageNumber - 1) * subPageSize + idx + 1,
    }));
  }, [subTypes, subPageNumber, subPageSize]);

  const changeSubPage = (p: number) => {
    const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

    pushUrl({
      groupId: currentGroupApiId,
      typeId: selectedTypeId,
      pn: p,
      ps: subPageSize,
      q: searchActive ? subTypeSearch : "",
    });
  };

  const changeSubPageSize = (size: number) => {
    const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

    pushUrl({
      groupId: currentGroupApiId,
      typeId: selectedTypeId,
      pn: 1,
      ps: size,
      q: searchActive ? subTypeSearch : "",
    });
  };

  const onSearchChange = (val: string) => {
    const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

    setSubTypeSearch(val);

    pushUrl({
      groupId: currentGroupApiId,
      typeId: selectedTypeId,
      pn: 1,
      ps: subPageSize,
      q: val.trim() || "",
    });
  };

  return {
    subTypeSearch,
    searchActive,
    subLoading,
    loadingAll,
    subPageSize,
    subPageNumber,
    effectivePageNumber,
    effectiveTotalCount,
    effectiveTotalPages,
    subTypeTableRows,
    changeSubPage,
    changeSubPageSize,
    onSearchChange,
  };
}
