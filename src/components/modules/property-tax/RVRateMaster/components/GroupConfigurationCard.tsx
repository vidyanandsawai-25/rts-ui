"use client";

import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { SaveButton, AddButton, UpdateButton } from "@/components/common/ActionButtons";
import { SearchSelect } from "@/components/common/SearchSelect";
import { Input } from "@/components/common/Input";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { GroupIconSelector } from "../../typeofusemaster/GroupIconSelector";
import type { ITypeOfUseDetails } from "@/types/RVRateMaster";
import type { UseGroup } from "@/types/typeOfUse.types";

interface GroupFormState {
  code: string;
  name: string;
  icon: string;
  errors: {
    code?: string;
    name?: string;
  };
  isSaved: boolean;
  isSaving: boolean;
  selectedExistingGroupId?: string;
  isMappingExisting: boolean;
}

interface GroupConfigurationCardProps {
  typeofuse: ITypeOfUseDetails;
  form: GroupFormState;
  existingGroups: UseGroup[];
  handleSelectExistingGroup: (id: number, val: string) => void;
  handleToggleMode: (id: number) => void;
  handleFieldChange: (id: number, field: 'code' | 'name' | 'icon', val: string) => void;
  handleSaveGroup: (id: number, tu: ITypeOfUseDetails) => void;
  isOpenPlot?: boolean;
}

export function GroupConfigurationCard({
  typeofuse,
  form,
  existingGroups,
  handleSelectExistingGroup,
  handleToggleMode,
  handleFieldChange,
  handleSaveGroup,
}: GroupConfigurationCardProps) {
  if (!form) return null;

  const isFormValid = () => {
    if (form.isMappingExisting) {
      return !!form.selectedExistingGroupId;
    }
    return (
      form.code.trim().length > 0 &&
      form.name.trim().length > 0 &&
      form.icon.trim().length > 0 &&
      Object.keys(form.errors).length === 0
    );
  };

  return (
    <Card variant="default" padding="md" className="bg-white border-[#DCEAFF]">
      {/* Title bar */}
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3 mb-4">
        <div className="flex items-center">
          <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 font-sans">
            {typeofuse.typeOfUseCode}
          </span>
          <CardTitle className="text-sm font-bold text-slate-800 font-sans">
            {typeofuse.description}
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {form.isSaved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 font-sans">
              <CheckCircle size={16} /> Saved
            </span>
          )}
          {!form.isSaving && typeofuse.typeOfUseCode !== 'OP' && (
            form.isMappingExisting ? (
              <AddButton
                size="sm"
                label="Create New Group"
                onClick={() => handleToggleMode(typeofuse.id)}
              />
            ) : (
              <UpdateButton
                size="sm"
                label="Update Use Group"
                onClick={() => handleToggleMode(typeofuse.id)}
              />
            )
          )}
        </div>
      </CardHeader>

      {typeofuse.typeOfUseCode === 'OP' ? (
        <CardContent className="flex flex-col gap-3 py-3 w-full">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 mb-1 font-sans">
              Associated Use Group (Open Plot only)
            </span>
            <span className="text-sm font-bold text-slate-800 font-sans bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
              {typeofuse.typeOfUseGroupCode || "N/A"} - {typeofuse.groupName || "N/A"}
            </span>
          </div>
        </CardContent>
      ) : form.isMappingExisting ? (
        <CardContent className="flex flex-col sm:flex-row items-end gap-4 w-full">
          <div className="flex flex-col flex-1 w-full">
            <SearchSelect
              label="Select Existing Group (Open Plot only)"
              options={existingGroups
                .filter(g => g.isOpenPlot)
                .map(g => ({
                  label: `${g.typeOfUseGroupCode} - ${g.groupName}`,
                  value: String(g.typeOfUseGroupId)
                }))}
              value={form.selectedExistingGroupId || ""}
              onChange={(_, val) => handleSelectExistingGroup(typeofuse.id, val)}
              placeholder="-- Select Group --"
              disabled={form.isSaving}
            />
          </div>

          <div className="self-stretch sm:self-auto flex items-end">
            <SaveButton
              label="Save"
              size="md"
              onClick={() => handleSaveGroup(typeofuse.id, typeofuse)}
              disabled={!form.selectedExistingGroupId || form.isSaved || form.isSaving}
              isLoading={form.isSaving}
              className="w-full sm:w-28 h-10"
            />
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col lg:flex-row items-start gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            {/* Group ID Code */}
            <div className="flex flex-col">
              <Input
                label="Group ID Code"
                name={`code_${typeofuse.id}`}
                value={form.code}
                onChange={(e) => handleFieldChange(typeofuse.id, 'code', e.target.value)}
                placeholder="e.g., RES, COM"
                required
                fullWidth
                disabled={form.isSaved || form.isSaving}
              />
              <ValidationMessage
                message={form.errors.code}
                visible={!!form.errors.code}
              />
            </div>

            {/* Group Name */}
            <div className="flex flex-col">
              <Input
                label="Group Name"
                name={`name_${typeofuse.id}`}
                value={form.name}
                onChange={(e) => handleFieldChange(typeofuse.id, 'name', e.target.value)}
                placeholder="e.g., Residential"
                required
                fullWidth
                disabled={form.isSaved || form.isSaving}
              />
              <ValidationMessage
                message={form.errors.name}
                visible={!!form.errors.name}
              />
            </div>

            {/* Icon Type */}
            <div className="flex flex-col">
              <GroupIconSelector
                value={form.icon}
                onChange={(iconVal) => handleFieldChange(typeofuse.id, 'icon', iconVal)}
                label="Icon Type"
                required
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="lg:mt-[24px] self-stretch lg:self-start flex items-end">
            <SaveButton
              label="Save"
              size="md"
              onClick={() => handleSaveGroup(typeofuse.id, typeofuse)}
              disabled={!isFormValid() || form.isSaved || form.isSaving}
              isLoading={form.isSaving}
              className="w-full lg:w-28"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
