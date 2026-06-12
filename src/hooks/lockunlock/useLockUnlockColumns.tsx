import { Lock, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Column } from "@/components/common/MasterTable";
import { Badge, EditButton, ToggleSwitch } from "@/components/common";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/lockunlock.types";
import { cn } from "@/lib/utils/cn";

interface UseLockUnlockColumnsParams {
  screens: LockedScreen[];
  selectedPropertyIds: number[];
  properties: LockUnlockPropertyItem[];
  isPending: boolean;
  onSelectProperty: (propertyId: number) => void;
  onSelectAllProperties: () => void;
  onToggleLock: (row: LockUnlockPropertyItem) => void;
  onManageLocks: (row: LockUnlockPropertyItem) => void;
}

export function useLockUnlockColumns({
  screens,
  selectedPropertyIds,
  properties,
  isPending,
  onSelectProperty,
  onSelectAllProperties,
  onToggleLock,
  onManageLocks,
}: UseLockUnlockColumnsParams): Column<LockUnlockPropertyItem>[] {
  const t = useTranslations("lockUnlock");

  return [
    {
      key: "checkbox",
      label: (
        <input
          type="checkbox"
          checked={properties.length > 0 && selectedPropertyIds.length === properties.length}
          onChange={() => onSelectAllProperties()}
          aria-label="Select all properties"
          className="ml-2"
        />
      ),
      width: "5%",
      align: "center",
      render: (_: unknown, row: LockUnlockPropertyItem) => (
        <input
          type="checkbox"
          checked={selectedPropertyIds.includes(row.propertyId)}
          onChange={() => onSelectProperty(row.propertyId)}
          aria-label={`Select property ${row.propertyNo}`}
          className="ml-2"
        />
      ),
    },
    {
      key: "wardNo",
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.wardNo")}</span>,
      width: "12%",
      align: "center",
      render: (val: unknown) => <span className="text-gray-700 px-2">{String(val)}</span>,
    },
    {
      key: "propertyNo",
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.propertyNo")}</span>,
      width: "15%",
      align: "center",
      render: (val: unknown) => <span className="font-bold text-gray-900 px-2">{String(val)}</span>,
    },
    {
      key: "partitionNo",
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.partitionNo")}</span>,
      width: "13%",
      align: "center",
      render: (val: unknown) => <span className="text-gray-700 px-2">{String(val ?? "-")}</span>,
    },
    {
      key: "lockedScreens",
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.screenNames")}</span>,
      width: "20%",
      align: "center",
      render: (val: unknown) => {
        const rawItems = (val as (number | LockedScreen)[]) || [];
        if (rawItems.length === 0) {
          return <span className="text-slate-400 px-2 text-xs">{t("resultsTable.status.none")}</span>;
        }
        // Handle mixed array of LockedScreen objects or raw IDs
        const names = rawItems.map((item: number | LockedScreen) => {
          if (item && typeof item === "object") {
            return (item as LockedScreen).screenName;
          }
          // It's a raw ID — look it up from the screens list
          const match = screens.find((s) => s.id === Number(item));
          return match ? match.screenName : `Screen ID: ${item}`;
        });
        return (
          <div className="flex flex-wrap gap-1 px-2 justify-center w-full">
            {names.map((name, idx) => (
              <Badge
                key={idx}
                variant="success"
                size="sm"
              >
                {name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: "isLocked",
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.status")}</span>,
      width: "16%",
      align: "center",
      render: (val: unknown) => {
        const isLocked = Boolean(val);
        return (
          <div className="flex items-center justify-center w-full">
            <Badge
                 className={cn(
    "inline-flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all duration-300",
    isLocked
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                 )}
            >
               <span className="inline-flex items-center gap-1 whitespace-nowrap">
                 {isLocked ? (
                    <>
                     <Lock className="w-3 h-3 shrink-0 text-red-500" />
                      <span>{t("resultsTable.status.locked")}</span>
                    </>
                     ) : (
                      <>
                       <Unlock className="w-3 h-3 shrink-0 text-emerald-500" />
                       <span>{t("resultsTable.status.unlocked")}</span>
                      </>
                   )}
               </span>
          </Badge>
          </div>             
        );
      },
    },
    {
      key: "lockUnlockAction",
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.lockUnlock")}</span>,
      width: "12%",
      align: "center",
      render: (_: unknown, row: LockUnlockPropertyItem) => (
        <div className="flex items-center justify-center w-full">
          <ToggleSwitch
            checked={row.isLocked}
            onChange={() => onToggleLock(row)}
            activeLabel={t("resultsTable.status.locked")}
            inactiveLabel={t("resultsTable.status.unlocked")}
            showPopup={false}
            disabled={!selectedPropertyIds.includes(row.propertyId) || isPending}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: <span className="font-semibold px-2 text-xs text-[#1E3A8A]">{t("resultsTable.columns.actions")}</span>,
      width: "10%",
      align: "center",
      render: (_: unknown, row: LockUnlockPropertyItem) => (
        <div className="flex items-center justify-center w-full">
          <EditButton
            size="xs"
            onClick={() => onManageLocks(row)}
            className="h-8 border border-slate-300 font-semibold bg-white text-slate-700 hover:bg-slate-50"
          />
        </div>
      ),
    },
  ];
}