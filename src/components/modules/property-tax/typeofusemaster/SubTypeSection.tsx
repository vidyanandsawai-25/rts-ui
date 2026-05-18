import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Layers3, AlertCircle } from "lucide-react";
import { AddButton, DeleteButton, EditButton, SearchInput } from "@/components/common";
import { MasterTable, type Column } from "@/components/common/MasterTable";
import type { UseSubType, UseType, TranslatorFunction } from "@/types/typeOfUse.types";
import type { SubTypeTableRow } from "./TypeOfUseMasterColumns";

interface SubTypeSectionProps {
  selectedType: UseType | undefined | null;
  selectedTypeId: string | null;
  subTypeSearch: string;
  searchActive: boolean;
  subLoading: boolean;
  loadingAll: boolean;
  subPageSize: number;
  effectivePageNumber: number;
  effectiveTotalCount: number;
  effectiveTotalPages: number;
  subTypeTableRows: SubTypeTableRow[];
  subTotalCount: number;
  subTypeColumns: Column<SubTypeTableRow>[];
  onSearchChange: (value: string) => void;
  changeSubPage: (page: number) => void;
  changeSubPageSize: (size: number) => void;
  onDeleteSubType: (subType: UseSubType) => void;
  t: TranslatorFunction;
}

export function SubTypeSection({
  selectedType,
  selectedTypeId,
  subTypeSearch,
  searchActive,
  subLoading,
  loadingAll,
  subPageSize,
  effectivePageNumber,
  effectiveTotalCount,
  effectiveTotalPages,
  subTypeTableRows,
  subTotalCount,
  subTypeColumns,
  onSearchChange,
  changeSubPage,
  changeSubPageSize,
  onDeleteSubType,
  t,
}: SubTypeSectionProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[600px] flex flex-col">
      <div className="flex flex-col gap-4 rounded-t-2xl border-b border-slate-100 px-4 py-3 sticky top-0 bg-white md:flex-row md:items-center md:justify-between">
        {/* Left */}
        <div className="font-semibold text-slate-900 whitespace-nowrap flex items-center gap-3">
          {t('subtype.title')}
          {selectedType && (
            <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200">
              {selectedType.typeOfUseCode}
            </span>
          )}
          {selectedType && (
            <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-300">
              <Layers3 className="h-4 w-4" />
              <span>
                {subTotalCount} {t("subtype.title")}
              </span>
            </div>
          )}
        </div>

        {/* Middle (between) */}
        <div className="flex flex-col gap-3 md:flex-1 md:flex-row md:items-center md:justify-end md:gap-4">
          <SearchInput
            value={subTypeSearch}
            onChange={onSearchChange}
            placeholder={t('subtype.searchPlaceholder')}
            className="mb-0 w-full md:w-80 lg:w-96 text-gray-700"
          />
        </div>

        <AddButton
          size="md"
          label={t('subtype.add')}
          disabled={!selectedTypeId}
          onClick={() =>
            router.push(
              `/${locale}/property-tax/typeofusemaster/subtype/add?typeId=${selectedTypeId}`
            )
          }
        />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {searchActive && (
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              {loadingAll ? (
                <span>{t('subtype.searching')}</span>
              ) : (
                <span>{t('subtype.found', { count: subTotalCount })}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-blue-600 hover:underline font-medium"
            >
              {t('subtype.clear')}
            </button>
          </div>
        )}

        <div className="mt-0">
          {!selectedTypeId ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {t('type.selectTypeFirst')}
            </div>
          ) : (
            <MasterTable
              columns={subTypeColumns}
              data={subTypeTableRows}
              loading={loadingAll || subLoading}
              pageNumber={effectivePageNumber}
              pageSize={subPageSize}
              height="sm"
              totalCount={effectiveTotalCount}
              totalPages={effectiveTotalPages}
              onPageChange={changeSubPage}
              onPageSizeChange={changeSubPageSize}
              getRowKey={(row) => row.subTypeOfUseId ?? row.srNo}
              paginationConfig={{
                enabled: true,
                showPageSizeSelector: true,
              }}
              renderActions={(row) => (
                <div className="flex items-center gap-2">
                  <EditButton
                    onClick={() =>
                      router.push(
                        `/${locale}/property-tax/typeofusemaster/subtype/edit/${row.subTypeOfUseId}`
                      )
                    }
                  />
                  <DeleteButton
                    onClick={() => onDeleteSubType(row as UseSubType)}
                  />
                </div>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
