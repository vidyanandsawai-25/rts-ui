import { useState, useTransition } from "react";
import { Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button, ToggleSwitch } from "@/components/common";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/loackunlock.types";
import { fetchLockUnlockPropertiesPagedAction, bulkLockUnlockPropertiesAction } from "@/app/[locale]/property-tax/lockunlock/action";
import { cn } from "@/lib/utils/cn";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export interface UseLockUnlockMasterProps {
  wardIdFromUrl: string;
  screens: LockedScreen[];
  dropdownProperties: { label: string; value: string }[];
}

function getScreenIds(screensList: (number | LockedScreen)[]): number[] {
  return (screensList || [])
    .map((item: number | LockedScreen) => {
      if (item && typeof item === "object") {
        return Number((item as LockedScreen).id ?? 0);
      }
      return Number(item);
    })
    .filter((id) => id > 0);
}

export function useLockUnlockMaster({
  wardIdFromUrl,
  screens = [],
  dropdownProperties = [],
}: UseLockUnlockMasterProps) {
  const { confirm } = useConfirm();
  const t = useTranslations("lockUnlock");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState({
    wardId: wardIdFromUrl || "",
    fromProperty: "",
    toProperty: "",
  });

  // Selected Screen IDs
  const [selectedScreenIds, setSelectedScreenIds] = useState<number[]>([]);

  // Results State
  const [showResults, setShowResults] = useState(false);
  const [properties, setProperties] = useState<LockUnlockPropertyItem[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  // Individual Property Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    property: LockUnlockPropertyItem | null;
    selectedScreenIds: number[];
  }>({
    isOpen: false,
    property: null,
    selectedScreenIds: [],
  });

  const propertyOptions = dropdownProperties;

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "wardId") {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("wardId", value);
      } else {
        params.delete("wardId");
      }
      setFormData((prev) => ({ ...prev, fromProperty: "", toProperty: "" }));
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleClearAll = () => {
    setFormData({
      wardId: "",
      fromProperty: "",
      toProperty: "",
    });
    setSelectedScreenIds([]);
    setShowResults(false);
    setProperties([]);
    setSelectedPropertyIds([]);
    toast.info(t("messages.clearedFilters"));
  };

  const handleShow = () => {
    if (!formData.wardId || !formData.fromProperty || !formData.toProperty) {
      toast.error(t("messages.validationError"));
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetchLockUnlockPropertiesPagedAction({
          WardId: Number(formData.wardId),
          FromPropertyNo: formData.fromProperty.split("-")[0],
          ToPropertyNo: formData.toProperty.split("-")[0],
          PageNumber: 1,
          PageSize: -1, // Fetch all in range
        });

        if (response && response.items) {
          setProperties(response.items);
          setSelectedPropertyIds([]);
          setShowResults(true);
          toast.success(t("messages.fetchSuccess"));
        } else {
          setProperties([]);
          setShowResults(true);
          toast.info(t("messages.fetchNoResults"));
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t("messages.fetchFailed"));
      }
    });
  };

  const handleSelectProperty = (propertyId: number) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const handleSelectAllProperties = () => {
    if (selectedPropertyIds.length === properties.length) {
      setSelectedPropertyIds([]);
    } else {
      setSelectedPropertyIds(properties.map((p) => p.propertyId));
    }
  };

  const handleToggleLock = (row: LockUnlockPropertyItem) => {
    const willLock = !row.isLocked;

    if (willLock && selectedScreenIds.length === 0) {
      toast.error(t("messages.screenRequired"));
      return;
    }

    const title = willLock ? t("messages.lockConfirmTitle") : t("messages.unlockConfirmTitle");
    const description = willLock
      ? t("messages.lockConfirmDescription", { propertyNo: row.propertyNo })
      : t("messages.unlockConfirmDescription", { propertyNo: row.propertyNo });

    confirm({
      variant: willLock ? "warning" : "info",
      title,
      description,
      confirmText: willLock ? t("messages.lockButtonText") : t("messages.unlockButtonText"),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            const screenIds = getScreenIds(willLock ? selectedScreenIds : row.lockedScreens);
            const response = await bulkLockUnlockPropertiesAction({
              propertyIds: [Number(row.propertyId)],
              screenIds,
              action: willLock ? "lock" : "unlock",
            });

            if (response.success) {
              toast.success(
                response.message ||
                  t("messages.propertySuccess", {
                    action: willLock
                      ? t("resultsTable.status.locked").toLowerCase()
                      : t("resultsTable.status.unlocked").toLowerCase()
                  })
              );
              handleShow();
            } else {
              toast.error(response.error || t("messages.operationFailed"));
            }
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("messages.unexpectedError"));
          }
        });
      },
    });
  };

  const handleManageLocks = (row: LockUnlockPropertyItem) => {
    setEditModal({
      isOpen: true,
      property: row,
      selectedScreenIds: getScreenIds(row.lockedScreens),
    });
  };

  const handleSaveIndividualLock = async () => {
    if (!editModal.property) return;

    const propertyId = Number(editModal.property.propertyId);
    const initialLocked = getScreenIds(editModal.property.lockedScreens);
    const currentLocked = getScreenIds(editModal.selectedScreenIds);

    const screensToLock = currentLocked.filter((id) => !initialLocked.includes(id));
    const screensToUnlock = initialLocked.filter((id) => !currentLocked.includes(id));

    startTransition(async () => {
      try {
        let lockSuccess = true;
        let unlockSuccess = true;

        if (screensToLock.length > 0) {
          const res = await bulkLockUnlockPropertiesAction({
            propertyIds: [propertyId],
            screenIds: screensToLock,
            action: "lock",
          });
          lockSuccess = res.success;
        }

        if (screensToUnlock.length > 0) {
          const res = await bulkLockUnlockPropertiesAction({
            propertyIds: [propertyId],
            screenIds: screensToUnlock,
            action: "unlock",
          });
          unlockSuccess = res.success;
        }

        if (lockSuccess && unlockSuccess) {
          toast.success(t("messages.saveSuccess"));
          setEditModal({ isOpen: false, property: null, selectedScreenIds: [] });
          handleShow();
        } else {
          toast.error(t("messages.savePartialFailed"));
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t("messages.saveFailed"));
      }
    });
  };

  const handleBulkAction = (action: "lock" | "unlock") => {
    if (selectedPropertyIds.length === 0) {
      toast.error(t("messages.selectPropertyRequired"));
      return;
    }
    if (selectedScreenIds.length === 0) {
      toast.error(t("messages.selectScreenRequired"));
      return;
    }

    const title = action === "lock" ? t("messages.bulkLockTitle") : t("messages.bulkUnlockTitle");
    const description = t("messages.bulkConfirmDescription", {
      action: action === "lock" ? t("messages.lockButtonText").toLowerCase() : t("messages.unlockButtonText").toLowerCase(),
      screenCount: selectedScreenIds.length,
      propertyCount: selectedPropertyIds.length,
    });

    confirm({
      variant: action === "lock" ? "warning" : "info",
      title,
      description,
      confirmText: action === "lock" ? t("messages.lockButtonText") : t("messages.unlockButtonText"),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            const response = await bulkLockUnlockPropertiesAction({
              propertyIds: selectedPropertyIds.map(Number),
              screenIds: selectedScreenIds.map(Number),
              action,
            });

            if (response.success) {
              toast.success(response.message || t("messages.bulkSuccess"));
              handleShow();
              setSelectedPropertyIds([]);
            } else {
              toast.error(response.error || t("messages.bulkFailed"));
            }
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("messages.unexpectedError"));
          }
        });
      },
    });
  };

  const columns = [
    {
      key: "checkbox" as const,
      label: (
        <input
          type="checkbox"
          checked={properties.length > 0 && selectedPropertyIds.length === properties.length}
          onChange={handleSelectAllProperties}
          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 ml-2 cursor-pointer"
        />
      ),
      width: "5%",
      align: "center" as const,
      render: (_: unknown, row: LockUnlockPropertyItem) => (
        <input
          type="checkbox"
          checked={selectedPropertyIds.includes(row.propertyId)}
          onChange={() => handleSelectProperty(row.propertyId)}
          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 ml-2 cursor-pointer"
        />
      ),
    },
    {
      key: "wardNo" as const,
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.wardNo")}</span>,
      width: "12%",
      align: "center" as const,
      render: (val: unknown) => <span className="text-gray-700 px-2">{String(val)}</span>,
    },
    {
      key: "propertyNo" as const,
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.propertyNo")}</span>,
      width: "15%",
      align: "center" as const,
      render: (val: unknown) => <span className="font-bold text-gray-900 px-2">{String(val)}</span>,
    },
    {
      key: "partitionNo" as const,
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.partitionNo")}</span>,
      width: "13%",
      align: "center" as const,
      render: (val: unknown) => <span className="text-gray-700 px-2">{String(val ?? "-")}</span>,
    },
    {
      key: "lockedScreens" as const,
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.screenNames")}</span>,
      width: "20%",
      align: "center" as const,
      render: (val: unknown) => {
        const lockedItems = (val as number[]) || [];
        if (lockedItems.length === 0) {
          return <span className="text-slate-400 px-2 text-xs">{t("resultsTable.status.none")}</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 px-2 justify-center w-full">
            {lockedItems.map((item: number, idx: number) => {
              let name = "";
              let key = idx;

              const match = screens.find((s) => s.id === Number(item));
              name = match ? match.screenName : `ID: ${item}`;
              key = item;

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                >
                  {name}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: "isLocked" as const,
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.status")}</span>,
      width: "13%",
      align: "center" as const,
      render: (val: unknown) => {
        const isLocked = Boolean(val);
        return (
          <div className="flex items-center justify-center w-full">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all duration-300",
                isLocked
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}
            >
              {isLocked ? (
                <>
                  <Lock className="w-3 h-3 text-red-500" />
                  <span>{t("resultsTable.status.locked")}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-emerald-500" />
                  <span>{t("resultsTable.status.unlocked")}</span>
                </>
              )}
            </span>
          </div>
        );
      },
    },
    {
      key: "lockUnlockAction" as const,
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.lockUnlock")}</span>,
      width: "12%",
      align: "center" as const,
      render: (_: unknown, row: LockUnlockPropertyItem) => (
        <div className="flex items-center justify-center w-full">
          <ToggleSwitch
            checked={row.isLocked}
            onChange={() => handleToggleLock(row)}
            activeLabel={t("resultsTable.status.locked")}
            inactiveLabel={t("resultsTable.status.unlocked")}
            showPopup={false}
            disabled={!selectedPropertyIds.includes(row.propertyId) || isPending}
          />
        </div>
      ),
    },
    {
      key: "actions" as const,
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.actions")}</span>,
      width: "10%",
      align: "center" as const,
      render: (_: unknown, row: LockUnlockPropertyItem) => (
        <div className="flex items-center justify-center w-full">
          <Button
            variant="secondary"
            size="xs"
            onClick={() => handleManageLocks(row)}
            className="h-8 border border-slate-300 font-semibold bg-white text-slate-700 hover:bg-slate-50"
          >
            {t("resultsTable.actions.manage")}
          </Button>
        </div>
      ),
    },
  ];

  return {
    formData,
    setFormData,
    selectedScreenIds,
    setSelectedScreenIds,
    showResults,
    setShowResults,
    properties,
    setProperties,
    selectedPropertyIds,
    setSelectedPropertyIds,
    editModal,
    setEditModal,
    isPending,
    propertyOptions,
    handleSelectChange,
    handleClearAll,
    handleShow,
    handleSelectProperty,
    handleSelectAllProperties,
    handleToggleLock,
    handleManageLocks,
    handleSaveIndividualLock,
    handleBulkAction,
    columns,
  };
}
