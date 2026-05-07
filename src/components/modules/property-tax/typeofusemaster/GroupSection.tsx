import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AddButton, DeleteButton, EditButton } from "@/components/common";
import { StatusBadge } from "@/components/common/StatusBadge";
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto">
        {groups.map((g: UseGroup) => {
          const Icon = getIconComponent(getIconKey(g.groupIcon));
          const selected = g.typeOfUseGroupId === selectedGroupId;
          const typesCount = countTypesForGroup(g, allTypes);
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
                    selected
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">
                      {g.groupName}
                    </div>

                    <div className="flex gap-2">
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

        <AddButton
          label={t('group.add')}
          onClick={() =>
            router.push(`/${locale}/property-tax/typeofusemaster/group/add`)
          }
          className="ml-auto"
        />
      </div>
    </div>
  );
}
