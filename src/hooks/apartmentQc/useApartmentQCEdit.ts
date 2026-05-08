import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Floor } from "@/types/floor.types";
import { ConstructionType } from "@/types/construction.types";
import { UseSubType, UseType } from "@/types/typeOfUse.types";

export type FloorDataRow = {
  id: string;
  floorId: string;
  conYear: string;
  asstYear: string;
  constructionTypeId: string;
  typeOfUseId: string;
  subTypeOfUseId: string;
  area: string;
  rentMY: string;
  rateMY: string;
  rentalValue: string;
  depreciation: string;
  alv: string;
  mr: string;
  rv: string;
  [key: string]: unknown;
};

interface UseApartmentQCEditProps {
  floors: Floor[];
  constructionTypes: ConstructionType[];
  useTypes: UseType[];
  allSubTypes: UseSubType[];
}

export const useApartmentQCEdit = ({
  floors,
  constructionTypes,
  useTypes,
  allSubTypes,
}: UseApartmentQCEditProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const triggeredLoadsRef = useRef<Set<string>>(new Set());

  // URL status
  const floorsLoaded = searchParams.get("loadFloors") === "true";
  const conTypesLoaded = searchParams.get("loadConTypes") === "true";
  const useTypesLoaded = searchParams.get("loadUseTypes") === "true";
  const subTypesLoaded = searchParams.get("loadSubTypes") === "true";

  const updateUrlParam = useCallback((paramName: string) => {
    if (triggeredLoadsRef.current.has(paramName)) return;
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(paramName) === "true") return;
    triggeredLoadsRef.current.add(paramName);
    params.set(paramName, "true");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handleFloorDropdownClick = useCallback(() => {
    if (floors.length === 0) updateUrlParam("loadFloors");
  }, [floors.length, updateUrlParam]);

  const handleConTypeDropdownClick = useCallback(() => {
    if (constructionTypes.length === 0) updateUrlParam("loadConTypes");
  }, [constructionTypes.length, updateUrlParam]);

  const handleUseTypeDropdownClick = useCallback(() => {
    if (useTypes.length === 0) {
      const params = new URLSearchParams(searchParams.toString());
      let needsUpdate = false;
      if (params.get("loadUseTypes") !== "true" && !triggeredLoadsRef.current.has("loadUseTypes")) {
        params.set("loadUseTypes", "true");
        triggeredLoadsRef.current.add("loadUseTypes");
        needsUpdate = true;
      }
      if (params.get("loadSubTypes") !== "true" && !triggeredLoadsRef.current.has("loadSubTypes")) {
        params.set("loadSubTypes", "true");
        triggeredLoadsRef.current.add("loadSubTypes");
        needsUpdate = true;
      }
      if (needsUpdate) router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [useTypes.length, searchParams, pathname, router]);

  const [floorData, setFloorData] = useState<FloorDataRow[]>([
    { id: "row-1", floorId: "", conYear: "2020", asstYear: "2024-25", constructionTypeId: "", typeOfUseId: "", subTypeOfUseId: "", area: "1020", rentMY: "", rateMY: "", rentalValue: "", depreciation: "", alv: "", mr: "", rv: "" },
    { id: "row-2", floorId: "", conYear: "2020", asstYear: "2024-25", constructionTypeId: "", typeOfUseId: "", subTypeOfUseId: "", area: "850", rentMY: "", rateMY: "", rentalValue: "", depreciation: "", alv: "", mr: "", rv: "" },
  ]);

  const updateRow = useCallback((id: string, field: keyof FloorDataRow, value: string) => {
    setFloorData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [field]: value };
        if (field === "typeOfUseId") next.subTypeOfUseId = "";
        return next;
      })
    );
  }, []);

  const floorOptions = useMemo(() => floors.map((f) => ({ value: String(f.floorId), label: f.description || f.floorCode })), [floors]);
  const conTypeOptions = useMemo(() => constructionTypes.map((c) => ({ value: String(c.constructionTypeId), label: c.description || c.constructionCode })), [constructionTypes]);
  const useTypeOptions = useMemo(() => useTypes.map((u) => ({ value: String(u.typeOfUseId), label: u.description || u.typeOfUseCode })), [useTypes]);

  const getSubTypeOptions = useCallback((typeOfUseId: string) =>
    typeOfUseId
      ? allSubTypes.filter((s) => String(s.typeOfUseId) === typeOfUseId).map((s) => ({ value: String(s.subTypeOfUseId), label: s.description }))
      : [], [allSubTypes]);

  return {
    floorData,
    updateRow,
    floorOptions,
    conTypeOptions,
    useTypeOptions,
    getSubTypeOptions,
    handleFloorDropdownClick,
    handleConTypeDropdownClick,
    handleUseTypeDropdownClick,
    loadingStates: {
      floors: floorsLoaded && floors.length === 0,
      conTypes: conTypesLoaded && constructionTypes.length === 0,
      useTypes: useTypesLoaded && useTypes.length === 0,
      subTypes: subTypesLoaded && allSubTypes.length === 0,
    }
  };
};
