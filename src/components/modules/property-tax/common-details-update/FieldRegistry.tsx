"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFieldRegistryState } from "@/hooks/commonDetailsUpdate/useFieldRegistryState";
import { FieldRegistryForm } from "./FieldRegistryForm";
import { FieldRegistryTable } from "./FieldRegistryTable";
import { EditFieldRegistryDrawer } from "./EditFieldRegistryDrawer";
import { PagedResponse } from "@/types/common.types";
import { BulkUpdateMaster, FieldRegistrySchema, ActionResult, FieldRegistryTable as FieldRegistryTableType, SourceTableField } from "@/types/common-details-update/common-details-update.types";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

interface FieldRegistryProps {
  t: (key: string) => string;
  initialFields?: PagedResponse<BulkUpdateMaster> | BulkUpdateMaster[];
  initialSchemas?: FieldRegistrySchema[];
  initialSourceTables?: FieldRegistryTableType[];
  initialSourceTableFields?: SourceTableField[];
  setFieldRegistryStatusAction?: (updateCode: string, isActive: boolean) => Promise<ActionResult<unknown>>;
  editUpdateCode?: string;
  initialEditData?: BulkUpdateMaster | null;
  actions?: Record<string, any>;
}

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT = {};

export const FieldRegistry = ({
  t,
  initialFields = EMPTY_ARRAY,
  initialSchemas = EMPTY_ARRAY,
  initialSourceTables = EMPTY_ARRAY,
  initialSourceTableFields = EMPTY_ARRAY,
  editUpdateCode,
  initialEditData = null,
  actions = EMPTY_OBJECT
}: FieldRegistryProps) => {
  const state = useFieldRegistryState(initialFields, initialSchemas as any, initialSourceTables, initialSourceTableFields, actions);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const handleCloseDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "fieldRegistry");
    // Redirect to the parent route: replace the /edit/[updateCode] route segment with parent url
    router.replace(`/${locale}/property-tax/common-details-update?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-2">
      {/* 1. Add Field Config Form Card (Single Responsive Row, Save button in header) */}
      <FieldRegistryForm t={t} state={state} />

      {/* 2. Paginated MasterTable List */}
      <FieldRegistryTable t={t} state={state} />

      {/* 3. Edit Drawer Modal */}
      <EditFieldRegistryDrawer
        t={t}
        updateCode={editUpdateCode}
        open={!!editUpdateCode}
        onClose={handleCloseDrawer}
        refreshFieldsList={state.refreshFieldsList}
        initialEditData={initialEditData}
        actions={actions as any}
      />
    </div>
  );
};

export default FieldRegistry;
