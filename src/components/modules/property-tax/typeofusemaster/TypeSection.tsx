import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AddButton, DeleteButton, EditButton, SearchInput } from "@/components/common";
import { CardList } from "@/components/common/CardList";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { UseGroup, UseType } from "@/types/typeOfUse.types";
import { clsx, getTypeApiId, getGroupApiId } from "./typeOfUseMasterUtils";

type TranslatorFunction = (key: string, values?: Record<string, string | number>) => string;

interface TypeSectionProps {
  paginatedTypes: UseType[];
  typeSearch: string;
  selectedTypeId: string | null;
  selectedGroupId: string | number | null;
  allGroups: UseGroup[];
  typesTotalCount: number;
  typesTotalPages: number;
  typePageNumber: number;
  typePageSize: number;
  subPageSize: number;
  onTypeSearchChange: (value: string) => void;
  onTypeSelect: (groupId: string, typeId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDeleteType: (type: UseType) => void;
  t: TranslatorFunction;
}

export function TypeSection({
  paginatedTypes,
  typeSearch,
  selectedTypeId,
  selectedGroupId,
  allGroups,
  typesTotalCount,
  typesTotalPages,
  typePageNumber,
  typePageSize,
  onTypeSearchChange,
  onTypeSelect,
  onPageChange,
  onPageSizeChange,
  onDeleteType,
  t,
}: TypeSectionProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[400px] lg:h-[600px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 px-4 py-3 bg-white z-10 flex-shrink-0 gap-4">
        <div className="font-semibold text-slate-900">{t('type.title')}</div>
        <SearchInput
          className="mb-0 ml-auto w-full max-w-sm"
          value={typeSearch}
          onChange={onTypeSearchChange}
          placeholder={t('type.searchPlaceholder')}
        />
        <AddButton
          size="md"
          label={t('type.add')}
          onClick={() => {
            const group = allGroups.find(
              (g) => g.typeOfUseGroupId === selectedGroupId
            );
            const groupApiId = group ? getGroupApiId(group) : '';
            router.push(
              `/${locale}/property-tax/typeofusemaster/type/add?groupId=${groupApiId}`
            );
          }}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <CardList
          data={paginatedTypes}
          pageNumber={typePageNumber}
          pageSize={typePageSize}
          totalCount={typesTotalCount}
          totalPages={typesTotalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
          emptyText={t('type.noTypes')}
          maxHeightClassName="max-h-[320px] sm:max-h-[350px] lg:max-h-[415px] overflow-y-auto"
          className="border-none rounded-none shadow-none"
          renderCard={(typeItem) => {
            const selected = getTypeApiId(typeItem) === selectedTypeId;
            return (
              <div key={typeItem.typeOfUseId} className="w-full px-2 mb-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const currentGroup = allGroups.find(
                      (g) => g.typeOfUseGroupId === selectedGroupId
                    );
                    const currentGroupApiId = currentGroup
                      ? getGroupApiId(currentGroup)
                      : "";
                    onTypeSelect(currentGroupApiId, getTypeApiId(typeItem));
                  }}
                  className={clsx(
                    "cursor-pointer select-none rounded-xl border px-4 py-3 text-left shadow-sm transition",
                    selected
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    {/* LEFT: Code + Description */}
                    <div className="flex items-center gap-2 min-w-0 shrink-0">
                      <span className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-bold text-white whitespace-nowrap">
                        {typeItem.typeOfUseCode}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {typeItem.description}
                      </span>
                    </div>

                    {/* CENTER: Meta badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Placeholder for future badges */}
                    </div>

                    {/* RIGHT: Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <span className="text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-300 text-xs whitespace-nowrap">
                        {t("seq")}: <b>{typeItem.searchSequence ?? "—"}</b>
                      </span>

                      <StatusBadge value={typeItem.status ?? "Active"} />

                      <EditButton
                        size="sm"
                        title={t('buttons.edit')}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/${locale}/property-tax/typeofusemaster/type/edit/${typeItem.typeOfUseId}`
                          );
                        }}
                      />
                      <DeleteButton
                        size="sm"
                        title={t('buttons.delete')}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteType(typeItem);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
