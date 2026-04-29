import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { PropertySocietyDetailsApiItem } from "@/types/property-society-details.types";

interface SocietyContactFieldsProps {
    t: (key: string) => string;
    societyData: PropertySocietyDetailsApiItem | null;
    managerMobileDigits: string[];
    setManagerMobileDigits: (val: (prev: string[]) => string[]) => void;
    secretaryMobileDigits: string[];
    setSecretaryMobileDigits: (val: (prev: string[]) => string[]) => void;
}

export const SocietyContactFields = ({
    t,
    societyData,
    managerMobileDigits,
    setManagerMobileDigits,
    secretaryMobileDigits,
    setSecretaryMobileDigits,
}: SocietyContactFieldsProps) => {
    return (
        <>
            {/* Manager Details */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">{t('society.managerName')}</Label>
                <Input
                    name="managerName"
                    defaultValue={societyData?.managerName ?? ''}
                    placeholder={t('society.managerNamePlaceholder')}
                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">{t('society.managerEmail')}</Label>
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
                    <span className="flex shrink-0 items-center justify-center w-10 h-7 text-[10px] font-semibold text-gray-600 bg-gray-50 border border-purple-100 rounded-md">+91</span>
                    <div className="flex items-center justify-between flex-1 min-w-0 gap-1">
                        {managerMobileDigits.map((digit, i) => (
                            <Input
                                key={i}
                                id={i === 0 ? 'manager-mobile-0' : undefined}
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                                    setManagerMobileDigits((prev: string[]) => {
                                        const next = [...prev];
                                        next[i] = val;
                                        return next;
                                    });
                                    if (val) {
                                        const container = document.getElementById('manager-mobile-container');
                                        const inputs = container?.querySelectorAll('input');
                                        if (inputs && inputs[i + 1]) (inputs[i + 1] as HTMLInputElement).focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !managerMobileDigits[i]) {
                                        const container = document.getElementById('manager-mobile-container');
                                        const inputs = container?.querySelectorAll('input');
                                        if (inputs && inputs[i - 1]) (inputs[i - 1] as HTMLInputElement).focus();
                                    }
                                }}
                                className="h-7 w-7 shrink-0 px-0 py-0 text-center text-xs font-semibold border border-gray-200 rounded-md focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Secretary Details */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">{t('society.secretaryName')}</Label>
                <Input
                    name="secretaryName"
                    defaultValue={societyData?.secretaryName ?? ''}
                    placeholder={t('society.secretaryNamePlaceholder')}
                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">{t('society.secretaryEmail')}</Label>
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
                    <span className="flex shrink-0 items-center justify-center w-10 h-7 text-[10px] font-semibold text-gray-600 bg-gray-50 border border-purple-100 rounded-md">+91</span>
                    <div className="flex items-center justify-between flex-1 min-w-0 gap-1">
                        {secretaryMobileDigits.map((digit, i) => (
                            <Input
                                key={i}
                                id={i === 0 ? 'secretary-mobile-0' : undefined}
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                                    setSecretaryMobileDigits((prev: string[]) => {
                                        const next = [...prev];
                                        next[i] = val;
                                        return next;
                                    });
                                    if (val) {
                                        const container = document.getElementById('secretary-mobile-container');
                                        const inputs = container?.querySelectorAll('input');
                                        if (inputs && inputs[i + 1]) (inputs[i + 1] as HTMLInputElement).focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !secretaryMobileDigits[i]) {
                                        const container = document.getElementById('secretary-mobile-container');
                                        const inputs = container?.querySelectorAll('input');
                                        if (inputs && inputs[i - 1]) (inputs[i - 1] as HTMLInputElement).focus();
                                    }
                                }}
                                className="h-7 w-7 shrink-0 px-0 py-0 text-center text-xs font-semibold border border-gray-200 rounded-md focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
