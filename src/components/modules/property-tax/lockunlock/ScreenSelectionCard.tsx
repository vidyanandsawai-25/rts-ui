import React, { useState, useMemo, useEffect, useRef } from "react";
import { Layers, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Checkbox, SearchSelect } from "@/components/common";
import { ClearButton, SelectAllButton } from "@/components/common/ActionButtons";
import { LockedScreen } from "@/types/lockunlock.types";
import { useTranslations } from "next-intl";
import { useQueryTransition } from "@/hooks/useQueryTransition";
import { cn } from "@/lib/utils/cn";

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
    const { updateQueries, searchParams } = useQueryTransition();

    const screenSearchFromUrl = searchParams.get("screenSearch") || "";
    const screenModuleFromUrl = searchParams.get("screenModule") || "ALL";

    const [searchTerm, setSearchTerm] = useState(screenSearchFromUrl);
    const [prevScreenSearchFromUrl, setPrevScreenSearchFromUrl] = useState(screenSearchFromUrl);
    const isFirstRender = useRef(true);

    // Sync local search term if URL changes from outside (e.g. clear filters)
    if (screenSearchFromUrl !== prevScreenSearchFromUrl) {
        setPrevScreenSearchFromUrl(screenSearchFromUrl);
        setSearchTerm(screenSearchFromUrl);
    }

    // Debounce updating URL query parameters for screenSearch
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            updateQueries({ screenSearch: searchTerm || null });
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, updateQueries]);

    const selectedModule = screenModuleFromUrl;

    // Helper function to extract a clean group/module prefix from screenCode
    const getScreenModule = (code: string) => {
        if (!code) return "OTHERS";
        const underscoreIndex = code.indexOf("_");
        if (underscoreIndex > 0) {
            return code.substring(0, underscoreIndex).toUpperCase();
        }
        if (code.match(/^S\d+$/i)) return "SYSTEM";
        if (code.length <= 5) return code.toUpperCase();
        return "GENERAL";
    };

    // Generate unique module classifications for dropdown
    const moduleOptions = useMemo(() => {
        const modules = new Set<string>();
        screens.forEach((s) => {
            modules.add(getScreenModule(s.screenCode));
        });
        const options = Array.from(modules).map((m) => ({
            label: m,
            value: m,
        }))
        return [
            { label: t("screenSelectionCard.allTypes") || "All Types", value: "ALL" },
            ...options.sort((a, b) => a.label.localeCompare(b.label)),
        ];
    }, [screens, t]);
    // Derived list of filtered screens based on inputs
    const filteredScreens = useMemo(() => {
        return screens.filter((screen) => {
            const matchesSearch =
                screen.screenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                screen.screenCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesModule =
                selectedModule === "ALL" ||
                getScreenModule(screen.screenCode) === selectedModule;
            return matchesSearch && matchesModule;
        });
    }, [screens, searchTerm, selectedModule]);
    // Select all currently visible filtered screens
    const handleSelectAllFiltered = () => {
        const filteredIds = filteredScreens.map((s) => s.id);
        setSelectedScreenIds((prev) => {
            const uniqueIds = new Set([...prev, ...filteredIds]);
            return Array.from(uniqueIds);
        });
    };
    // Clear selection on currently visible filtered screens only
    const handleClearAllFiltered = () => {
        const filteredIds = new Set(filteredScreens.map((s) => s.id));
        setSelectedScreenIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    };
    return (
        <Card className="rounded-xl shadow-sm border border-slate-200/80 overflow-visible h-full flex flex-col justify-between">
            <div>
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <CardTitle className="text-sm font-bold text-slate-800">{t("screenSelectionCard.title")}</CardTitle>
                        <p className="text-xs text-slate-500 font-medium">
                            {t("screenSelectionCard.helperText")}
                        </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {t("screenSelectionCard.selectedCount", { count: selectedScreenIds.length })}
                    </span>
                </CardHeader>
                <CardContent className="px-6 py-2 space-y-4">
                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t("screenSelectionCard.searchPlaceholder")}
                                className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-150"
                            />
                        </div>
                        <div className="w-full sm:w-[180px]">
                            <SearchSelect
                                options={moduleOptions}
                                value={selectedModule}
                                onChange={(_, value) => {
                                    updateQueries({ screenModule: value === "ALL" ? null : value });
                                }}
                                placeholder={t("screenSelectionCard.typeOfUse")}
                                disableSearch={true}
                            />
                        </div>
                        {/* Bulk Selection Actions */}
                        <div className="flex gap-3">
                            <SelectAllButton
                                label={t("screenSelectionCard.selectAll")}
                                onClick={handleSelectAllFiltered}
                                disabled={screens.length === 0}
                                className="w-fit"
                            />
                            <ClearButton
                                label={t("screenSelectionCard.clearAll")}
                                onClick={handleClearAllFiltered}
                                disabled={screens.length === 0}
                                className="w-fit"
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200/80 rounded-xl p-2 bg-slate-50/20 max-h-[300px] overflow-auto custom-scrollbar">
                        {screens.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">{t("screenSelectionCard.noScreens")}</p>
                        ) : filteredScreens.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">{t("screenSelectionCard.noScreens")}</p>
                        ) : (
                            <div className="min-w-max">
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredScreens.map((screen) => {
                                        const isChecked = selectedScreenIds.includes(screen.id);
                                        const badgeCode = getScreenModule(screen.screenCode);
                                        return (
                                            <div
                                                key={screen.id}
                                                onClick={() => {
                                                    setSelectedScreenIds((prev) =>
                                                        isChecked
                                                            ? prev.filter((id) => id !== screen.id)
                                                            : [...prev, screen.id]
                                                    );
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none w-full",
                                                    isChecked
                                                        ? "border-blue-200 bg-blue-50/10 shadow-sm"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/30"
                                                )}
                                            >
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        id={`screen-${screen.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedScreenIds((prev) =>
                                                                checked
                                                                    ? [...prev, screen.id]
                                                                    : prev.filter((id) => id !== screen.id)
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider min-w-[36px] justify-center shrink-0">
                                                    {badgeCode}
                                                </span>
                                                <label
                                                    htmlFor={`screen-${screen.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 text-sm font-semibold text-slate-700 truncate cursor-pointer"
                                                >
                                                    {screen.screenName}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
