import React from "react";
import { Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Checkbox } from "@/components/common";
import { LockedScreen } from "@/types/loackunlock.types";
import { useTranslations } from "next-intl";

interface ScreenSelectionCardProps {
    screens: LockedScreen[];
    selectedScreenIds: number[];
    setSelectedScreenIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function ScreenSelectionCard({
    screens = [],
    selectedScreenIds,
    setSelectedScreenIds,
}: ScreenSelectionCardProps) {
    const t = useTranslations("lockUnlock");
    return (
        <Card className="rounded-xl shadow-sm border border-slate-200/80 overflow-visible">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <CardTitle className="text-sm font-bold text-slate-800">{t("screenSelectionCard.title")}</CardTitle>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t("screenSelectionCard.selectedCount", { count: selectedScreenIds.length })}
                </span>
            </CardHeader>
            <CardContent className="p-6">
                {screens.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">{t("screenSelectionCard.noScreens")}</p>
                ) : (
                    <div className="flex flex-wrap gap-x-6 gap-y-4">
                        {screens.map((screen) => {
                            const isChecked = selectedScreenIds.includes(screen.id);
                            return (
                                <Checkbox
                                    key={screen.id}
                                    id={`screen-${screen.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                        setSelectedScreenIds((prev) =>
                                            checked
                                                ? [...prev, screen.id]
                                                : prev.filter((id) => id !== screen.id)
                                        );
                                    }}
                                    label={screen.screenName}
                                />
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
