"use client";

import { Info } from "lucide-react";
import { WardItem } from "@/types/wardMaster.types";
import { ZonePropertyItem } from "@/types/zoneProperty.types";

interface PropertyInfoSectionProps {
  selectedWard: WardItem | null;
  selectedProperty: ZonePropertyItem | null;
  isApartmentCategory: boolean;
  categoryName: string | null;
  t: (key: string) => string;
}

export function PropertyInfoSection({
  selectedWard,
  selectedProperty,
  isApartmentCategory,
  categoryName,
  t,
}: PropertyInfoSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Info className="text-blue-500 w-4 h-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wide">
            {t("partitionForm.propertyInformation")}
          </h3>
        </div>

        {/* Ward and Category Pills */}
        <div className={`grid gap-3 mb-2 ${selectedProperty ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Ward Pill */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1.5 tracking-wide">
              {t("partitionForm.ward")}
            </label>
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${selectedWard?.id ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`w-2 h-2 rounded-full ${selectedWard?.id ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-sm font-semibold ${selectedWard?.id ? 'text-green-800' : 'text-gray-600'}`}>
                {selectedWard?.wardNo || t("partitionForm.noWardSelected")}
              </span>
              {selectedWard?.description && (
                <span className="text-xs text-gray-500">- {selectedWard.description}</span>
              )}
            </div>
          </div>

          {/* Property Category Pill */}
          {selectedProperty && categoryName && (
            <div>
              <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1.5 tracking-wide">
                {t("partitionForm.propertyCategory")}
              </label>
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${isApartmentCategory ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
                <div className={`w-2 h-2 rounded-full ${isApartmentCategory ? 'bg-blue-500' : 'bg-purple-500'}`} />
                <span className={`text-sm font-semibold ${isApartmentCategory ? 'text-blue-800' : 'text-purple-800'}`}>
                  {categoryName}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
