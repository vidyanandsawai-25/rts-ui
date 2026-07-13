"use client";

import { Database, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageContainer, Tabs, Tab, TabList, TabPanel, TableHeader } from "@/components/common";
import { CommonDetailsUpdatePageProps } from "@/types/common-details-update/common-details-update.types";
import { useCommonDetailsUpdate } from "@/hooks/commonDetailsUpdate/useCommonDetailsUpdate";
import { UpdateFieldsTabContent } from "./UpdateFieldsTabContent";
import { FieldRegistry } from "./FieldRegistry";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "next-intl";

export default function CommonDetailsUpdatePage(
  props: CommonDetailsUpdatePageProps
) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isFieldListCollapsed, setIsFieldListCollapsed] = useState(false);

  // Tab state from URL params for server-side rendering support
  const tabFromUrl = searchParams.get("tab") || "updateFields";

  const fromPtis = searchParams.get("from") === "ptis";

  const handleBackToPtis = () => {
    const pId = searchParams.get("propertyId");
    const wId = searchParams.get("wardId");
    const wNo = searchParams.get("wardNo");
    const pNo = searchParams.get("propertyNo");
    const partNo = searchParams.get("partitionNo");

    const params = new URLSearchParams();
    if (pId) params.set("propertyId", pId);
    if (wId) params.set("wardId", wId);
    if (wNo) params.set("wardNo", wNo);
    if (pNo) params.set("propertyNo", pNo);
    if (partNo) params.set("partitionNo", partNo);

    router.push(`/${locale}/property-tax/ptis?${params.toString()}`);
  };

  const updateData = useCommonDetailsUpdate(props);
  const { t } = updateData;

  // Handle tab change - update URL params for SSR
  const handleTabChange = (val: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", String(val));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };


  return (
    <PageContainer>
      <div className="space-y-4 h-full flex flex-col">
        {/* TableHeader with Screen Objective inside */}
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={Database}
          rightContent={
            <div className="flex items-center gap-3">
              {fromPtis && (
                <button
                  type="button"
                  onClick={handleBackToPtis}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100/70 hover:border-blue-300 hover:shadow-sm active:scale-95 transition-all duration-200 rounded-lg cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t("buttons.backToPTIS")}</span>
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-xs">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">{t("screenObjective.title")}</p>
                  <p className="text-[11px] text-amber-700 leading-tight">{t("screenObjective.description")}</p>
                </div>
              </div>
            </div>
          }
        />

        {/* Tabs */}
        <Tabs
          value={tabFromUrl}
          onChange={handleTabChange}
          variant="pills"
          size="md"
          className="flex-1 flex flex-col min-h-0"
        >
          <TabList className="border-b border-gray-200 pb-0 mb-0">
            <Tab
              value="updateFields"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
                tabFromUrl === "updateFields"
                  ? "bg-[#0F5FC2] text-white border-[#0F5FC2]"
                  : "bg-white text-gray-600 border-transparent hover:bg-gray-50"
              )}
            >
              {t("tabs.updateFields")}
            </Tab>
            <Tab
              value="fieldRegistry"
              icon={Database}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
                tabFromUrl === "fieldRegistry"
                  ? "bg-[#0F5FC2] text-white border-[#0F5FC2]"
                  : "bg-white text-gray-600 border-transparent hover:bg-gray-50"
              )}
            >
              {t("tabs.fieldRegistry")}
            </Tab>
          </TabList>

          {/* Update Fields Tab */}
          <TabPanel value="updateFields" className="flex-1 min-h-0 overflow-auto">
            <UpdateFieldsTabContent
              t={t}
              updateData={updateData}
              isFieldListCollapsed={isFieldListCollapsed}
              setIsFieldListCollapsed={setIsFieldListCollapsed}
              locale={locale}
            />
          </TabPanel>

          {/* Field Registry Tab */}
          <TabPanel value="fieldRegistry" className="flex-1 min-h-0 overflow-auto">
            <FieldRegistry t={t} initialFields={props.menuItems} />
          </TabPanel>
        </Tabs>
      </div>
    </PageContainer>
  );
}
