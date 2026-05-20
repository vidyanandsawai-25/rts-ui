"use client";

import React from "react";
import { MultiSelectDropdown, SearchSelect, ToggleSwitch } from "@/components/common";
import type { SupportedLanguageCode } from "@/types/alias-master.types";
import { SUPPORTED_LANGUAGE_CODES } from "@/types/alias-master.types";

interface Option {
    label: string;
    value: string;
}

interface LocalizationStringsFiltersProps {
    t: (key: string) => string;
    resource?: string;
    resourceOptions: Option[];
    languages: SupportedLanguageCode[];
    languageOptions: Option[];
    autoTranslationEnabled: boolean;
    autoTranslate: boolean;
    onResourceChange: (resource: string) => void;
    onLanguagesChange: (languages: SupportedLanguageCode[]) => void;
    onAutoTranslateChange: (enabled: boolean) => void;
}

export function LocalizationStringsFilters({
    t,
    resource,
    resourceOptions,
    languages,
    languageOptions,
    autoTranslationEnabled,
    autoTranslate,
    onResourceChange,
    onLanguagesChange,
    onAutoTranslateChange,
}: LocalizationStringsFiltersProps): React.ReactElement {
    return (
        <div className="flex flex-col md:flex-row md:items-start gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="w-full md:w-64">
                <SearchSelect
                    label={t("filters.resourceFile")}
                    value={resource ?? ""}
                    onChange={(_, value) => onResourceChange(value)}
                    options={resourceOptions}
                    placeholder={t("filters.selectResource")}
                />
            </div>
            <div className="w-full md:w-64">
                <MultiSelectDropdown
                    label={t("filters.targetLocale")}
                    value={languages}
                    onChange={(values) =>
                        onLanguagesChange(
                            values.filter((v): v is SupportedLanguageCode =>
                                (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(v)
                            )
                        )
                    }
                    options={languageOptions}
                    placeholder={t("filters.filterLanguage")}
                />
            </div>
            <div className="flex flex-col gap-1.5 md:ml-auto md:pt-0.5">
                <span className="text-sm font-medium text-gray-700">
                    {t("filters.autoTranslation")}
                </span>
                <ToggleSwitch
                    checked={autoTranslationEnabled && autoTranslate}
                    disabled={!autoTranslationEnabled}
                    onChange={onAutoTranslateChange}
                    activeLabel={t("filters.autoTranslationOn")}
                    inactiveLabel={t("filters.autoTranslationOff")}
                />
            </div>
        </div>
    );
}
