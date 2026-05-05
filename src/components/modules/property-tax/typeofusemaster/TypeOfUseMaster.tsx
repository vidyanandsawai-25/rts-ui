"use client";
import { AddButton, DeleteButton, EditButton, PageContainer, SearchInput } from "@/components/common";
import { CardList } from "@/components/common/CardList";
import { useMemo } from "react";
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";
import {
  Layers3,
  Home,
  Building2,
  Factory,
  GraduationCap,
  Leaf,
  MapPin,
  AlertCircle,
} from "lucide-react";

import type {
  TypeOfUseMasterData,
  UseGroup,
  UseType,
  UseSubType,
  UseGroupIconKey,
} from "@/types/typeOfUse.types";


import { MasterTable, type Column } from "@/components/common/MasterTable";
import { toast } from "sonner";
import TableHeader from "@/components/common/TableHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useConfirm } from "@/components/common/ConfirmProvider";
import {
  deleteUseTypeWithSubTypes,
  deleteUseGroupWithCascade,
  deleteUseGroup,
  deleteSubType
} from "@/app/[locale]/property-tax/typeofusemaster/actions";
import { getSubTypeColumns, type SubTypeTableRow } from "./TypeOfUseMasterColumns";
import { useTypeOfUseMasterUrl } from "@/hooks/useTypeOfUseMasterUrl";
import { useTypeOfUseMasterSelection } from "@/hooks/useTypeOfUseMasterSelection";
import { useSubTypeManagement } from "@/hooks/useSubTypeManagement";
import { useTypeSearch } from "@/hooks/useTypeSearch";



// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<UseGroupIconKey, any> = {
  home: Home,
  building: Building2,
  factory: Factory,
  school: GraduationCap,
  leaf: Leaf,
  map: MapPin,
};

function getTypeApiId(t: UseType) {
  return String(t.typeOfUseId);
}

function clsx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

// Helper to convert groupIcon string to UseGroupIconKey for display
function getIconKeyFromString(iconStr: string): UseGroupIconKey {
  const v = String(iconStr ?? "").toLowerCase();
  if (v.includes('home')) return 'home';
  if (v.includes('building') || v.includes('briefcase')) return 'building';
  if (v.includes('factory')) return 'factory';
  if (v.includes('school') || v.includes('graduation')) return 'school';
  if (v.includes('leaf') || v.includes('wheat')) return 'leaf';
  if (v.includes('map') || v.includes('pin')) return 'map';
  return 'home';
}

// ✅ Helper to get the API identifier (typeOfUseGroupId) for a group
function getGroupApiId(g: UseGroup): string {
  return String(g.typeOfUseGroupId);
}

// ✅ FIX: Count types using the API identifier (typeOfUseGroupId)
function countTypesForGroup(group: UseGroup, types: UseType[]) {
  const groupApiId = getGroupApiId(group);
  return types.filter((t) => String(t.typeOfUseGroupId) === groupApiId).length;
}

