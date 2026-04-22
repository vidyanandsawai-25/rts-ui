"use client";

import React from "react";
import { MapPin, Eye } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle, Select, ValidationMessage, SaveButton, CancelButton } from "@/components/common";
import { MultiSelectDropdown } from "@/components/common/Dropdown";
import { SelectOption } from "@/types/taxzoning.types";
import { Label } from "@/components/common/label";

interface TaxZoningFormProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  zone: string;
  setZone: (val: string) => void;
  zoneOptions: SelectOption[];
  isTaxZoneValid: boolean;
  submitted: boolean;
  ward: string[];
  setWard: (val: string[]) => void;
  wardOptions: SelectOption[];
  isWardValid: boolean;
  fromProps: string;
  setFromProps: (val: string) => void;
  toProps: string;
  setToProps: (val: string) => void;
  propertyOptionsByWard: SelectOption[];
  isPropertyValid: boolean;
  saving: boolean;
  isFormValid: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export const TaxZoningForm = ({
  t,
  zone,
  setZone,
  zoneOptions,
  isTaxZoneValid,
  submitted,
  ward,
  setWard,
  wardOptions,
  isWardValid,
  fromProps,
  setFromProps,
  toProps,
  setToProps,
  propertyOptionsByWard,
  isPropertyValid,
  saving,
  isFormValid,
  handleSubmit,
  onClear,
}: TaxZoningFormProps) => {
  return (
    <form onSubmit={handleSubmit}>
      <Card
        variant="default"
        padding="none"
        className="border border-blue-200 rounded-xl shadow-sm h-[400px] flex flex-col"
      >
        <CardHeader className="flex items-center gap-2 px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl mb-0">
          <MapPin className="w-4 h-4 text-blue-600" />
          <CardTitle className="text-sm font-semibold text-[#1E3A8A]">
            {t('form.update')} {t('title')}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>
                {t('form.taxZone')}
              </Label>
              <Select
                value={zone}
                onChange={setZone}
                options={zoneOptions}
                placeholder={t('form.selectTaxZone')}
              />
              <ValidationMessage
                visible={submitted && !isTaxZoneValid}
                message={t('messages.taxZoneRequired')}
              />
            </div>

            <div>
              <Label required>
                {t('form.ward')}
              </Label>
              <div className={cn(!zone && "opacity-60 cursor-not-allowed pointer-events-none")}>
                <MultiSelectDropdown
                  options={wardOptions}
                  value={ward}
                  onChange={setWard}
                  placeholder={zone ? t('form.selectWard') : t('form.selectTaxZone')}
                  className="text-gray-700"
                />
              </div>
              <ValidationMessage
                visible={submitted && !isWardValid}
                message={t('messages.wardRequired')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>
                {t('form.fromProperty')}
              </Label>
              <Select
                value={fromProps}
                onChange={setFromProps}
                options={propertyOptionsByWard}
                placeholder={t('form.selectFromProperty')}
                disabled={ward.length !== 1}
              />
            </div>

            <div>
              <Label>
                {t('form.toProperty')}
              </Label>
              <Select
                value={toProps}
                onChange={setToProps}
                options={propertyOptionsByWard}
                placeholder={t('form.selectToProperty')}
                disabled={ward.length !== 1}
              />
            </div>
          </div>

          {ward.length === 1 && (
            <ValidationMessage
              visible={submitted && !isPropertyValid}
              message={t('messages.propertyRequired')}
            />
          )}

          {ward.length > 1 && (
            <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <Eye className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-semibold">{t('preview.multipleWardsSelected')}</p>
                <p>
                  {t('preview.multipleWardsMessage')}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <div className="border-t bg-[#F8FAFF] px-4 py-3 rounded-b-xl">
          <div className="grid grid-cols-2 gap-3">
            <SaveButton
              type="submit"
              label={saving ? t('form.updating') : t('form.update')}
              className="w-full"
              disabled={!isFormValid || saving}
            />
            <CancelButton
              label={t('form.clearImported')}
              className="w-full"
              onClick={onClear}
            />
          </div>
        </div>
      </Card>
    </form>
  );
};
