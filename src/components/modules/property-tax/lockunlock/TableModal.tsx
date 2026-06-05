import React from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Checkbox, Button } from "@/components/common";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/loackunlock.types";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

interface TableModalProps {
  editModal: {
    isOpen: boolean;
    property: LockUnlockPropertyItem | null;
    selectedScreenIds: number[];
  };
  setEditModal: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    property: LockUnlockPropertyItem | null;
    selectedScreenIds: number[];
  }>>;
  screens: LockedScreen[];
  handleSaveIndividualLock: () => Promise<void> | void;
  isPending: boolean;
}
export function TableModal({
  editModal,
  setEditModal,
  screens = [],
  handleSaveIndividualLock,
  isPending,
}: TableModalProps) {
  const t = useTranslations("lockUnlock");
  if (!editModal.isOpen || !editModal.property) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={() => setEditModal({ isOpen: false, property: null, selectedScreenIds: [] })}
      />
      <Card className="relative w-[480px] max-w-full rounded-xl shadow-2xl border border-slate-200 bg-white overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 animate-out fade-out zoom-out-95">
        <div className="h-1 w-full bg-blue-600" />
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base font-bold text-slate-800">
              {t("manageModal.title", {
                propertyNo: `${editModal.property.propertyNo}${
                  editModal.property.partitionNo ? ` - ${editModal.property.partitionNo}` : ""
                }`
              })}
            </CardTitle>
          </div>
          <button
            type="button"
            onClick={() => setEditModal({ isOpen: false, property: null, selectedScreenIds: [] })}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            aria-label={t("manageModal.cancel")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </CardHeader>
        <CardContent className="p-6 flex-1 space-y-4">
          <p className="text-xs text-slate-500">
            {t("manageModal.description")}
          </p>
          <div className="space-y-3 pt-2">
            {screens.map((screen) => {
              const isChecked = editModal.selectedScreenIds.includes(screen.id);
              return (
                <label
                  key={screen.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50/50 transition-colors",
                    isChecked ? "border-red-200 bg-red-50/10" : "border-slate-200 bg-white"
                  )}
                >
                  <Checkbox
                    id={`modal-screen-${screen.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      setEditModal((prev) => ({
                        ...prev,
                        selectedScreenIds: checked
                          ? [...prev.selectedScreenIds, screen.id]
                          : prev.selectedScreenIds.filter((id) => id !== screen.id),
                      }));
                    }}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-800 block">
                      {screen.screenName}
                    </span>
                  </div>
                  {isChecked && <Lock className="w-4 h-4 text-red-500 mr-1" />}
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditModal({ isOpen: false, property: null, selectedScreenIds: [] })}
            >
              {t("manageModal.cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveIndividualLock}
              isLoading={isPending}
            >
              {t("manageModal.saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
