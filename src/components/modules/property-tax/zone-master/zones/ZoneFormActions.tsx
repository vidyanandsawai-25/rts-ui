import { ZoneFormState, ZoneFormErrors } from "./ZoneFormFields";
import { ZoneItem } from "@/types/zoneMaster.types";
import { handleZoneCreate, handleZoneUpdate } from "./zoneHandlers";

interface AddModeActionsProps {
  mode: "add";
  form: ZoneFormState;
  validate: (data: ZoneFormState) => ZoneFormErrors;
  checkDuplicateZone: (zoneNo: string, zoneName: string, currentZoneId?: number) => boolean;
  setErrors: (errors: ZoneFormErrors) => void;
  setLoading: (loading: boolean) => void;
  resetForm: () => void;
  onSuccess?: (newZoneNo: string) => void;
  handleClose: () => void;
  refreshRouter: () => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

interface EditModeActionsProps {
  mode: "edit";
  form: ZoneFormState;
  zoneId: string;
  validate: (data: ZoneFormState) => ZoneFormErrors;
  checkDuplicateZone: (zoneNo: string, zoneName: string, currentZoneId?: number) => boolean;
  setErrors: (errors: ZoneFormErrors) => void;
  setLoading: (loading: boolean) => void;
  resetForm: () => void;
  onUpdate?: (updatedZone: ZoneItem) => void;
  handleClose: () => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

type ZoneFormActionsProps = AddModeActionsProps | EditModeActionsProps;

export async function handleZoneFormSave(props: ZoneFormActionsProps): Promise<void> {
  const {
    mode,
    form,
    validate,
    checkDuplicateZone,
    setErrors,
    setLoading,
    handleClose,
    t,
  } = props;

  if (mode === "add") {
    const { resetForm, onSuccess, refreshRouter } = props as AddModeActionsProps;

    const validationErrors = validate(form);
    setErrors(validationErrors);

    const isDuplicate = checkDuplicateZone(form.zoneNo, form.description);
    if (Object.keys(validationErrors).length > 0 || isDuplicate) return;

    setLoading(true);
    const result = await handleZoneCreate({ 
      zoneData: { ...form }, 
      t: (key: string, values?: Record<string, unknown>) => t(key, values) 
    });

    if (result.success) {
      const newZoneNo = form.zoneNo;

      resetForm();

      if (onSuccess) {
        onSuccess(newZoneNo);
      }
      handleClose();
      refreshRouter();
    } else if (result.isDuplicate) {
      setErrors({ zoneNo: t("messages.duplicateZoneNo", { zoneNo: form.zoneNo }) });
    }
    setLoading(false);
  } else {
    const { zoneId, onUpdate } = props as EditModeActionsProps;

    const validationErrors = validate(form);
    setErrors(validationErrors);

    const currentZoneId = parseInt(zoneId, 10);
    const isDuplicate = checkDuplicateZone(form.zoneNo, form.description, currentZoneId);
    if (Object.keys(validationErrors).length > 0 || isDuplicate) return;

    setLoading(true);
    const result = await handleZoneUpdate({ 
      zoneId: Number(zoneId), 
      zoneData: form, 
      t: (key: string, values?: Record<string, unknown>) => t(key, values) 
    });

    if (result.success) {
      const updatedZone: Partial<ZoneItem> & { id: number } = {
        id: Number(zoneId),
        ...form
      };

      onUpdate?.(updatedZone as ZoneItem);
      handleClose();
    }
    setLoading(false);
  }
}
