"use client";

import { MovableParentAssetSection } from "../basic-Info/MovableParentAssetSection";
import { NAAssetProfile } from "./NAAssetProfile";
import { NAPropertyInfo } from "./NAPropertyInfo";
import { NADynamicFields } from "./NADynamicFields";
import { NAAssetMedia } from "./NAAssetMedia";
import { NASummaryCards } from "./NASummaryCards";

import type { NABasicInfoStepContentProps } from "@/types/asset/municipal-Asset/new-add-new-asset";

export function NABasicInfoStepContent({
  orchestrator,
  currentStep,
  zones = [],
  wards = [],
  moujas = [],
  subzones = [],
  departments = [],
  ownershipTypes = [],
  designations = [],
  assetConditions = [],
  initialParentAsset = null,
  initialParentFloors = [],
  initialParentSubunits = [],
  cvRollup = null,
}: NABasicInfoStepContentProps) {
  const showFormDetails = !orchestrator.formData.isMovableCategory || !!orchestrator.formData.parentBuildingId;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] px-3 pt-0.5 pb-0.5 overflow-y-auto">
      {orchestrator.formData.isMovableCategory && (
        <div className="mb-2 shrink-0">
          <MovableParentAssetSection
            formData={orchestrator.formData}
            updateFormData={orchestrator.updateFormData}
            initialParentAsset={initialParentAsset}
            initialParentFloors={initialParentFloors}
            initialParentSubunits={initialParentSubunits}
          />
        </div>
      )}

      {showFormDetails && (
        <>
          <div className="overflow-x-auto custom-scrollbar pb-1 w-full shrink-0">
            <div
              className={`grid grid-cols-1 ${
                (orchestrator.dynamicFields && orchestrator.dynamicFields.length > 0) || orchestrator.isDynamicLoading
                  ? "min-w-[1240px] xl:min-w-0 xl:grid-cols-4 md:grid-cols-2"
                  : "min-w-[940px] xl:min-w-0 xl:grid-cols-3 md:grid-cols-3"
              } gap-2 mb-1 items-stretch h-[390px] max-h-[390px] min-h-[390px] relative`}
            >
              <NAAssetProfile
                formData={orchestrator.formData}
                errors={orchestrator.errors}
                showError={orchestrator.showError}
                handleChange={orchestrator.handleChange}
                updateFormData={orchestrator.updateFormData}
                zones={zones}
                wards={orchestrator.cascade.wards.length > 0 ? orchestrator.cascade.wards : wards}
                moujas={moujas}
                subzones={orchestrator.cascade.subzones.length > 0 ? orchestrator.cascade.subzones : subzones}
                assetConditions={assetConditions}
                isLoadingWards={orchestrator.cascade.isLoadingWards}
                isLoadingSubzones={orchestrator.cascade.isLoadingSubzones}
              />
              <NAPropertyInfo
                formData={orchestrator.formData}
                errors={orchestrator.errors}
                showError={orchestrator.showError}
                handleChange={orchestrator.handleChange}
                updateFormData={orchestrator.updateFormData}
                departments={departments}
                ownershipTypes={ownershipTypes}
                designations={
                  orchestrator.cascade.designations.length > 0
                    ? orchestrator.cascade.designations
                    : designations
                }
                isLoadingDesignations={orchestrator.cascade.isLoadingDesignations}
              />
              {((orchestrator.dynamicFields && orchestrator.dynamicFields.length > 0) ||
                orchestrator.isDynamicLoading) && (
                <NADynamicFields
                  fields={orchestrator.dynamicFields}
                  loading={orchestrator.isDynamicLoading}
                  formData={orchestrator.formData}
                  onAttributeChange={orchestrator.handleAttributeChange}
                />
              )}
              <NAAssetMedia currentStep={currentStep} />
            </div>
          </div>

          <div className="mt-auto shrink-0 mb-0">
            <NASummaryCards summary={orchestrator.summary} cvRollup={cvRollup} />
          </div>
        </>
      )}
    </div>
  );
}
