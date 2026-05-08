import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { WardItem } from "@/types/wardMaster.types";
import { useConfirm } from "@/components/common";
import { handleWardDelete, handleWardEdit } from "@/components/modules/property-tax/zone-master/wards/wardHandlers";
import { getWardColumns } from "@/components/modules/property-tax/zone-master/wards/wardColumns";

interface UseWardListHandlersProps {
  selectedZoneId: number | null;
  searchTerm: string;
  onWardsChanged?: () => void;
  pageNumber: number;
  pageSize: number;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export function useWardListHandlers({
  selectedZoneId,
  searchTerm,
  onWardsChanged,
  pageNumber,
  pageSize,
  t,
}: UseWardListHandlersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const prevSearchTermRef = useRef(searchTerm);

  // Sync search from URL when it changes (non-cascading)
  useEffect(() => {
    if (prevSearchTermRef.current !== searchTerm) {
      prevSearchTermRef.current = searchTerm;
      setLocalSearch(searchTerm);
    }
  }, [searchTerm]);

  // Debounced search
  useEffect(() => {
    if (selectedZoneId === null || localSearch === searchTerm) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("wardPage", "1");

      if (localSearch) {
        params.set("wardQ", localSearch);
      } else {
        params.delete("wardQ");
      }

      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, searchTerm, selectedZoneId, router, pathname, searchParams]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
  }, []);

  const refreshData = useCallback(() => {
    if (onWardsChanged) onWardsChanged();
    router.refresh();
  }, [onWardsChanged, router]);

  const { confirm } = useConfirm();

  const handleDelete = useCallback((row: WardItem) => {
    handleWardDelete({
      row,
      confirm,
      refreshData,
      t: (key: string, values?: Record<string, unknown>) => t(key, values)
    });
  }, [t, confirm, refreshData]);

  const handleEdit = useCallback(
    (row: WardItem) => {
      handleWardEdit({
        row,
        searchParams,
        selectedZoneId,
        pathname,
        router
      });
    },
    [searchParams, selectedZoneId, pathname, router]
  );

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("wardPage", String(page));
    params.set("wardPageSize", String(pageSize));

    if (searchTerm) {
      params.set("wardQ", searchTerm);
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pageSize, searchTerm, router, pathname]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("wardPageSize", String(newSize));
    params.set("wardPage", "1");

    if (searchTerm) {
      params.set("wardQ", searchTerm);
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, searchTerm, router, pathname]);

  const columns = useMemo(
    () =>
      getWardColumns({
        t,
        pageNumber,
        pageSize,
      }),
    [t, pageNumber, pageSize]
  );

  return {
    localSearch,
    handleSearchChange,
    handleDelete,
    handleEdit,
    handlePageChange,
    handlePageSizeChange,
    columns,
  };
}
