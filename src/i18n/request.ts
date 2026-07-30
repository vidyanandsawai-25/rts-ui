/**
 * i18n Request Configuration
 * Server-side locale detection and message loading
 * Force reload: 1
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, Locale } from './config';

// Validate locale and fallback to default if invalid
const validateLocale = (locale: string | undefined): Locale => {
  return locale && locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
};

export default getRequestConfig(async ({ locale }) => {
  const validatedLocale = validateLocale(locale);

  // Load all translation files
  const [
    commonMessages,
    loginMessages,
    welcomeMessages,
    dashboardMessages,
    constructionMessages,
    taxZoningMessages,
    floorMessages,
    taxzoneMessages,
    quickDataEntryMessages,
    rateSectionMasterMessages,
    assessmentYearRangeMessages,
    ownershipTypeMessages,
    assetMessages,
    ptisMessages,
    floorFactorMasterMessages,
    weightageMasterMessages,
    configMasterMessages,
    typeofusemasterMessages,
    depreciationMessages,
    propertyTypeMessages,
    natureFactorCVMasterMessages,
    ptisRVRateMasterMessages,
    useCategoryFactorMasterMessages,
    ageFactorMasterMessages,
    zoneMasterMessages,
    officeMessages,
    bankMasterMessages,
    screenAccessMessages,
    appartmentQCMessages,
    departmentMasterMessages,
    departmentActivationMessages,
    homeMessages,
    multilingualTranslationMessages,
    userManagementMessages,
    grievanceCategoryMessages,
    combinePropertyMessages,
    ptisMainTaxDetailsMessages,
    paymentModeMasterMessages,
    propertySearchMessages,
    moduleMasterMessages,
    ulbConfigMessages,
    waterConnectionMessages,
    waterConnectionMasterMessages,
    commonDetailsUpdateMessages,
    financialYearMessages,
    ruleEngineMessages,
    moujaMessages,
    policyConfigurationMessages,
    remarkMasterMessages,
    lockUnlockMessages,
    socialAttributeMessages,
    applicableTaxesMessages,
    reassessmentMessages,
    taxCalculationGuidelineMessages,

    addTaxesMessages,
    inventoryCategoryMessages,
    inventoryConditionMessages,
    inventoryModelMessages,
    inventoryNameMessages,
    automationDashboardMessages,
    modulesMessages,
    reportMessages,
    assetPhotoTypeMessages,
    assetRoomTypeMessages,
    designationMessages,
    gstMasterMessages,
    penaltyRuleMasterMessages,
    owningDepartmentMessages,
    municipalAssetMessages,
    moujaSubzoneMessages,
    assetTypeOfUseMessages,
    mapDashboardMessages,
    propertyMappingMessages,
    assetRegisterMessages,
  ] = await Promise.all([
    import(`./locales/${validatedLocale}/common.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/login.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/welcome.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/dashboard.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/construction.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/taxzoning.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/floor.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/taxzone.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/quickDataEntry.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/rateSectionMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/assessmentYearRange.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/ownership-type.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/asset.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/ptis.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/floorFactorMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/weightageMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/config-master.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/typeofusemaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/depreciation.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/propertyType.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/natureFactorCVMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/ptis.RVRateMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/useCategoryFactorMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/ageFactorMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/zoneMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/office.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/bank-master.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/screenAccess.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/appartmentQC.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/departmentMaster.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/departmentActivation.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/home.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/multilingualTranslation.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/user-management.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/grievance-category.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/combineProperty.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/ptisMainTaxDetails.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/paymentModeMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/propertySearch.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/moduleMaster.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/ulb_configuration.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/waterconnection.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/waterConnectionMaster.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/commonDetailsUpdate.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/financialYear.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/rule-engine.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/mouja.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/policyConfiguration.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/remark.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/lockUnlock.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/socialAttribute.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/applicableTaxes.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/reassessment.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/taxCalculationGuideline.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/addTaxes.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/inventoryCategory.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/inventoryCondition.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/inventoryModel.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/inventoryName.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/automation-dashboard.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/modules.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/report.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/assetPhotoType.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/assetRoomType.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/designation.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/gstMaster.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/penaltyRuleMaster.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/owningDepartment.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/municipalAsset.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/moujaSubzone.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/assetTypeOfUse.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/mapDashboard.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/propertyMapping.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/assetRegister.json`).catch(() => ({})).then((m) => m.default || m),
  ]);

  return {
    locale: validatedLocale,
    messages: {
      common: commonMessages,
      login: loginMessages,
      welcome: welcomeMessages,
      dashboard: dashboardMessages,
      construction: constructionMessages,
      taxZoning: taxZoningMessages.taxZoning,
      floor: floorMessages,
      taxZone: taxzoneMessages.taxZone,
      quickDataEntry: quickDataEntryMessages,
      rateSectionMaster: rateSectionMasterMessages,
      assessmentYearRange: assessmentYearRangeMessages,
      ownershipType: ownershipTypeMessages?.ownershipType || ownershipTypeMessages,
      "ownership-type": ownershipTypeMessages,
      asset: assetMessages,
      ptis: ptisMessages,
      floorFactorMaster: floorFactorMasterMessages.floorFactorMaster,
      weightageMaster: weightageMasterMessages.weightageMaster,
      configMaster: configMasterMessages.configMaster || configMasterMessages,
      typeofusemaster: typeofusemasterMessages,
      depreciation: depreciationMessages,
      propertyType: propertyTypeMessages,
      natureFactorCVMaster: natureFactorCVMasterMessages.natureFactorCVMaster,
      ptis_RVRateMaster: ptisRVRateMasterMessages,
      useCategoryFactorMaster: useCategoryFactorMasterMessages.useCategoryFactorMaster,
      ageFactorMaster: ageFactorMasterMessages.ageFactorMaster,
      zoneMaster: zoneMasterMessages,
      office: officeMessages,
      bankMaster: bankMasterMessages,
      screenAccess: screenAccessMessages,
      appartmentQC: appartmentQCMessages,
      departmentMaster: departmentMasterMessages,
      departmentActivation: departmentActivationMessages,
      home: homeMessages,
      multilingualTranslation: multilingualTranslationMessages,
      userManagement: userManagementMessages,
      grievanceCategory: grievanceCategoryMessages,
      combineProperty: combinePropertyMessages,
      ptisMainTaxDetails: ptisMainTaxDetailsMessages,
      paymentModeMaster: paymentModeMasterMessages,
      propertySearch: propertySearchMessages,
      moduleMaster: moduleMasterMessages,
      ulb_configuration: ulbConfigMessages,
      waterConnection: waterConnectionMessages?.waterConnection || waterConnectionMessages,
      waterConnectionMaster: waterConnectionMasterMessages.waterConnectionMaster,
      commonDetailsUpdate:
        commonDetailsUpdateMessages?.commonDetailsUpdate || commonDetailsUpdateMessages,
      financialYear: financialYearMessages,
      ruleEngine: ruleEngineMessages,
      mouja: moujaMessages,
      policyConfiguration:
        policyConfigurationMessages?.policyConfiguration || policyConfigurationMessages,
      remarkMaster: remarkMasterMessages.remarkMaster,
      lockUnlock: lockUnlockMessages?.lockUnlock || lockUnlockMessages,
      socialAttribute: socialAttributeMessages.socialAttribute || socialAttributeMessages,
      applicableTaxes: applicableTaxesMessages,
      reassessment: reassessmentMessages,
      taxCalculationGuideline:
        taxCalculationGuidelineMessages?.taxCalculationGuideline || taxCalculationGuidelineMessages,
      addTaxes: addTaxesMessages?.addTaxes || addTaxesMessages,
      inventoryCategory: inventoryCategoryMessages?.inventoryCategory || inventoryCategoryMessages,
      inventoryCondition: inventoryConditionMessages?.inventoryCondition || inventoryConditionMessages,
      inventoryModel: inventoryModelMessages?.inventoryModel || inventoryModelMessages,
      inventoryName: inventoryNameMessages?.inventoryName || inventoryNameMessages,
      automationDashboard: automationDashboardMessages,
      modules: modulesMessages,
      report: reportMessages,
      assetPhotoType: assetPhotoTypeMessages,
      assetRoomType: assetRoomTypeMessages,
      designation: designationMessages,
      gstMaster: gstMasterMessages,
      penaltyRuleMaster: penaltyRuleMasterMessages,
      owningDepartment: owningDepartmentMessages,
      municipalAsset: municipalAssetMessages,
      moujaSubzone: moujaSubzoneMessages,
      assetTypeOfUse: assetTypeOfUseMessages,
      mapDashboard: mapDashboardMessages,
      propertyMapping: propertyMappingMessages?.propertyMapping || propertyMappingMessages,
      assetRegister: assetRegisterMessages,
    },
  };
});

