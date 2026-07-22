import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMoujaSubZoneUrl } from "@/hooks/asset-masters/mouja-subzone/useMoujaSubZoneUrl";
import { MoujaSubZoneProps } from "@/types/asset-masters/mouja-subzone.types";
import { useDebounce } from "@/hooks/useDebounce";
import { useMoujaSubZoneHandlers } from "./useMoujaSubZoneHandlers";

export function useMoujaSubZoneMasterState({
  moujas,
  moujaPageNumber,
  subZonePageNumber,
  moujaPageSize,
  subZonePageSize,
  moujaTotalPages,
  subZoneTotalPages,
  selectedMoujaId,
  moujaSortBy,
  moujaSortOrder,
  subZoneSortBy,
  subZoneSortOrder,
}: MoujaSubZoneProps) {
  const sp = useSearchParams();
  const t = useTranslations("moujaSubzone");
  const tCommon = useTranslations("common");
  const [, startTransition] = useTransition();

  const { urlMoujaSearch, urlSubZoneSearch, pushUrl, replaceUrl } = useMoujaSubZoneUrl();

  useEffect(() => {
    if (selectedMoujaId && !sp.get("moujaId")) {
      replaceUrl({ moujaId: selectedMoujaId });
    }
  }, [selectedMoujaId, sp, replaceUrl]);

  const [moujaSearch, setMoujaSearch] = useState(urlMoujaSearch);
  const [subZoneSearch, setSubZoneSearch] = useState(urlSubZoneSearch);

  const debouncedMoujaSearch = useDebounce(moujaSearch, 300);
  const debouncedSubZoneSearch = useDebounce(subZoneSearch, 300);

  useEffect(() => {
    startTransition(() => {
      setMoujaSearch(urlMoujaSearch);
    });
  }, [urlMoujaSearch, startTransition]);

  useEffect(() => {
    startTransition(() => {
      setSubZoneSearch(urlSubZoneSearch);
    });
  }, [urlSubZoneSearch, startTransition]);

  useEffect(() => {
    let hasChanged = false;
    const nextParams: { moujaPn?: number; subZonePn?: number; moujaPs?: number; subZonePs?: number } = {};
    const allowed = [10, 20, 30, 40, 50];

    if (moujaPageSize && !allowed.includes(moujaPageSize)) {
      nextParams.moujaPs = allowed.reduce((prev, curr) =>
        Math.abs(curr - moujaPageSize) < Math.abs(prev - moujaPageSize) ? curr : prev
      );
      hasChanged = true;
    }
    if (subZonePageSize && !allowed.includes(subZonePageSize)) {
      nextParams.subZonePs = allowed.reduce((prev, curr) =>
        Math.abs(curr - subZonePageSize) < Math.abs(prev - subZonePageSize) ? curr : prev
      );
      hasChanged = true;
    }

    if (moujaPageNumber < 1) {
      nextParams.moujaPn = 1;
      hasChanged = true;
    } else if (moujaTotalPages > 0 && moujaPageNumber > moujaTotalPages) {
      nextParams.moujaPn = moujaTotalPages;
      hasChanged = true;
    }

    if (subZonePageNumber < 1) {
      nextParams.subZonePn = 1;
      hasChanged = true;
    } else if (subZoneTotalPages > 0 && subZonePageNumber > subZoneTotalPages) {
      nextParams.subZonePn = subZoneTotalPages;
      hasChanged = true;
    }

    if (hasChanged) {
      pushUrl(nextParams);
    }
  }, [moujaPageNumber, moujaTotalPages, subZonePageNumber, subZoneTotalPages, moujaPageSize, subZonePageSize, pushUrl]);

  useEffect(() => {
    if (debouncedMoujaSearch.trim() !== urlMoujaSearch.trim()) {
      startTransition(() => pushUrl({ moujaSearch: debouncedMoujaSearch.trim(), moujaPn: 1 }));
    }
  }, [debouncedMoujaSearch, urlMoujaSearch, pushUrl, startTransition]);

  useEffect(() => {
    if (debouncedSubZoneSearch.trim() !== urlSubZoneSearch.trim()) {
      startTransition(() => pushUrl({ subZoneSearch: debouncedSubZoneSearch.trim(), subZonePn: 1 }));
    }
  }, [debouncedSubZoneSearch, urlSubZoneSearch, pushUrl, startTransition]);

  const handlers = useMoujaSubZoneHandlers({
    pushUrl,
    startTransition,
    setSubZoneSearch,
    moujaSortBy,
    moujaSortOrder,
    subZoneSortBy,
    subZoneSortOrder,
    selectedMoujaId,
  });

  const selectedMouja = moujas.find((m) => String(m.id) === selectedMoujaId);

  return {
    t,
    tCommon,
    moujaSearch,
    subZoneSearch,
    selectedMouja,
    pushUrl,
    setMoujaSearch,
    setSubZoneSearch,
    ...handlers,
  };
}