export default function TypeOfUseMaster({
  initialData,
  subTypes,
  subTotalCount,
  subTotalPages,
  pageNumber,
  pageSize,
  paginatedTypes,
  typesTotalCount,
  typesTotalPages,
  typePageNumber,
  typePageSize,
  selectedTypeId: serverSelectedTypeId,
  typeSearchFromServer,
}: {
  initialData: TypeOfUseMasterData;
  subTypes: UseSubType[];
  subTotalCount: number;
  subTotalPages: number;
  pageNumber: number;
  pageSize: number;
  paginatedTypes: UseType[];
  typesTotalCount: number;
  typesTotalPages: number;
  typePageNumber: number;
  typePageSize: number;
  selectedTypeId: string;
  typeSearchFromServer?: string;
}) {
  const t = useTranslations('typeofusemaster');
  const router = useRouter();
  const locale = useLocale();
  const { confirm } = useConfirm();

  const allTypes = useMemo(() => initialData.types ?? [], [initialData.types]);
  const allGroups = useMemo(() => initialData.groups ?? [], [initialData.groups]);

  // Use custom hooks
  const { urlGroupId, urlTypeId, urlQ, pushUrl } = useTypeOfUseMasterUrl();

  const { selectedGroupId, selectedTypeId, selectedType } = useTypeOfUseMasterSelection({
    allGroups,
    allTypes,
    urlGroupId,
    urlTypeId: urlTypeId || serverSelectedTypeId,
    pageSize,
    pushUrl,
  });

  const { typeSearch, setTypeSearch, onTypeSearchChange } = useTypeSearch({
    typeSearchFromServer,
    selectedGroupId,
    allGroups,
    pushUrl,
  });

  const {
    subTypeSearch,
    searchActive,
    subLoading,
    loadingAll,
    subPageSize,
    effectivePageNumber,
    effectiveTotalCount,
    effectiveTotalPages,
    subTypeTableRows,
    changeSubPage,
    changeSubPageSize,
    onSearchChange,
  } = useSubTypeManagement({
    subTypes,
    subTotalCount,
    subTotalPages,
    pageNumber,
    pageSize,
    urlQ,
    selectedTypeId,
    selectedGroupId,
    allGroups,
    pushUrl,
  });

  // Get column definitions from separate file
  const subTypeColumns = useMemo<Column<SubTypeTableRow>[]>(
    () => getSubTypeColumns(t),
    [t]
  );

  const handleDeleteGroup = (g: UseGroup) => {
    const groupId = String(g.typeOfUseGroupId);

    if (!groupId) {
      toast.error(t('messages.invalidGroupRecord'));
      return;
    }

    const typesCount = countTypesForGroup(g, allTypes);
    const hasTypes = typesCount > 0;

    confirm({
      variant: hasTypes ? "warning" : "delete",
      title: hasTypes ? t("messages.deleteGroupWithTypesTitle") : t("messages.deleteConfirmation"),
      description: hasTypes
        ? t("messages.deleteGroupWithTypesDescription")
        : undefined,
      meta: { name: g.groupName },
      confirmText: hasTypes ? t("messages.deleteAll") : undefined,
      onConfirm: async () => {
        try {
          if (hasTypes) {
            await deleteUseGroupWithCascade(Number(groupId)); // ✅ Cascade Delete
          } else {
            await deleteUseGroup(groupId); // ✅ Standard Delete
          }
          toast.success(t('messages.groupDeletedSuccess', { name: g.groupName }));
          router.refresh();              // ✅ refresh UI
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          toast.error(e?.message || t('messages.groupDeleteFailed'));
        }
      },
    });
  };


  const handleDeleteType = (useType: UseType) => {
    const typeId = String(useType.typeOfUseId);

    if (!typeId) {
      toast.error(t('messages.invalidTypeRecord'));
      return;
    }

    confirm({
      variant: "warning",
      title: t("messages.deleteTypeWithSubTypesTitle"),
      description: t("messages.deleteTypeWithSubTypesDescription"),
      meta: { name: useType.description },
      confirmText: t("messages.deleteAll"),
      onConfirm: async () => {
        try {
          // Always use cascade delete to handle subtypes if they exist
          await deleteUseTypeWithSubTypes(Number(typeId));
          toast.success(t('messages.typeDeletedSuccess', { name: useType.description }));
          router.refresh();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          toast.error(e?.message || t('messages.typeDeleteFailed'));
        }
      },
    });
  };


  // ---------------- DELETE SUBTYPE ----------------
  const handleDeleteSubType = (s: UseSubType) => {
    confirm({
      variant: "delete",
      title: t("messages.deleteConfirmation"),
      meta: { name: s.description },
      onConfirm: async () => {
        try {
          await deleteSubType(String(s.subTypeOfUseId));

          // ✅ SUCCESS ONLY
          toast.success(t('messages.subTypeDeletedSuccess', { name: s.description }));

          router.refresh();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          // ignore Next.js redirect "error"
          if (String(e?.message).includes("NEXT_REDIRECT")) return;
          toast.error(e?.message || t('messages.subTypeDeleteFailed'));
        }
      },
    });
  };

  // ---------------- UI ----------------
  if (!initialData.groups?.length) {
    return (
      <PageContainer>
        <div className="p-6 text-sm text-slate-600">{t('messages.noGroups')}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4 p-0 ">
        <TableHeader
          title={t('title')}
          subtitle={t('subtitle')}
          icon={Layers3}
        />

        {/* Groups */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center gap-3 overflow-x-auto">
            {initialData.groups.map((g: UseGroup) => {
              const Icon = iconMap[getIconKeyFromString(g.groupIcon)] ?? Layers3;
              const selected = g.typeOfUseGroupId === selectedGroupId;
              // ✅ FIX: Pass the group object to countTypesForGroup
              const typesCount = countTypesForGroup(g, allTypes);
              const groupIdForRoute = g.typeOfUseGroupId;
              const groupApiId = getGroupApiId(g);

              return (
                <div
                  key={g.typeOfUseGroupId}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    // Don't set local state - let URL be the source of truth
                    // setSelectedGroupId(g.typeOfUseGroupId); // REMOVED

                    // ✅ FIX: Use API identifier to find first type in group
                    const firstType =
                      allTypes.find((t) => String(t.typeOfUseGroupId) === groupApiId);

                    const firstTypeId = firstType
                      ? getTypeApiId(firstType)
                      : ""; // Empty if no types in group

                    setTypeSearch("");

                    pushUrl({
                      groupId: groupApiId,
                      typeId: firstTypeId, // Explicitly pass (even if empty) to clear previous value
                      pn: 1,
                      ps: subPageSize,
                      typePn: 1,   // Reset type pagination
                      typePs: 10,  // Reset to default
                      q: "",
                      typeSearch: "",
                    });

                  }}
                  className={clsx(
                    "min-w-[230px] cursor-pointer select-none rounded-xl border px-3 py-2 text-left shadow-sm transition",
                    selected
                      ? "border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={clsx(
                        "rounded-lg p-2",
                        selected ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900">{g.groupName}</div>

                        <div className="flex gap-2">
                          <EditButton
                            size="sm"
                            title={t('buttons.edit') + ' ' + t('group.title')}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/${locale}/property-tax/typeofusemaster/group/edit/${encodeURIComponent(groupIdForRoute)}`);
                            }}
                          />
                          <DeleteButton
                            size="sm"
                            title={t('buttons.delete') + ' ' + t('group.title')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(g);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-1 text-xs">
                      </div>
                      <div className="mt-1 text-xs flex items-center gap-2">
                        <span className="text-slate-600">{typesCount} {t('type.title')}</span>
                        <StatusBadge value={g.status ?? "Active"} />
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

            <AddButton
              label={t('group.add')}
              onClick={() =>
                router.push(`/${locale}/property-tax/typeofusemaster/group/add`)
              }
              className="ml-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Types */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[400px] lg:h-[600px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 px-4 py-3 bg-white z-10 flex-shrink-0 gap-4 ">
              <div className="font-semibold text-slate-900">{t('type.title')}</div>
              <SearchInput className="mb-0 ml-auto w-full max-w-sm"
                value={typeSearch}
                onChange={onTypeSearchChange}
                placeholder={t('type.searchPlaceholder')}
              />
              <AddButton
                // variant="add"
                size="md"
                label={t('type.add')}
                onClick={() => {
                  const group = initialData.groups.find(g => g.typeOfUseGroupId === selectedGroupId);
                  const groupApiId = group ? getGroupApiId(group) : '';
                  router.push(`/${locale}/property-tax/typeofusemaster/type/add?groupId=${groupApiId}`);
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
                onPageChange={(page) => {
                  const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
                  const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";
                  pushUrl({
                    groupId: currentGroupApiId,
                    typePn: page,
                    typePs: typePageSize,
                  });
                }}
                onPageSizeChange={(size) => {
                  const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
                  const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";
                  pushUrl({
                    groupId: currentGroupApiId,
                    typePn: 1,
                    typePs: size,
                  });
                }}
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
                          const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
                          const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

                          pushUrl({
                            groupId: currentGroupApiId,
                            typeId: getTypeApiId(typeItem),
                            pn: 1,
                            ps: subPageSize,
                            q: "",
                          });
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
                            <span className="text-sm font-semibold text-slate-900 ">
                              {typeItem.description}
                            </span>
                          </div>

                          {/* CENTER: Meta badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* <span className="text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-300 text-xs whitespace-nowrap">
                              {t("seq")}: <b>{typeItem.searchSequence ?? "—"}</b>
                            </span> */}
                            {/* <StatusBadge value={typeItem.status ?? "Active"} /> */}
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
                                router.push(`/${locale}/property-tax/typeofusemaster/type/edit/${typeItem.typeOfUseId}`);
                              }}
                            />
                            <DeleteButton
                              size="sm"
                              title={t('buttons.delete')}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteType(typeItem);
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

          {/* SubTypes */}
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
                onClick={() => router.push(`/${locale}/property-tax/typeofusemaster/subtype/add?typeId=${selectedTypeId}`)}
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
                      <span>
                        {/* {t('subtype.found', { count: filteredAll.length, defaultValue: 'Found {count} matching records' })} */}
                        {t('subtype.found', { count: subTotalCount })}
                      </span>
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
                  <div className="p-8 text-center text-sm text-slate-500">{t('type.selectTypeFirst')}</div>
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
                        <DeleteButton onClick={() => handleDeleteSubType(row as UseSubType)} />
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
