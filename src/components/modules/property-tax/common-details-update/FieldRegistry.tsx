"use client";

import { useFieldRegistryState } from "@/hooks/commonDetailsUpdate/useFieldRegistryState";
import { FieldRegistryForm } from "./FieldRegistryForm";
import { FieldRegistryStats } from "./FieldRegistryStats";
import { FieldRegistryTable } from "./FieldRegistryTable";
import { BulkUpdateMaster } from "@/types/common-details-update/common-details-update.types";

interface FieldRegistryProps {
  t: (key: string) => string;
  initialFields?: BulkUpdateMaster[];
}

export const FieldRegistry = ({ t, initialFields = [] }: FieldRegistryProps) => {
  const state = useFieldRegistryState(initialFields);

  return (
    <div className="space-y-4">
      {/* 1. Add Field Config Form Card (Single Responsive Row, Save button in header) */}
      <FieldRegistryForm t={t} state={state} />

      {/* 2. Stats Row */}
      <FieldRegistryStats t={t} fields={state.fields} />

      {/* 3. Paginated MasterTable List */}
      <FieldRegistryTable t={t} state={state} />
    </div>
  );
};

export default FieldRegistry;
