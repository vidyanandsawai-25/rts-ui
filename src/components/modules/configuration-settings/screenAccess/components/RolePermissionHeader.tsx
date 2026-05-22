'use client';

import { Info, Save, RotateCcw } from 'lucide-react';
import { Label } from '@/components/common/label';
import { Select } from '@/components/common/select';
import { Card } from '@/components/common/Card';
import { RoleMasterData } from '@/types/screen-access.types';

interface RolePermissionHeaderProps {
  selectedRole: string;
  roles: RoleMasterData[];
  pendingCount: number;
  isSaving: boolean;
  onRoleChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  translations: {
    selectRole: string;
    pendingChanges: string;
    saveChanges: string;
    cancelChanges: string;
  };
}

export function RolePermissionHeader({
  selectedRole,
  roles,
  pendingCount,
  isSaving,
  onRoleChange,
  onSave,
  onCancel,
  translations,
}: RolePermissionHeaderProps) {
  return (
    <Card className="p-6 mb-6 border-none shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="space-y-1.5 min-w-[240px]">
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {translations.selectRole}
          </Label>
          <Select
            value={selectedRole}
            onChange={(_, val) => onRoleChange(val)}
            options={roles.map((r) => ({ value: String(r.roleMasterId), label: r.roleName }))}
            ariaLabel={translations.selectRole}
            className="h-10 border-gray-200"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm font-medium animate-in fade-in slide-in-from-top-1">
            <Info className="w-4 h-4" />
            {translations.pendingChanges}
          </div>
        )}
        {pendingCount > 0 && (
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="h-10 px-6 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-md flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {translations.cancelChanges}
          </button>
        )}
        <button
          onClick={onSave}
          disabled={pendingCount === 0 || isSaving}
          className={`h-10 px-8 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md shadow-lg shadow-indigo-500/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isSaving ? 'cursor-wait' : ''
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {translations.saveChanges}
        </button>
      </div>
    </Card>
  );
}
