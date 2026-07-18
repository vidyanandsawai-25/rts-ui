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
  MultiSelect,
} from "@/components/common";
import { useTranslations } from "next-intl";
import { SEARCH_ALPHANUMERIC_SANITIZE } from "@/lib/utils/validation-rules";

interface PropertySelectionCardProps {
  formData: {
    searchCategory: number;
    zoneId: string;
    wardId: string;
    fromProperty: string;
    toProperty: string;
    propertyNos: string[];
  };
  handleSelectChange: (name: string, value: string | string[]) => void;
  zoneOptions: { label: string; value: string }[];
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
  zoneOptions = [],
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
        <div className="flex flex-row flex-wrap gap-4 items-end">
          {formData.searchCategory === 1 && (
            <div className="flex-1 min-w-[200px]">
              <SearchSelect
                name="zoneId"
                label="Zone / Node"
                required
                value={formData.zoneId}
                tabIndex={0}
                onChange={handleSelectChange}
                options={zoneOptions}
                placeholder={t("selectPropertyCard.selectZone") || "Select Zone"}
              />
            </div>
          )}

          {formData.searchCategory !== 1 && (
            <div className="flex-1 min-w-[200px]">
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
          )}

          {formData.searchCategory === 3 && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold mb-1 text-slate-700">
                Property No <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                options={propertyOptions}
                value={formData.propertyNos}
                onChange={(vals) => handleSelectChange("propertyNos", vals)}
                placeholder="Select Properties"
                disabled={isLoadingProperties || !formData.wardId}
              />
            </div>
          )}

          {formData.searchCategory === 4 && (
            <>
              <div className="flex-1 min-w-[200px]">
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
              <div className="flex-1 min-w-[200px]">
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
            </>
          )}

          <div className="flex items-center gap-3 w-full lg:w-auto pb-0.5">
            <SearchButton
              id="showButton"
              label={t("selectPropertyCard.showButton")}
              size="sm"
              onClick={handleShow}
              isLoading={isPending}
              className="flex-1 lg:flex-none"
            />
            <ClearButton
              size="sm"
              label={t("selectPropertyCard.clearButton")}
              onClick={handleClearAll}
              disabled={isPending}
              className="flex-1 lg:flex-none"
            />
          </div>
        </div>
      </CardContent>
    </div>
  );
}