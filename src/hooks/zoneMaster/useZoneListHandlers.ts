import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ZoneItem } from "@/types/zoneMaster.types";
import { useConfirm } from "@/components/common";
import { handleZoneDelete } from "@/components/modules/property-tax/zone-master/zones/zoneHandlers";

interface UseZoneListHandlersProps {
  zones: ZoneItem[];
  t: (key: string, values?: Record<string, unknown>) => string;
}

export function useZoneListHandlers({ zones, t }: UseZoneListHandlersProps) {
  const { confirm } = useConfirm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleDeleteClick = useCallback((
    zoneId: number,
    zoneNo: string,
    description: string
  ) => {
    confirm({
      variant: "delete",
      title: t("zoneList.deleteTitle"),
      description: t("dialogs.deleteDescription", {
        name: description || zoneNo,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
      onConfirm: () =>
        handleZoneDelete({
          zoneId,
          zoneNo,
          description,
          zones,
          router,
          t: (key: string, values?: Record<string, unknown>) => t(key, values)
        }),
    });
  }, [confirm, zones, router, t]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("zonePage", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("zonePageSize", size.toString());
      params.set("zonePage", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchChange = useCallback((value: string, currentSearch: string) => {
    if (value !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("zonePage", "1");

      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    }
  }, [router, pathname, searchParams]);

  return {
    handleDeleteClick,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
  };
}
