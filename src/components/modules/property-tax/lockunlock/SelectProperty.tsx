import { Building } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common";
import {ShowHistoryButton,ClearButton} from "@/components/common/ActionButtons";
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
}

export function SelectProperty({
  formData,
  handleSelectChange,
  wardOptions = [],
  propertyOptions = [],
  handleShow,
  handleClearAll,
  isPending,
}: SelectPropertyProps) {
  const t = useTranslations("lockUnlock");
  return (
    <Card className="rounded-xl shadow-sm border border-slate-200/80 overflow-visible">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-6 flex flex-row items-center gap-2">
        <Building className="w-4 h-4 text-blue-600" />
        <CardTitle className="text-sm font-bold text-slate-800">{t("selectPropertyCard.title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 w-full">
          <div className="flex-1 min-w-[200px]">
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
          <div className="flex-1 min-w-[200px]">
            <SearchSelect
              name="fromProperty"
              label={t("selectPropertyCard.fromProperty")}
              required
              value={formData.fromProperty}
              onChange={handleSelectChange}
              options={propertyOptions}
              placeholder={t("selectPropertyCard.selectStartRange")}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <SearchSelect
              name="toProperty"
              label={t("selectPropertyCard.toProperty")}
              required
              value={formData.toProperty}
              onChange={handleSelectChange}
              options={propertyOptions}
              placeholder={t("selectPropertyCard.selectEndRange")}
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 pt-4 md:pt-0">
            <ShowHistoryButton 
            label={t("selectPropertyCard.showButton")}          
              size="md"
              onClick={handleShow}
              isLoading={isPending}
              //className="bg-white hover:bg-slate-50 border-slate-300 text-slate-700 h-9 font-semibold"
            />
            <ClearButton
              size="md"
              label={t("selectPropertyCard.clearButton")}
              onClick={handleClearAll}
              disabled={isPending}
              //className="bg-white hover:bg-slate-50 border-slate-300 text-slate-700 h-9 font-semibold"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
