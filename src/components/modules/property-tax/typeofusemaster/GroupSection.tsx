import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { LayoutGrid } from "lucide-react";
import { AddButton, DeleteButton, EditButton } from "@/components/common";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tooltip } from "@/components/common/Tooltip";
import type { UseGroup, UseType, TranslatorFunction } from "@/types/typeOfUse.types";
import {
  clsx,
  getIconKey,
  getIconComponent,
  getGroupApiId,
  countTypesForGroup,
  getTypeApiId,
} from "./typeOfUseMasterUtils";

interface GroupSectionProps {
  groups: UseGroup[];
  allTypes: UseType[];
  selectedGroupId: string | number | null;
  subPageSize: number;
  onGroupSelect: (groupId: string, firstTypeId: string) => void;
  onDeleteGroup: (group: UseGroup) => void;
  t: TranslatorFunction;
}

function GroupNameLabel({ name }: { name: string }) {
  return (
    <Tooltip content={name} placement="bottom">
      <span className="min-w-0 text-sm font-semibold text-slate-900 cursor-help truncate">
        {name}
      </span>
    </Tooltip>
  );
}

export function GroupSection({
  groups,
  allTypes,
  selectedGroupId,
  onGroupSelect,
  onDeleteGroup,
  t,
}: GroupSectionProps) {
  const router = useRouter();
  const locale = useLocale();
  const allGroupsLabel = t('group.allGroups') || "सर्व गट";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
      {/* Header section with Title and Add Button */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="font-semibold text-slate-900 text-base">{t('group.title')}</div>
        <AddButton
          size="sm"
          label={t('group.add')}
          onClick={() =>
            router.push(`/${locale}/property-tax/typeofusemaster/group/add`)
          }
        />
      </div>

      {/* Cards list section scrollable */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {/* All Groups Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            const firstType = allTypes?.[0];
            const firstTypeId = firstType ? getTypeApiId(firstType) : "";
            onGroupSelect("ALL", firstTypeId);
          }}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget as HTMLElement).click();
            }
          }}
          className={clsx(
            "min-w-[230px] cursor-pointer select-none rounded-xl border px-3 py-2 text-left shadow-sm transition",
            selectedGroupId === "ALL"
              ? "border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50"
              : "border-slate-200 hover:border-slate-300 bg-white"
          )}
        >
          <div className="flex items-start gap-3 h-full">
            <div
              className={clsx(
                "rounded-lg p-2",
                selectedGroupId === "ALL"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-700"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <GroupNameLabel name={allGroupsLabel} />
              </div>

              <div className="mt-1 text-xs flex items-center gap-2">
                <span className="text-slate-600">
                  {groups.some(g => 'typeCount' in g)
                    ? groups.reduce((acc, g) => acc + ((g as UseGroup & { typeCount?: number }).typeCount ?? 0), 0)
                    : allTypes.length}{" "}
                  {t('type.title')}
                </span>
                <StatusBadge value="Active" />
              </div>
            </div>
          </div>
        </div>

        {groups.map((g: UseGroup) => {
          const Icon = getIconComponent(getIconKey(g.groupIcon));
          const selected = g.typeOfUseGroupId === selectedGroupId;
          const typesCount = (g as UseGroup & { typeCount?: number }).typeCount ?? countTypesForGroup(g, allTypes);
          const groupIdForRoute = g.typeOfUseGroupId;
          const groupApiId = getGroupApiId(g);

          return (
            <div
              key={g.typeOfUseGroupId}
              role="button"
              tabIndex={0}
              onClick={() => {
                const firstType = allTypes.find(
                  (t) => String(t.typeOfUseGroupId) === groupApiId
                );
                const firstTypeId = firstType ? getTypeApiId(firstType) : "";
                onGroupSelect(groupApiId, firstTypeId);
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).click();
                }
              }}
              className={clsx(
                "min-w-[230px] cursor-pointer select-none rounded-xl border px-3 py-2 text-left shadow-sm transition",
                selected
                  ? "border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="flex items-start gap-3 h-full">
                <div
                  className={clsx(
                    "rounded-lg p-2",
                    selected
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <GroupNameLabel name={g.groupName} />

                    <div className="flex gap-2 shrink-0">
                      <EditButton
                        size="sm"
                        title={t('buttons.edit') + ' ' + t('group.title')}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/${locale}/property-tax/typeofusemaster/group/edit/${encodeURIComponent(
                              groupIdForRoute
                            )}`
                          );
                        }}
                      />
                      <DeleteButton
                        size="sm"
                        title={t('buttons.delete') + ' ' + t('group.title')}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGroup(g);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-1 text-xs flex items-center gap-2">
                    <span className="text-slate-600">
                      {typesCount} {t('type.title')}
                    </span>
                    <StatusBadge value={g.status ?? "Active"} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
