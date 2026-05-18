"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton } from "@/components/common";
import { ZoneItem } from "@/types/zoneMaster.types";
import { ZoneFormFields } from "./ZoneFormFields";
import { handleZoneFormSave } from "./ZoneFormActions";
import { useZoneForm } from "@/hooks/zoneMaster/useZoneForm";

interface AddModeProps {
  mode: "add";
  open: boolean;
  onClose: () => void;
  onSuccess?: (newZoneNo: string) => void;
  existingZones: ZoneItem[];
}

interface EditModeProps {
  mode: "edit";
  open: boolean;
  zoneId: string;
  zones?: ZoneItem[];
  onClose?: () => void;
  onUpdate?: (updatedZone: ZoneItem) => void;
  initialData?: ZoneItem | null;
  existingZones: ZoneItem[];
}

type Props = AddModeProps | EditModeProps;

export default function ZoneForm(props: Props) {
  const { mode, open, onClose } = props;
  const router = useRouter();
  const t = useTranslations("zoneMaster");

  const editInitialData = mode === "edit" ? (props as EditModeProps).initialData : undefined;
  const editZoneId = mode === "edit" ? (props as EditModeProps).zoneId : undefined;
  const editZones = mode === "edit" ? (props as EditModeProps).zones : undefined;

  const {
    form,
    setForm,
    loading,
    setLoading,
    fetching,
    errors,
    setErrors,
    validate,
    checkDuplicateZone,
    resetForm,
    handleBlur,
  } = useZoneForm({
    mode,
    open,
    zoneId: editZoneId,
    initialData: editInitialData,
    zones: editZones,
    existingZones: props.existingZones,
    t: (key: string, values?: Record<string, unknown>) => t(key, values as never),
  });

  const handleClose = () => {
    resetForm();
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    if (mode === "add") {
      handleZoneFormSave({
        mode: "add",
        form,
        validate,
        checkDuplicateZone,
        setErrors,
        setLoading,
        resetForm,
        onSuccess: props.onSuccess,
        handleClose,
        refreshRouter: () => router.refresh(),
        t: (key: string, values?: Record<string, unknown>) => t(key, values as never),
      });
    } else {
      handleZoneFormSave({
        mode: "edit",
        form,
        zoneId: props.zoneId,
        validate,
        checkDuplicateZone,
        setErrors,
        setLoading,
        resetForm,
        onUpdate: props.onUpdate,
        handleClose,
        t: (key: string, values?: Record<string, unknown>) => t(key, values as never),
      });
    }
  };

  const showActiveStatus = mode === "edit";

  // Drawer title based on mode
  const drawerTitle = (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
        <Layers size={20} />
      </div>
      <div>
        <div className="text-lg font-bold text-blue-900">
          {mode === "add" ? t("dialogs.addTitle") : t("dialogs.editTitle")}
        </div>
        <div className="text-sm text-slate-500">
          {mode === "add" ? t("dialogs.addDescription") : t("dialogs.editDescription")}
        </div>
      </div>
    </div>
  );

  // Derive validity from the current form state so the Save button updates immediately
  const validationErrors = validate(form);
  const isFormInvalid = Object.keys(validationErrors).length > 0;

  // Drawer footer based on mode
  const drawerFooter = (
    <>
      <CancelButton
        label={t("actions.cancel")}
        onClick={handleClose}
        disabled={loading || fetching}
      />
      <SaveButton
        label={
          loading
            ? mode === "add" ? t("actions.saving") : t("actions.updating")
            : mode === "add" ? t("actions.save") : t("actions.update")
        }
        onClick={handleSave}
        disabled={loading || fetching || isFormInvalid}
      />
    </>
  );

  return (
    <Drawer
      open={open}
      width="sm"
      title={drawerTitle}
      onClose={handleClose}
      footer={drawerFooter}
    >
      <div className="space-y-6 bg-[#F8FAFF] p-5">
        <ZoneFormFields
          data={form}
          onChange={setForm}
          onBlur={handleBlur}
          disabled={loading || fetching}
          errors={errors}
          showActiveStatus={showActiveStatus}
        />
      </div>
    </Drawer>
  );
}
