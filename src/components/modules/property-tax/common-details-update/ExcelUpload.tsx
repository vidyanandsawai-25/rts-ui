
"use client";

import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";
import { Button, Badge, Checkbox, Input, Label } from "@/components/common";
import { BulkUpdateMaster, CommonDetailsUpdateActions } from "@/types/common-details-update/common-details-update.types";

import { Modal } from "@/components/common/Modal";

import { HelpCircle } from "lucide-react";

import { useTranslations } from "next-intl";

import { PropertySelectionCriteria } from "./PropertySelectionCriteria";
import { EnabledFieldList } from "./EnabledFieldList";
import { ExcelUploadTable } from "./ExcelUploadTable";
import { RemarksConfirmationModal } from "./RemarksConfirmationModal";
import { DownloadButton, UploadButton } from "@/components/common/ActionButtons";
import { useExcelUpload } from "@/hooks/commonDetailsUpdate/useExcelUpload";

interface ExcelUploadProps {
  initialExcelTemplateFields?: BulkUpdateMaster[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateData?: any;
  actions?: Partial<CommonDetailsUpdateActions>;
  locale?: string;
}

export const ExcelUpload = ({ updateData, actions, locale = "en" }: ExcelUploadProps) => {
  const t = useTranslations("commonDetailsUpdate");

  const {
    downloading,
    downloadWithData,
    setDownloadWithData,
    uploading,
    isGuidelineOpen,
    setIsGuidelineOpen,
    selectedFile,
    validationData,
    showRemarkModal,
    setShowRemarkModal,
    fileInputRef,
    handleDownloadTemplate,
    handleFileChange,
    handleValidateExcel,
    handleConfirmUpload,
  } = useExcelUpload({ updateData, actions });

  return (
    <div className="flex flex-col space-y-2 h-full border border-blue-200 rounded-xl bg-white overflow-hidden">
      <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200 flex justify-between items-center mb-0">
        <div>
          <h3 className="text-sm font-semibold text-[#1E3A8A]">{t("excelUpload.title")}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("excelUpload.subtitle")}
          </p>
        </div>
        <Badge
          variant="success"
          icon={Upload}
          className="bg-green-50 text-green-800 border-green-200 font-bold"
        >
          {t("excelUpload.bulkUploadBadge")}
        </Badge>
      </div>

      <div className="space-y-2">
        {updateData && (
          <div className="border border-blue-200 rounded-xl bg-white overflow-visible mb-2 m-2">
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 bg-[#F8FAFF] rounded-t-xl">
              <div>
                <h3 className="text-sm font-semibold text-[#1E3A8A]">
                  {t("excelUpload.actionSectionTitle")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("excelUpload.actionSectionDesc")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={HelpCircle}
                  onClick={() => setIsGuidelineOpen(true)}
                  className="text-slate-700 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-colors [&>svg]:text-amber-500 font-bold"
                >
                  {t("excelUpload.viewGuidelinesBtn")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleValidateExcel}
                  disabled={uploading || !selectedFile}
                  isLoading={uploading}
                  icon={CheckCircle2}
                  className="shadow-sm font-bold"
                >
                  {t("excelUpload.validateExcelBtn")}
                </Button>
              </div>
            </div>
            <div className="p-2">
              <PropertySelectionCriteria
                key={updateData.resetKey}
                t={t}
                selectedScopeId={updateData.selectedScopeId}
                handleScopeChange={updateData.handleScopeChange}
                scopeOptions={updateData.scopeOptions}
                loadingScopeOptions={updateData.loadingScopeOptions}
                activeScopeDetails={updateData.activeScopeDetails}
                filterValues={updateData.filterValues}
                setFilterValues={updateData.setFilterValues}
                handleZoneChange={updateData.handleZoneChange}
                zoneOptions={updateData.zoneOptions}
                handleWardChange={updateData.handleWardChange}
                wardOptions={updateData.wardOptions}
                propertyTypeOptions={updateData.propertyTypeOptions}
                propertyOptions={updateData.propertyOptions}
                fromPropertyOptions={updateData.fromPropertyOptions}
                toPropertyOptions={updateData.toPropertyOptions}
                handlePropertyDropdownFocus={updateData.handlePropertyDropdownFocus}
                handleFromPropertyChange={updateData.handleFromPropertyChange}
                handleToPropertyChange={updateData.handleToPropertyChange}
                loadingPropertyOptions={updateData.loadingPropertyOptions}
                isPropertyDropdownDisabled={!updateData.filterValues.wardId}
                filterSubmitted={updateData.filterSubmitted}
                loadingShowProperties={updateData.loadingShowProperties}
                canShowProperties={updateData.canShowProperties}
                handleShowProperties={updateData.handleShowProperties}
                handleFilterCancel={updateData.handleBack}
                hasAnyFilterValue={updateData.hasAnyFilterValue}
                hasMore={updateData.propertyDropdownHasMore}
                onLoadMore={updateData.handleLoadMorePropertyOptions}
                isLoadingMore={updateData.loadingMorePropertyOptions}
                propertySearchTerm={updateData.propertySearchTerm}
                onPropertySearchChange={updateData.handlePropertyDropdownSearch}
                fromHasMore={updateData.fromPropertyDropdownHasMore}
                onFromLoadMore={updateData.handleLoadMoreFromPropertyOptions}
                isFromLoadingMore={updateData.loadingMoreFromPropertyOptions}
                fromPropertySearchTerm={updateData.fromPropertySearchTerm}
                onFromPropertySearchChange={updateData.handleFromPropertyDropdownSearch}
                loadingFromPropertyOptions={updateData.loadingFromPropertyOptions}
                toHasMore={updateData.toPropertyDropdownHasMore}
                onToLoadMore={updateData.handleLoadMoreToPropertyOptions}
                isToLoadingMore={updateData.loadingMoreToPropertyOptions}
                toPropertySearchTerm={updateData.toPropertySearchTerm}
                onToPropertySearchChange={updateData.handleToPropertyDropdownSearch}
                loadingToPropertyOptions={updateData.loadingToPropertyOptions}
                hideActionButtons={true}
                renderChildrenInline={true}
              >
                {/* Embedded Action Buttons */}
                <div className={`col-span-12 lg:col-span-12 flex-1 flex self-end flex-wrap md:flex-nowrap items-end gap-3 relative z-[50] mt-2 xl:mt-0 w-full ${(() => {
                  const activeOptions = updateData.activeScopeDetails?.options || [];
                  let fieldsCount = 1; // Scope field
                  if (activeOptions.includes("Zone")) fieldsCount++;
                  if (activeOptions.includes("Ward")) fieldsCount++;
                  if (activeOptions.includes("Property Type") && updateData.activeScopeDetails?.name !== "WardSector") fieldsCount++;
                  if (activeOptions.includes("Property No")) fieldsCount++;
                  if (activeOptions.includes("From Property")) fieldsCount++;
                  if (activeOptions.includes("To Property")) fieldsCount++;

                  const usedCols = Math.min(fieldsCount * 2, 12);
                  const remainingCols = 12 - usedCols;

                  const colSpanMap: Record<number, string> = {
                    10: "xl:col-span-10 2xl:col-span-10",
                    8: "xl:col-span-8 2xl:col-span-8",
                    6: "xl:col-span-6 2xl:col-span-6",
                    4: "xl:col-span-4 2xl:col-span-4",
                    2: "xl:col-span-2 2xl:col-span-2",
                    0: "xl:col-span-12 2xl:col-span-12",
                  };
                  return colSpanMap[remainingCols] || "xl:col-span-12 2xl:col-span-12";
                })()}`}>
                  <DownloadButton
                    size="md"
                    onClick={handleDownloadTemplate}
                    disabled={downloading}
                    isLoading={downloading}
                    label={t("excelUpload.downloadTemplateBtn")}
                    className="bg-white border-[#0F5FC2] text-[#0F5FC2] hover:bg-blue-50 border-2 font-semibold h-[42px] min-w-[130px] shrink-0"
                  />

                  <div className="flex items-center gap-2 min-h-[42px] shrink-0">
                    <Checkbox
                      checked={downloadWithData}
                      onCheckedChange={(checked) => {
                        if (checked && updateData && !updateData.hasAnyFilterValue) {
                          toast.error(t("messages.downloadWithDataCriteria"));
                          return;
                        }
                        setDownloadWithData(!!checked);
                      }}
                      id="downloadWithData"
                    />

                    <Label
                      htmlFor="downloadWithData"
                      className="text-sm font-medium cursor-pointer whitespace-nowrap"
                      onClick={(e) => {
                        e.preventDefault();

                        if (
                          !downloadWithData &&
                          updateData &&
                          !updateData.hasAnyFilterValue
                        ) {
                          toast.error(t("messages.downloadWithDataCriteria"));
                          return;
                        }

                        setDownloadWithData(!downloadWithData);
                      }}
                    >
                      {t("excelUpload.downloadWithData")}
                    </Label>
                  </div>

                  <div className="flex-1 min-w-[160px] flex items-center border border-dashed border-blue-300 rounded-lg p-1.5 bg-blue-50/50 h-[42px] overflow-hidden">
                    <UploadButton
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      label={t("excelUpload.chooseExcelFileBtn")}
                      className="!bg-white !text-blue-700 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300 hover:!text-blue-700 font-medium shrink-0 whitespace-nowrap mr-2 h-full"
                    />

                    <span className="text-sm text-slate-600 truncate font-medium min-w-0">
                      {selectedFile
                        ? selectedFile.name
                        : t("excelUpload.noFileChosen")}
                    </span>

                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx, .xls"
                      className="hidden"
                    />
                  </div>
                </div>

              </PropertySelectionCriteria>
            </div>
          </div>
        )}

        {/* Dynamic Fields & API Data Preview */}
        {updateData && (
          <div className="flex flex-col lg:flex-row gap-4 h-[380px] m-2">
            {/* Left: Enabled Field List (Single Select for Excel Upload) */}
            <div className="w-full lg:w-1/3">
              <EnabledFieldList
                t={t}
                filteredMenuItems={updateData.filteredMenuItems}
                selectedCodes={updateData.selectedCodes}
                handleMenuSelect={updateData.handleMenuSelect}
                locale={locale}
                selectionType="single"
              />
            </div>
            <div className="flex flex-col min-h-0 h-full overflow-hidden transition-all duration-300 flex-1">
              <ExcelUploadTable t={t} validationData={validationData} />
            </div>
          </div>
        )}
      </div>

      <Modal
        open={isGuidelineOpen}
        onClose={() => setIsGuidelineOpen(false)}
        title={t("excelUpload.guidelineModalTitle")}
      >
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">
            {t("excelUpload.guidelineModalIntro")}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>
              <span className="font-semibold text-gray-800">{t("excelUpload.downloadEmptyTitle")}</span> {t("excelUpload.downloadEmptyDesc")}
            </li>
            <li>
              <span className="font-semibold text-gray-800">{t("excelUpload.downloadDataTitle")}</span> {t("excelUpload.downloadDataDesc")}
            </li>
            <li>
              <span className="font-semibold text-gray-800">{t("excelUpload.selectCorrectGroupTitle")}</span> {t("excelUpload.selectCorrectGroupDesc")}
            </li>
            <li>
              <span className="font-semibold text-gray-800">{t("excelUpload.batchProcessingTitle")}</span> {t("excelUpload.batchProcessingDesc")}
            </li>
            <li>
              <span className="font-semibold text-gray-800">{t("excelUpload.consistencyTitle")}</span> {t("excelUpload.consistencyDesc")}
            </li>
          </ul>
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={() => setIsGuidelineOpen(false)}
              className="px-6 gap-2"
              icon={CheckCircle2}
            >
              {t("excelUpload.okButton")}
            </Button>
          </div>
        </div>
      </Modal>

      <RemarksConfirmationModal
        open={showRemarkModal}
        onClose={() => setShowRemarkModal(false)}
        onConfirm={handleConfirmUpload}
        t={t}
      />
    </div>
  );
};
