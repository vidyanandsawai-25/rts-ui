"use client";

//import React from "react";
import { Building } from "lucide-react";
import {
  CardHeader,
  CardTitle,
  CardContent,
  SearchSelect,
  SearchButton,
  ClearButton,
} from "@/components/common";
import { useTranslations } from "next-intl";
import { SEARCH_ALPHANUMERIC_SANITIZE } from "@/lib/utils/validation-rules";

interface PropertySelectionCardProps {
  formData: {
    wardId: string;
    fromProperty: string;
    toProperty: string;
  };
  handleSelectChange: (name: string, value: string) => void;
  wardOptions: { label: string; value: string }[];
  propertyOptions: { label: string; value: string }[];
  toPropertyOptions?: { label: string; value: string }[];
  handleShow: () => void;
  handleClearAll: () => void;
  isPending: boolean;
  isLoadingProperties?: boolean;
}

export function PropertySelectionCard({
  formData,
  handleSelectChange,
  wardOptions = [],
  propertyOptions = [],
  toPropertyOptions,
  handleShow,
  handleClearAll,
  isPending,
  isLoadingProperties = false,
}: PropertySelectionCardProps) {
  const t = useTranslations("lockUnlock");

  return (
    <div className="flex flex-col gap-4">
      <CardHeader className="mb-0 border border-slate-100 rounded-md bg-slate-50/50 py-3.5 px-6 flex flex-row items-center gap-2">
        <Building className="w-4 h-4 text-blue-600" />
        <CardTitle className="text-sm font-bold text-slate-800">{t("selectPropertyCard.title")}</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1">
            <SearchSelect
              name="wardId"
              label={t("selectPropertyCard.wardNo")}
              required
              value={formData.wardId}
              tabIndex={0}
              onChange={handleSelectChange}
              onEnter={() => document.getElementById("fromProperty")?.focus()}
              options={wardOptions}
              placeholder={t("selectPropertyCard.selectWard")}
            />
          </div>
          <div className="flex-1">
            <SearchSelect
              name="fromProperty"
              label={t("selectPropertyCard.fromProperty")}
              required
              value={formData.fromProperty}
              onChange={handleSelectChange}
              onEnter={() => document.getElementById("toProperty")?.focus()}
              options={propertyOptions}
              placeholder={t("selectPropertyCard.selectStartRange")}
              isLoading={isLoadingProperties}
              sanitizeInput={(val) => val.replace(SEARCH_ALPHANUMERIC_SANITIZE, "")}
            />
          </div>
          <div className="flex-1">
            <SearchSelect
              name="toProperty"
              label={t("selectPropertyCard.toProperty")}
              required
              value={formData.toProperty}
              onChange={handleSelectChange}
              options={toPropertyOptions || propertyOptions}
              placeholder={t("selectPropertyCard.selectEndRange")}
              isLoading={isLoadingProperties}
              sanitizeInput={(val) => val.replace(SEARCH_ALPHANUMERIC_SANITIZE, "")}
            />
          </div>
          <div className="flex items-end gap-3">
            <SearchButton
              id="showButton"
              label={t("selectPropertyCard.showButton")}
              size="sm"
              onClick={handleShow}
              isLoading={isPending}
            />
            <ClearButton
              size="sm"
              label={t("selectPropertyCard.clearButton")}
              onClick={handleClearAll}
              disabled={isPending}
            />
          </div>
        </div>
      </CardContent>
    </div>
  );
}