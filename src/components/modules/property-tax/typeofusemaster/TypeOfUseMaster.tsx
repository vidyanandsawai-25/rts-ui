"use client";
import { AddButton, DeleteButton, EditButton, PageContainer, SearchInput } from "@/components/common";
import { CardList } from "@/components/common/CardList";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from "next/navigation";
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

function safeNum(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function TypeOfUseMaster({
  initialData,
  subTypes,
  subTotalCount,
  subTotalPages,
  pageNumber,
  pageSize,
  // Type pagination (server-side)
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
  // Type pagination (server-side)
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
  const sp = useSearchParams();

  // ---------------- URL PARAMS (used only for paging/search) ----------------
  const urlGroupId = sp.get("groupId") ?? ""; // Group ID from URL
  const urlTypeId = sp.get("typeId") ?? ""; // optional (for deep-link)
  const urlQ = sp.get("q") ?? "";

  const { confirm } = useConfirm();
  // const selectedTypeId = urlTypeId || serverSelectedTypeId || "";
  const selectedTypeId = urlTypeId
    ? urlTypeId
    : serverSelectedTypeId;
  const locale = useLocale(); // ✅ MOVE THIS UP


  const pushUrl = useCallback(
    (
      next: {
        groupId?: string;
        typeId?: string;
        pn?: number;
        ps?: number;
        typePn?: number;   // 🆕 Type page number
        typePs?: number;   // 🆕 Type page size
        q?: string;
        typeSearch?: string;
      }
    ) => {
      const qs = new URLSearchParams(sp.toString());

      const groupId = next.groupId ?? qs.get("groupId") ?? "";
      // ✅ FIX: When typeId is explicitly passed (even as undefined), use it. Don't fallback to URL.
      const typeId = 'typeId' in next
        ? (next.typeId ?? "")  // Explicitly passed (use it, convert undefined to "")
        : (qs.get("typeId") ?? ""); // Not passed (keep current URL value)
      const pn = next.pn ?? safeNum(qs.get("pn"), 1);
      const ps = next.ps ?? safeNum(qs.get("ps"), 5);
      // Type pagination params
      const typePn = next.typePn ?? safeNum(qs.get("typePn"), 1);
      const typePs = next.typePs ?? safeNum(qs.get("typePs"), 10);
      const q = next.q ?? qs.get("q") ?? "";
      const typeSearch = next.typeSearch !== undefined ? next.typeSearch : (qs.get("typeSearch") ?? "");

      // Build URL params in correct order
      const params = new URLSearchParams();

      // 1. Group ID (always first if present)
      if (groupId) {
        params.set("groupId", groupId);
      }

      // 2. Type ID (only if present and not __NONE__)
      if (typeId && typeId !== "__NONE__") {
        params.set("typeId", typeId);
      }

      // 3. SubType pagination parameters (only if we have a type selected)
      if (typeId && typeId !== "__NONE__") {
        params.set("pn", String(pn));
        params.set("ps", String(ps));
      }

      // 4. Type pagination parameters (always include)
      params.set("typePn", String(typePn));
      params.set("typePs", String(typePs));

      // 5. SubType search
      if (q && q.trim()) {
        params.set("q", q.trim());
      }

      // 6. Type search
      if (typeSearch?.trim()) {
        params.set("typeSearch", typeSearch.trim());
      }

      const href = `/${locale}/property-tax/typeofusemaster?${params.toString()}`;
      router.push(href); // ✅ FORCE SERVER NAVIGATION
    },
    [router, sp, locale]
  );


  // ---------------- INITIAL GROUP/TYPE ----------------
  const allTypes = useMemo(() => initialData.types ?? [], [initialData.types]);
  const allGroups = useMemo(() => initialData.groups ?? [], [initialData.groups]);

  // ✅ FIX: Helper to find group by its typeOfUseGroupId (what types use as typeOfUseGroupId)
  const findGroupByApiId = (apiId: string) =>
    allGroups.find((g) => getGroupApiId(g) === apiId) ?? null;

  const firstGroup = allGroups?.[0] ?? null;
  const firstGroupApiId = firstGroup ? getGroupApiId(firstGroup) : "";
  // ✅ FIX: Use typeOfUseGroupId for matching types
  const firstTypeInFirstGroup = allTypes.find((t) => String(t.typeOfUseGroupId) === firstGroupApiId);
  const firstTypeInFirstGroupId = firstTypeInFirstGroup ? String(getTypeApiId(firstTypeInFirstGroup)) : "";

  // if URL has typeId, start with that; else start with first type
  const initialSelectedTypeId = urlTypeId || firstTypeInFirstGroupId || "";

  // ✅ FIX: Find the group.typeOfUseGroupId for the selected type
  const initialSelectedGroupId = (() => {
    // 🆕 If URL has groupId, use it to find the group
    if (urlGroupId) {
      const groupByApiId = findGroupByApiId(urlGroupId);
      if (groupByApiId) return groupByApiId.typeOfUseGroupId;
    }

    // Otherwise, derive from selected type
    if (initialSelectedTypeId) {
      const type = allTypes.find((t) => getTypeApiId(t) === String(initialSelectedTypeId));
      if (type) {
        // type.typeOfUseGroupId is the API identifier, find the group by it
        const group = findGroupByApiId(String(type.typeOfUseGroupId));
        if (group) return group.typeOfUseGroupId; // Return the group's typeOfUseGroupId
      }
    }
    return firstGroup?.typeOfUseGroupId ?? 0;
  })();

  const [selectedGroupId, setSelectedGroupId] = useState(initialSelectedGroupId);
  // const [selectedTypeId, setSelectedTypeId] = useState(initialSelectedTypeId);

  // ✅ Sync selectedGroupId from URL (takes precedence over local state)
  useEffect(() => {
    if (!urlGroupId) return;

    const groupByApiId = findGroupByApiId(urlGroupId);
    if (groupByApiId && groupByApiId.typeOfUseGroupId !== selectedGroupId) {
      // Use setTimeout to avoid direct setState in effect
      setTimeout(() => setSelectedGroupId(groupByApiId.typeOfUseGroupId), 0);
    }
  }, [urlGroupId, allGroups, selectedGroupId]);


  useEffect(() => {
    if (!selectedTypeId) return;
    if (urlGroupId) return; // URL has explicit groupId, don't override

    const type = allTypes.find((t) => getTypeApiId(t) === String(selectedTypeId));
    if (!type) return;

    // type.typeOfUseGroupId is the API identifier, find the actual group
    const group = findGroupByApiId(String(type.typeOfUseGroupId));
    if (!group) return;

    // Only update if different (use group.typeOfUseGroupId)
    if (group.typeOfUseGroupId !== selectedGroupId) {
      setTimeout(() => setSelectedGroupId(group.typeOfUseGroupId), 0);
    }
  }, [selectedTypeId, allTypes, allGroups, urlGroupId]); // eslint-disable-line react-hooks/exhaustive-deps


  // ✅ FIX: When group is selected but no type, select first type in that group
  // NOTE: Only run this on initial load, not when explicitly navigating to an empty group
  useEffect(() => {
    // Skip if a valid type is already selected
    if (selectedTypeId && selectedTypeId !== "__NONE__") return;

    // Skip if URL has explicit groupId (user navigated to specific group)
    if (urlGroupId) return;

    // Find group by typeOfUseGroupId, then get its API ID for filtering types
    const group = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    if (!group) return;

    const groupApiId = getGroupApiId(group);
    const firstType = allTypes.find(
      (t) => String(t.typeOfUseGroupId) === groupApiId
    );

    if (!firstType) return; // No types in this group, don't navigate

    const firstTypeId = getTypeApiId(firstType);
    const currentGroupApiId = getGroupApiId(group);

    pushUrl({
      groupId: currentGroupApiId,
      typeId: firstTypeId,
      pn: 1,
      ps: pageSize,
      q: "",
    });
  }, [
    selectedTypeId,
    selectedGroupId,
    allTypes,
    allGroups,
    pushUrl,
    pageSize,
    urlGroupId,
  ]);



  // ---------------- TYPE SEARCH ----------------
  const [typeSearch, setTypeSearch] = useState(typeSearchFromServer ?? "");

  // ✅ Get selected type object to display its code
  const selectedType = useMemo(() => {
    if (!selectedTypeId || selectedTypeId === "__NONE__") return null;
    return allTypes.find((t) => getTypeApiId(t) === String(selectedTypeId));
  }, [selectedTypeId, allTypes]);


  // ---------------- SUBTYPE STATE ----------------
  const [subLoading] = useState(false);
  const [loadingAll] = useState(false);

  const subPageSize = pageSize;
  const subPageNumber = pageNumber;

  // ✅ SEARCH
  const [subTypeSearch, setSubTypeSearch] = useState(urlQ);
  const searchActive = subTypeSearch.trim().length > 0;

  const effectivePageNumber = subPageNumber;
  const effectiveTotalCount = subTotalCount;
  const effectiveTotalPages = subTotalPages;

  const subTypeTableRows = useMemo(() => {
    return (subTypes ?? []).map((s, idx) => ({
      ...s,
      srNo: (subPageNumber - 1) * subPageSize + idx + 1,
    }));
  }, [subTypes, subPageNumber, subPageSize]);

  // Get column definitions from separate file
  const subTypeColumns = useMemo<Column<SubTypeTableRow>[]>(
    () => getSubTypeColumns(t),
    [t]
  );

  const changeSubPage = (p: number) => {
    const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

    pushUrl({
      groupId: currentGroupApiId,
      typeId: selectedTypeId,
      pn: p,
      ps: subPageSize,
      q: searchActive ? subTypeSearch : "",
    });
  };


  const changeSubPageSize = (size: number) => {
    const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

    // Reset search state (variables commented out, just call pushUrl)
    pushUrl({
      groupId: currentGroupApiId,
      typeId: selectedTypeId,
      pn: 1,
      ps: size,
      q: searchActive ? subTypeSearch : "",
    });
  };



  const onSearchChange = (val: string) => {
    const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
    const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

    setSubTypeSearch(val);

    pushUrl({
      groupId: currentGroupApiId,
      typeId: selectedTypeId,
      pn: 1,
      ps: subPageSize,
      q: val.trim() || "",
    });
  };

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

    const typeApiId = getTypeApiId(useType);
    // Check if this is the selected type to show accurate count
    const isSelectedType = typeApiId === selectedTypeId;
    const hasSubTypes = isSelectedType && subTotalCount > 0;

    confirm({
      variant: hasSubTypes ? "warning" : "delete",
      title: hasSubTypes ? t("messages.deleteTypeWithSubTypesTitle") : t("messages.deleteConfirmation"),
      description: hasSubTypes
        ? t("messages.deleteTypeWithSubTypesDescription")
        : undefined,
      meta: { name: useType.description },
      confirmText: hasSubTypes ? t("messages.deleteAll") : undefined,
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
                            // variant="edit"
                            size="sm"
                            title={t('buttons.edit') + ' ' + t('group.title')}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/${locale}/property-tax/typeofusemaster/group/edit/${encodeURIComponent(groupIdForRoute)}`);
                            }}
                          />
                          <DeleteButton
                            //variant="delete"
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

                        {/* ✅ StatusBadge */}
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
            <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 px-4 py-3 bg-white z-10 flex-shrink-0">
              <div className="font-semibold text-slate-900">{t('type.title')}</div>
              <SearchInput
                value={typeSearch}
                onChange={(val) => {
                  const currentGroup = allGroups.find((g) => g.typeOfUseGroupId === selectedGroupId);
                  const currentGroupApiId = currentGroup ? getGroupApiId(currentGroup) : "";

                  setTypeSearch(val);

                  pushUrl({
                    groupId: currentGroupApiId,
                    typeSearch: val,
                    typeId: undefined, // reset selected type
                    pn: 1,
                    typePn: 1, // reset type page on search
                  });
                }}
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
                emptyText={t('type.noTypes', { defaultValue: 'No types found for selected group.' })}
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
                          {/* eslint-disable i18next/no-literal-string */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-300 text-xs whitespace-nowrap">
                              Seq: <b>{typeItem.searchSequence ?? "—"}</b>
                            </span>
                            {/* eslint-enable i18next/no-literal-string */}
                            {/* <StatusBadge value={typeItem.status ?? "Active"} /> */}
                          </div>

                          {/* RIGHT: Action buttons */}
                          <div className="flex items-center gap-2 shrink-0 ml-auto">

                            <StatusBadge value={typeItem.status ?? "Active"} />

                            <EditButton
                              size="sm"
                              title="Edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/${locale}/property-tax/typeofusemaster/type/edit/${typeItem.typeOfUseId}`);
                              }}
                            />
                            <DeleteButton
                              size="sm"
                              title="Delete"
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
                  placeholder={t('subtype.searchPlaceholder', { defaultValue: 'Search SubTypes...' })}
                  className="mb-0 w-full md:w-80 lg:w-96 text-gray-700"
                />
              </div>

              {/* Right */}
              <AddButton
                //variant="add"
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
                      <span>{t('subtype.searching', { defaultValue: 'Searching...' })}</span>
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
                    {t('subtype.clear', { defaultValue: 'Clear' })}
                  </button>
                </div>
              )}

              <div className="mt-0">
                {!selectedTypeId ? (
                  <div className="p-8 text-center text-sm text-slate-500">{t('type.selectTypeFirst', { defaultValue: 'Select a type first' })}</div>
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
