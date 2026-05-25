"use client";

import { Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SaveButton,
  CancelButton,
  ValidationMessage,
  SearchSelect,
} from "@/components/common";
import { PropertyFilterFormValues, SelectOption } from "@/types/common-details-update/common-details-update.types";

interface PropertyFilterProps {
  t: (key: string) => string;
  filterValues: PropertyFilterFormValues;
  setFilterValues: React.Dispatch<React.SetStateAction<PropertyFilterFormValues>>;
  filterSubmitted: boolean;
  wardOptions: SelectOption[];
  wingOptions: SelectOption[];
  propertyOptions: SelectOption[];
  onWardChange: (wardId: string) => void;
  onPropertyDropdownFocus: () => void;
  onShow: () => void;
  onBack: () => void;
  loading: boolean;
  loadingPropertyOptions: boolean;
  canShowProperties: boolean;
}

export const PropertyFilter = ({
  t,
  filterValues,
  setFilterValues,
  filterSubmitted,
  wardOptions,
  wingOptions,
  propertyOptions,
  onWardChange,
  onPropertyDropdownFocus,
  onShow,
  onBack,
  loading,
  loadingPropertyOptions,
  canShowProperties,
}: PropertyFilterProps) => {
  // From/To Property dropdowns are disabled until a ward is selected
  const isPropertyDropdownDisabled = !filterValues.wardId;
  
  // Wing dropdown is disabled until From and To Property are selected
  const isWingDropdownDisabled = !filterValues.fromPropertyNo || !filterValues.toPropertyNo;

  return (
    <Card
      variant="default"
      padding="none"
      className="border border-blue-200 rounded-xl shadow-sm shrink-0"
    >
      <CardHeader className="flex items-center gap-2 px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl mb-0">
        <Filter className="w-4 h-4 text-blue-600" />
        <CardTitle className="text-sm font-semibold text-[#1E3A8A]">
          {t("filter.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-5 items-end">
          <div>
            <SearchSelect
              label={t("filter.wardNumber")}
              value={filterValues.wardId}
              onChange={(_, val) => onWardChange(val)}
              options={wardOptions}
              placeholder={t("filter.selectWard")}
              required
            />
            <ValidationMessage
              visible={filterSubmitted && !filterValues.wardId}
              message={t("messages.wardRequired")}
            />
          </div>

          <div>
            <SearchSelect
              options={propertyOptions}
              label={t("filter.fromPropertyNo")}
              value={filterValues.fromPropertyNo}
              onChange={(_, val) =>
                setFilterValues((prev) => ({
                  ...prev,
                  fromPropertyNo: val,
                }))
              }
              onInputFocus={onPropertyDropdownFocus}
              placeholder={loadingPropertyOptions ? t("loading.message") : t("filter.selectFromPropertyNo")}
              required
              disabled={isPropertyDropdownDisabled}
              isLoading={loadingPropertyOptions}
            />
            <ValidationMessage
              visible={filterSubmitted && !filterValues.fromPropertyNo}
              message={t("messages.fromPropertyRequired")}
            />
          </div>

          <div>
            <SearchSelect
              options={propertyOptions}
              label={t("filter.toPropertyNo")}
              value={filterValues.toPropertyNo}
              onChange={(_, val) =>
                setFilterValues((prev) => ({
                  ...prev,
                  toPropertyNo: val,
                }))
              }
              onInputFocus={onPropertyDropdownFocus}
              placeholder={loadingPropertyOptions ? t("loading.message") : t("filter.selectToPropertyNo")}
              required
              disabled={isPropertyDropdownDisabled}
              isLoading={loadingPropertyOptions}
            />
            <ValidationMessage
              visible={filterSubmitted && !filterValues.toPropertyNo}
              message={t("messages.toPropertyRequired")}
            />
          </div>

          <div>
            <SearchSelect
              label={t("filter.wing")}
              value={filterValues.wingId}
              onChange={(_, val) =>
                setFilterValues((prev) => ({ ...prev, wingId: val }))
              }
              options={wingOptions}
              placeholder={t("filter.selectWing")}
              required
              disabled={isWingDropdownDisabled}
            />
            <ValidationMessage
              visible={filterSubmitted && !filterValues.wingId}
              message={t("messages.wingRequired")}
            />
          </div>

          <div className="flex gap-2 mt-3">
            <SaveButton
              type="button"
              label={loading ? t("loading.message") : t("filter.show")}
              onClick={onShow}
              disabled={loading || !canShowProperties}
              className="px-5"
              size="sm"
            />
            <CancelButton
              type="button"
              label={t("filter.clear")}
              onClick={onBack}
              className="px-5"
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
