"use client";

import { useState, useEffect } from "react";
import { Edit, CheckCircle2, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { SaveButton, CancelButton, ToggleSwitch, Input, ValidationMessage } from "@/components/common";
import { updateRateSectionDetailAction, getWardByIdAction } from "@/app/[locale]/property-tax/rate-section-master/actions";
import { cn } from "@/lib/utils/cn";
import { EditWardData, EditWardProps, EditWardErrors } from "@/types/rateSectionMaster.types";

export default function EditWard({ open, onClose, id, wardId, sections, initialWardData }: EditWardProps) {
  const t = useTranslations("rateSectionMaster");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<EditWardData | null>(null);
  const [errors, setErrors] = useState<EditWardErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadWardData() {
      if (open && id) {
        const ward = sections.find(s => String(s.id) === id);
        if (ward) {
          // Get wardId from ward object or URL param - handle case-insensitive property names
          const rawWardId = ward.wardId ?? (ward as Record<string, unknown>)["WardId"];
          const actualWardId = typeof rawWardId === 'number' ? rawWardId : (wardId ? Number(wardId) : 0);
          
          // Try to get description from initialWardData first
          let wardDescription = initialWardData?.description || '';
          
          // If no description from initialWardData, try to fetch from Ward master
          if (!wardDescription && actualWardId) {
            try {
              const wardResult = await getWardByIdAction(actualWardId);
              if (wardResult.success && wardResult.data) {
                wardDescription = wardResult.data.description || '';
              }
            } catch {
              // Silent fail - use empty description
            }
          }
          
          setEditData({ 
            rateSectionId: ward.rateSectionId ?? 0, 
            id: Number(actualWardId) || 0, 
            wardNo: ward.wardNo ?? '',
            description: wardDescription, 
            isActive: ward.isActive ?? false 
          });
        }
      } else if (!open) { 
        setEditData(null); 
        setErrors({}); 
        setTouched({}); 
      }
    }
    loadWardData();
  }, [open, id, wardId, sections, initialWardData]);

  const validate = (): boolean => {
    if (!editData) return false;
    const newErrors: EditWardErrors = {};
    if (!editData.wardNo?.trim()) newErrors.wardNo = t('validation.required', { label: t('wards.wardNo') });
    if (!editData.description?.trim()) newErrors.description = t('validation.required', { label: t('form.description') });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => { setTouched(prev => ({ ...prev, [field]: true })); };
  const showError = (field: keyof EditWardErrors): boolean => touched[field] && !!errors[field];

  const handleSave = async () => {
    if (!id || !editData) return;
    setTouched({ wardNo: true, description: true });
    if (!validate()) { toast.error(t('error.fixValidation')); return; }
    setLoading(true);
    try {
      const result = await updateRateSectionDetailAction(Number(id), {
        isActive: editData.isActive, updatedBy: 0, rateSectionId: editData.rateSectionId, wardId: editData.id,
        wardNo: editData.wardNo, description: editData.description
      });
      if (result.success) { toast.success(t('wards.updateSuccess')); onClose(); router.refresh(); }
      else toast.error(result.message || result.error || t('wards.updateError'));
    } catch { toast.error(t('wards.updateError')); }
    setLoading(false);
  };

  return (
    <Drawer open={open} width="sm" onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Edit size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">{t("wards.editTitle")}</div>
            {editData && <div className="text-sm text-slate-500">{t("wards.editDescription")}</div>}
          </div>
        </div>
      }
      footer={<>
        <CancelButton label={t("actions.cancel")} onClick={onClose} disabled={loading} />
        <SaveButton label={loading ? t("actions.updating") : t("actions.update")} onClick={handleSave} disabled={loading || !editData} />
      </>}
    >
      {editData && (
        <div className="space-y-6 bg-[#F8FAFF] p-5">
          <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4">
            <div className={cn("rounded-xl p-2 flex items-center justify-between transition-colors",
              editData.isActive ? "border border-blue-200 bg-[#F0F6FF]" : "border border-gray-200 bg-gray-50")}>
              <div className="flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-full",
                  editData.isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500")}>
                  {editData.isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
                </div>
                <div>
                  <div className={cn("font-medium", editData.isActive ? "text-[#1E3A8A]" : "text-gray-700")}>
                    {t('wards.activeStatus')}
                  </div>
                  <div className={cn("text-sm", editData.isActive ? "text-gray-500" : "text-gray-400")}>
                    {editData.isActive ? t('wards.statusActive') : t('wards.statusInactive')}
                  </div>
                </div>
              </div>
              <ToggleSwitch checked={editData.isActive} onChange={(checked) => setEditData({ ...editData, isActive: checked })} showPopup={false} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md border-2 border-[#6F8EC0]/40 p-3">
            <Input label={t("wards.wardNo")} type="text" required value={editData.wardNo}
              placeholder={t("wards.wardNoPlaceholder")} onChange={e => setEditData({ ...editData, wardNo: e.target.value })}
              onBlur={() => handleBlur("wardNo")}
              data-testid="input-wards.wardno"
            />
            <ValidationMessage message={errors.wardNo} visible={showError("wardNo")} />
          </div>
          <div className="bg-white rounded-lg shadow-md border-2 border-[#6F8EC0]/40 p-3">
            <Input label={t("form.description")} type="text" required value={editData.description}
              placeholder={t("form.descriptionPlaceholder")} onChange={e => setEditData({ ...editData, description: e.target.value })}
              onBlur={() => handleBlur("description")}
              data-testid="input-form.description"
            />
            <ValidationMessage message={errors.description} visible={showError("description")} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            <AlertCircle size={16} />
            <span>{t('form.mandatoryFields')}</span>
          </div>
        </div>
      )}
    </Drawer>
  );
}

