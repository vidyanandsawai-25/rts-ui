import { Building } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common";
import { SearchButton, ClearButton } from "@/components/common/ActionButtons";
import { SearchSelect } from "@/components/common/SearchSelect";
import { useTranslations } from "next-intl";

interface SelectPropertyProps {
  formData: {
    wardId: string;
    fromProperty: string;
    toProperty: string;
  };
  handleSelectChange: (name: string, value: string) => void;
  wardOptions: { label: string; value: string }[];
  propertyOptions: { label: string; value: string }[];
  handleShow: () => void;
  handleClearAll: () => void;
  isPending: boolean;
  isLoadingProperties?: boolean;
}

export function SelectProperty({
  formData,
  handleSelectChange,
  wardOptions = [],
  propertyOptions = [],
  handleShow,
  handleClearAll,
  isPending,
  isLoadingProperties = false,
}: SelectPropertyProps) {
  const t = useTranslations("lockUnlock");
  return (
    <Card className="rounded-xl shadow-sm border border-slate-200/80 overflow-visible h-full flex flex-col justify-between">
      <div>
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-6 flex flex-row items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          <CardTitle className="text-sm font-bold text-slate-800">{t("selectPropertyCard.title")}</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchSelect
                name="wardId"
                label={t("selectPropertyCard.wardNo")}
                required
                value={formData.wardId}
                onChange={handleSelectChange}
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
                options={propertyOptions}
                placeholder={t("selectPropertyCard.selectStartRange")}
                isLoading={isLoadingProperties}
              />
            </div>
            <div className="flex-1">
              <SearchSelect
                name="toProperty"
                label={t("selectPropertyCard.toProperty")}
                required
                value={formData.toProperty}
                onChange={handleSelectChange}
                options={propertyOptions}
                placeholder={t("selectPropertyCard.selectEndRange")}
                isLoading={isLoadingProperties}
              />
            </div>
          </div>
        </CardContent>
      </div>
      <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/20 rounded-b-xl flex items-center justify-end gap-3">
        <ClearButton
          size="md"
          label={t("selectPropertyCard.clearButton")}
          onClick={handleClearAll}
          disabled={isPending}
        />
        <SearchButton
          label={t("selectPropertyCard.showButton")}
          size="md"
          onClick={handleShow}
          isLoading={isPending}
        />
      </div>
    </Card>
  );
}
