"use client"
import { AddButton, Input, Tabs } from "@/components/common"
import { Label } from "@/components/common/label"
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {    
    SocietyFormProps,
    UpdatePropertySocietyDetailsDto
} from "@/types/property-society-details.types";

import { updatePropertySocietyDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action";
import { toast } from "sonner";
import { useState } from "react";
import { useConfirm } from "@/components/common/ConfirmProvider";

import { societyValidations, validateForm, hasErrors } from "@/lib/utils/validation";
import { useEffect, useRef } from "react";

const SocietyForm = ({ societyData, propertyIdSearch, locale }: SocietyFormProps) => {

    const t = useTranslations("quickDataEntry");
    const router = useRouter();
    const { confirm } = useConfirm();
    const [isUpdating, setIsUpdating] = useState(false);

    // Mobile States
    const initialManagerMobile = (societyData?.managerMobileNo ?? "").replace(/\D/g, "").split("").slice(0, 10);
    const [managerMobileDigits, setManagerMobileDigits] = useState<string[]>(
        Array.from({ length: 10 }, (_, i) => initialManagerMobile[i] ?? "")
    );

    const initialSecretaryMobile = (societyData?.secretaryMobileNo ?? "").replace(/\D/g, "").split("").slice(0, 10);
    const [secretaryMobileDigits, setSecretaryMobileDigits] = useState<string[]>(
        Array.from({ length: 10 }, (_, i) => initialSecretaryMobile[i] ?? "")
    );

    const formRef = useRef<HTMLFormElement>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const checkFormChanges = () => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);

        const societyName = String(formData.get("societyName") ?? "").trim();
        const societyAddress = String(formData.get("societyAddress") ?? "").trim();
        const societyEmailId = String(formData.get("societyEmailId") ?? "").trim();

        const managerName = String(formData.get("managerName") ?? "").trim();
        const managerEmailId = String(formData.get("managerEmailId") ?? "").trim();
        const managerMobileStr = managerMobileDigits.join("");

        const secretaryName = String(formData.get("secretaryName") ?? "").trim();
        const secretaryEmailId = String(formData.get("secretaryEmailId") ?? "").trim();
        const secretaryMobileStr = secretaryMobileDigits.join("");

        const landOwnerName = String(formData.get("landOwnerName") ?? "").trim();
        const builderName = String(formData.get("builderName") ?? "").trim();

        const isChanged =
            (landOwnerName || "") !== (societyData?.landOwnerName || "") ||
            (builderName || "") !== (societyData?.builderName || "") ||
            (societyName || "") !== (societyData?.societyName || "") ||
            (societyAddress || "") !== (societyData?.societyAddress || "") ||
            (societyEmailId || "") !== (societyData?.societyEmailId || "") ||
            (managerName || "") !== (societyData?.managerName || "") ||
            (managerEmailId || "") !== (societyData?.managerEmailId || "") ||
            (managerMobileStr || "") !== (societyData?.managerMobileNo || "") ||
            (secretaryName || "") !== (societyData?.secretaryName || "") ||
            (secretaryEmailId || "") !== (societyData?.secretaryEmailId || "") ||
            (secretaryMobileStr || "") !== (societyData?.secretaryMobileNo || "");

        setHasChanges(isChanged);
    };

    useEffect(() => {
        checkFormChanges();
    }, [managerMobileDigits, secretaryMobileDigits]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const pid = societyData?.propertyId || propertyIdSearch;

        const societyName = String(formData.get("societyName") ?? "").trim();
        const societyAddress = String(formData.get("societyAddress") ?? "").trim();
        const societyEmailId = String(formData.get("societyEmailId") ?? "").trim();

        const managerName = String(formData.get("managerName") ?? "").trim();
        const managerEmailId = String(formData.get("managerEmailId") ?? "").trim();
        const managerMobileStr = managerMobileDigits.join("");

        const secretaryName = String(formData.get("secretaryName") ?? "").trim();
        const secretaryEmailId = String(formData.get("secretaryEmailId") ?? "").trim();
        const secretaryMobileStr = secretaryMobileDigits.join("");

        const landOwnerName = String(formData.get("landOwnerName") ?? "").trim();
        const builderName = String(formData.get("builderName") ?? "").trim();

        const validationSchema = {
            landOwnerName: societyValidations.personName("landOwnerName", t),
            builderName: societyValidations.personName("builderName", t),
            managerName: societyValidations.personName("managerName", t),
            secretaryName: societyValidations.personName("secretaryName", t),

            societyEmailId: societyValidations.email("societyEmail", t),
            managerEmailId: societyValidations.email("managerEmail", t),
            secretaryEmailId: societyValidations.email("secretaryEmail", t),

            managerMobileStr: societyValidations.mobile10("managerMobile", t),
            secretaryMobileStr: societyValidations.mobile10("secretaryMobile", t),
        };

        const errors = validateForm(
            {
                landOwnerName,
                builderName,
                managerName,
                secretaryName,
                societyEmailId,
                managerEmailId,
                secretaryEmailId,
                managerMobileStr,
                secretaryMobileStr,
            },
            validationSchema
        );

        if (hasErrors(errors)) {
            toast.error(Object.values(errors)[0]);
            return;
        }

        const payload: UpdatePropertySocietyDetailsDto = {
            propertyId: pid,
            societyDetailId: societyData?.societyDetailId ?? null,
            wingId: societyData?.wingId ?? null,
            wingNo: societyData?.wingNo ?? null,
            wingName: societyData?.wingName ?? null,
            societyName: societyName || null,
            societyAddress: societyAddress || null,
            societyEmailId: societyEmailId || null,

            managerName: managerName || null,
            managerEmailId: managerEmailId || null,
            managerMobileNo: managerMobileStr || null,

            secretaryName: secretaryName || null,
            secretaryEmailId: secretaryEmailId || null,
            secretaryMobileNo: secretaryMobileStr || null,

            landOwnerName: landOwnerName || null,
            builderName: builderName || null,

            societyNameEnglish: societyName || null,
            societyAddressEnglish: societyAddress || null,
            secretaryNameEnglish: secretaryName || null,
            managerNameEnglish: managerName || null,
            landOwnerNameEnglish: landOwnerName || null,
            builderNameEnglish: builderName || null,
        };

        confirm({
            variant: "update",
            title: t("society.updateConfirmTitle"),
            description: t("society.updateConfirmText"),
            confirmText: t("society.updateConfirmButton"),
            onConfirm: async () => {
                setIsUpdating(true);
                try {
                    const result = await updatePropertySocietyDetailsAction(locale, pid, payload);

                    if (!result?.success) {
                        console.error("Submission error:", result?.error);
                        toast.error(result?.error || t("society.updateError"));
                        return;
                    }

                    toast.success(t("society.updateSuccess"));
                    router.refresh();
                } catch (err) {
                    console.error("Submission error:", err);
                    toast.error(t("society.updateError"));
                } finally {
                    setIsUpdating(false);
                }
            },
        });
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} onChange={checkFormChanges} noValidate>
            <Tabs value="society">
                <Tabs.TabPanel value="society" className="mt-0 p-4 space-y-3">
                    <div className="bg-white rounded-xl shadow-md border-2 border-purple-100 p-4">

                        <h3 className="text-sm font-bold text-purple-800 mb-3 pb-2 border-b-2 border-purple-200">
                            {t('society.title')}
                        </h3>

                        <div className="grid grid-cols-3 gap-x-4 gap-y-3">

                            {/* Row 1: Land Owner | Builder Name | Building/Society Name */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    {t('society.landOwner')}
                                </Label>
                                <Input
                                    name="landOwnerName"
                                    defaultValue={societyData?.landOwnerName ?? ''}
                                    placeholder={t('society.landOwnerPlaceholder')}
                                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    {t('society.builderName')}
                                </Label>
                                <Input
                                    name="builderName"
                                    defaultValue={societyData?.builderName ?? ''}
                                    placeholder={t('society.builderNamePlaceholder')}
                                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    {t('society.buildingSocietyName')}
                                </Label>
                                <Input
                                    name="societyName"
                                    defaultValue={societyData?.societyName ?? ''}
                                    placeholder={t('society.buildingSocietyNamePlaceholder')}
                                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            {/* Row 2: Society Email & Society Address (side by side) */}
                            <div className="col-span-3 grid grid-cols-2 gap-4">
                                {/* Society Email */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700">
                                        {t('society.societyEmail')}
                                    </Label>
                                    <Input
                                        name="societyEmailId"
                                        type="email"
                                        defaultValue={societyData?.societyEmailId ?? ''}
                                        placeholder={t('society.societyEmailPlaceholder')}
                                        className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />
                                </div>

                                {/* Society Address */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700">
                                        {t('society.societyAddress')}
                                    </Label>
                                    <Input
                                        name="societyAddress"
                                        defaultValue={societyData?.societyAddress ?? ''}
                                        placeholder={t('society.societyAddressPlaceholder')}
                                        className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Manager Name | Manager Email | Manager Mobile No */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    {t('society.managerName')}
                                </Label>
                                <Input
                                    name="managerName"
                                    defaultValue={societyData?.managerName ?? ''}
                                    placeholder={t('society.managerNamePlaceholder')}
                                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    {t('society.managerEmail')}
                                </Label>
                                <Input
                                    name="managerEmailId"
                                    type="email"
                                    defaultValue={societyData?.managerEmailId ?? ''}
                                    placeholder={t('society.managerEmailPlaceholder')}
                                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            <div className="space-y-1.5" id="manager-mobile-container">
                                <Label htmlFor="manager-mobile-0" className="text-xs font-semibold text-gray-700">
                                    {t('society.managerMobileNo')}
                                </Label>

                                <div className="flex items-center gap-1 p-1 bg-white border border-purple-200 rounded-md h-10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200">
                                    <span className="flex shrink-0 items-center justify-center w-10 h-7 text-[10px] font-semibold text-gray-600 bg-gray-50 border border-purple-100 rounded-md">
                                        +91
                                    </span>

                                    <div className="flex items-center justify-between flex-1 min-w-0 gap-1">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <Input
                                                key={i}
                                                id={i === 0 ? 'manager-mobile-0' : undefined}
                                                type="text"
                                                maxLength={1}
                                                inputMode="numeric"
                                                pattern="[0-9]"
                                                value={managerMobileDigits[i]}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 1);

                                                    setManagerMobileDigits((prev) => {
                                                        const next = [...prev];
                                                        next[i] = val;
                                                        return next;
                                                    });

                                                    if (val) {
                                                        const container = document.getElementById('manager-mobile-container');
                                                        const inputs = container?.querySelectorAll('input');
                                                        if (inputs && inputs[i + 1]) {
                                                            (inputs[i + 1] as HTMLInputElement).focus();
                                                        }
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !managerMobileDigits[i]) {
                                                        const container = document.getElementById('manager-mobile-container');
                                                        const inputs = container?.querySelectorAll('input');
                                                        if (inputs && inputs[i - 1]) {
                                                            (inputs[i - 1] as HTMLInputElement).focus();
                                                        }
                                                    }
                                                }}
                                                className=" h-7 w-7 sm:w-7 shrink-0 px-0 py-0 text-center text-xs font-semibold text-gray-900 border border-gray-200 rounded-md bg-white shadow-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 hover:border-gray-300"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Secretary Name | Secretary Email | Secretary Mobile */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    {t('society.secretaryName')}
                                </Label>
                                <Input
                                    name="secretaryName"
                                    defaultValue={societyData?.secretaryName ?? ''}
                                    placeholder={t('society.secretaryNamePlaceholder')}
                                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    {t('society.secretaryEmail')}
                                </Label>
                                <Input
                                    name="secretaryEmailId"
                                    type="email"
                                    defaultValue={societyData?.secretaryEmailId ?? ''}
                                    placeholder={t('society.secretaryEmailPlaceholder')}
                                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            <div className="space-y-1.5" id="secretary-mobile-container">
                                <Label htmlFor="secretary-mobile-0" className="text-xs font-semibold text-gray-700">
                                    {t('society.secretaryMobile')}
                                </Label>

                                <div className="flex items-center gap-1 p-1 bg-white border border-purple-200 rounded-md h-10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200">
                                    <span className="flex shrink-0 items-center justify-center w-10 h-7 text-[10px] font-semibold text-gray-600 bg-gray-50 border border-purple-100 rounded-md">
                                        +91
                                    </span>

                                    <div className="flex items-center justify-between flex-1 min-w-0 gap-1">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <Input
                                                key={i}
                                                id={i === 0 ? "secretary-mobile-0" : undefined}
                                                type="text"
                                                maxLength={1}
                                                inputMode="numeric"
                                                pattern="[0-9]"
                                                value={secretaryMobileDigits[i]}
                                                onChange={(e) => {
                                                      const val = e.target.value.replace(/\D/g, "").slice(0, 1);
                                                    setSecretaryMobileDigits(prev => {
                                                        const next = [...prev];
                                                        next[i] = val;
                                                        return next;
                                                    });
                                                    if (val) {
                                                        const container = document.getElementById('secretary-mobile-container');
                                                        const inputs = container?.querySelectorAll('input');
                                                        if (inputs && inputs[i + 1]) {
                                                            (inputs[i + 1] as HTMLInputElement).focus();
                                                        }
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !secretaryMobileDigits[i]) {
                                                        const container = document.getElementById('secretary-mobile-container');
                                                        const inputs = container?.querySelectorAll('input');
                                                        if (inputs && inputs[i - 1]) {
                                                            (inputs[i - 1] as HTMLInputElement).focus();
                                                        }
                                                    }
                                                }}
                                                className=" h-7 w-7 sm:w-7 shrink-0 px-0 py-0 text-center text-xs font-semibold text-gray-900 border border-gray-200 rounded-md bg-white shadow-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 hover:border-gray-300"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <AddButton
                                label={isUpdating ? t('footer.saving') : t('common.saveChanges')}
                                type="submit"
                                isLoading={isUpdating}
                                disabled={isUpdating || !hasChanges}
                            />
                        </div>
                    </div>
                </Tabs.TabPanel>
            </Tabs>
        </form>
    );
};

export default SocietyForm;