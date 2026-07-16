"use client";

import { Settings, Info } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { cn } from "@/lib/utils/cn";
import { Checkbox } from "@/components/common/checkbox";
import { Card } from "@/components/common/Card";
import { SaveButton, CancelButton } from "@/components/common/ActionButtons";
import { SearchInput } from "@/components/common/SearchInput";
import { CardPagination } from "@/components/common/CardList";
import { useConfigureRates } from "@/hooks/RVRateMaster/useConfigureRates";
import { GroupConfigurationCard } from "./GroupConfigurationCard";
import type { RateCategory } from "@/types/RVRateMaster";
import type { ITypeOfUseDetails } from "@/types/RVRateMaster";

interface ConfigureRatesDrawerProps {
  open: boolean;
  onClose: (savedAny: boolean) => void;
  isMatrixVisible?: boolean;
  currentCategories?: RateCategory[];
  onConfigureSelected?: (selectedTypes: ITypeOfUseDetails[]) => void;
}

export function ConfigureRatesDrawer({
  open,
  onClose,
  isMatrixVisible = false,
  currentCategories = [],
  onConfigureSelected,
}: ConfigureRatesDrawerProps) {
  const {
    allUseTypes,
    paginatedUseTypes,
    totalCount,
    totalPages,
    isListLoading,
    existingGroups,
    isLoading,
    checkedIds,
    groupForms,
    savedAny,
    searchTerm,
    setSearchTerm,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    handleCheckboxChange,
    handleSelectExistingGroup,
    handleToggleMode,
    handleFieldChange,
    handleSaveGroup,
    handleConfigureClick,
  } = useConfigureRates({
    open,
    isMatrixVisible,
    currentCategories,
    onConfigureSelected,
    onClose,
  });

  const safePageNumber = Math.min(pageNumber, Math.max(1, totalPages));

  return (
    <div className="open-plot-config-drawer-wrapper">
      {open && (
        <style dangerouslySetInnerHTML={{
          __html: `
          .open-plot-config-drawer-wrapper div.fixed.inset-0 {
            z-index: 200 !important;
          }
          .open-plot-config-drawer-wrapper div.drawer-instance {
            z-index: 210 !important;
          }
        `}} />
      )}
      <Drawer
        open={open}
        onClose={() => onClose(savedAny)}
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
              <Settings size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-900">
                Configure Open Plot Rates
              </div>
              <div className="text-xs text-slate-500">
                Configure and map use groups for different types of use
              </div>
            </div>
          </div>
        }
        width="xl"
        footer={
          <div className="flex gap-3">
            <SaveButton
              label="Configure"
              size="md"
              onClick={handleConfigureClick}
              className="cursor-pointer"
            />
            <CancelButton
              label="Close"
              size="md"
              onClick={() => onClose(savedAny)}
              className="cursor-pointer"
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-3" />
            <p className="text-sm">Loading types of use details...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] divide-x divide-slate-200">
            {/* LEFT SIDE: List of TypeOfUse */}
            <div className="md:w-1/3 p-4 flex flex-col h-full bg-white border-r border-slate-200">
              <div className="flex items-center justify-between border-b pb-2 mb-3 flex-shrink-0">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                  <Info size={16} className="text-blue-500" />
                  Select Types of Use
                </h2>
                <SearchInput
                  className="mb-0 w-44"
                  value={searchTerm}
                  onChange={(val) => {
                    setSearchTerm(val);
                    setPageNumber(1);
                  }}
                  placeholder="Search..."
                />
              </div>

              <div className={cn("flex-1 overflow-y-auto pr-1 space-y-2 mb-3 transition-opacity duration-200", isListLoading && "opacity-50")}>
                {paginatedUseTypes.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No types of use found
                  </div>
                ) : (
                  paginatedUseTypes.map((tu) => {
                    const isChecked = !!checkedIds[tu.id];
                    return (
                      <Card
                        key={tu.id}
                        onClick={() => handleCheckboxChange(tu.id)}
                        padding="sm"
                        className={`flex items-start justify-between gap-3 transition-all select-none ${tu.typeOfUseCode === 'OP' ? "cursor-default" : "cursor-pointer hover:bg-slate-50/70"
                          } ${isChecked
                            ? "bg-blue-50/70 border-blue-300 shadow-sm"
                            : "bg-white border-slate-200"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => { }}
                            disabled={tu.typeOfUseCode === 'OP'}
                            className={`mt-0.5 ${isChecked ? "bg-blue-600 border-blue-600 text-white" : ""}`}
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900 font-sans">
                              {tu.typeOfUseCode}
                            </div>
                            <div className="text-xs text-slate-500 font-sans">
                              {tu.description}
                            </div>
                          </div>
                        </div>
                        {tu.typeOfUseGroupCode && (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm font-sans" title={tu.groupName}>
                              Group: {tu.typeOfUseGroupCode}
                            </span>
                            {tu.groupName && (
                              <span className="text-[9px] text-slate-400 max-w-[100px] truncate font-sans" title={tu.groupName}>
                                {tu.groupName}
                              </span>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="flex-shrink-0 pt-2 border-t border-slate-100">
                <CardPagination
                  pageNumber={safePageNumber}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  onPageChange={setPageNumber}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                  className="rounded-none shadow-none border-none px-0"
                />
              </div>
            </div>

            {/* RIGHT SIDE: Configurations for checked items */}
            <div className="md:w-2/3 p-5 space-y-4 overflow-y-auto h-full bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 border-b pb-2">
                Configure Use Groups
              </h2>

              {Object.keys(checkedIds).filter(id => checkedIds[Number(id)]).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Settings size={48} className="stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-sm">Please select a type of use on the left to configure its group.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {allUseTypes
                    .filter((tu) => checkedIds[tu.id])
                    .map((tu) => (
                      <GroupConfigurationCard
                        key={tu.id}
                        typeofuse={tu}
                        form={groupForms[tu.id]}
                        existingGroups={existingGroups}
                        handleSelectExistingGroup={handleSelectExistingGroup}
                        handleToggleMode={handleToggleMode}
                        handleFieldChange={handleFieldChange}
                        handleSaveGroup={handleSaveGroup}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
