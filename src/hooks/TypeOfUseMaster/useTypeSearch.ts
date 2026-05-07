import { useState } from 'react';
import type { UseGroup } from '@/types/typeOfUse.types';

function getGroupApiId(g: UseGroup): string {
  return String(g.typeOfUseGroupId);
}

interface UseTypeSearchParams {
  typeSearchFromServer?: string;
  selectedGroupId: number;
  allGroups: UseGroup[];
  pushUrl: (params: {
    groupId?: string;
    typeSearch?: string;
    typeId?: string;
    pn?: number;
    typePn?: number;
  }) => void;
}

export function useTypeSearch({
  typeSearchFromServer,
  selectedGroupId,
  allGroups,
  pushUrl,
}: UseTypeSearchParams) {
  const [typeSearch, setTypeSearch] = useState(typeSearchFromServer ?? "");

  const onTypeSearchChange = (val: string) => {
    const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

    setTypeSearch(val);

    pushUrl({
      groupId: currentGroupApiId,
      typeSearch: val,
      typeId: undefined,
      pn: 1,
      typePn: 1,
    });
  };

  return {
    typeSearch,
    setTypeSearch,
    onTypeSearchChange,
  };
}
