/**
 * i18n Request Configuration
 * Server-side locale detection and message loading
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
    dashboardMessages,
    constructionMessages,
    taxZoningMessages,
    floorMessages,
    taxzoneMessages,
    quickDataEntryMessages,
    rateSectionMasterMessages,
    assessmentYearRangeMessages,
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
    aliasMasterMessages,
    userManagementMessages,
    grievanceCategoryMessages,
    combinePropertyMessages,
    ptisMainTaxDetailsMessages,
    paymentModeMasterMessages,
    moduleMasterMessages,
    waterConnectionMessages,
    waterConnectionMasterMessages,
    commonDetailsUpdateMessages,
    modulesMessages,
  ] = await Promise.all([
    import(`./locales/${validatedLocale}/common.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/dashboard.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/construction.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/taxzoning.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/floor.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/taxzone.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/quickDataEntry.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/rateSectionMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/assessmentYearRange.json`).then((m) => m.default),
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
    import(`./locales/${validatedLocale}/aliasMaster.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/user-management.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/grievance-category.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/combineProperty.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/ptisMainTaxDetails.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/paymentModeMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/moduleMaster.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/waterconnection.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/waterConnectionMaster.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/commonDetailsUpdate.json`)
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/commonDetailsUpdate.json`)
      .catch(() => ({}))
      .then((m) => m.default || m),
    import(`./locales/${validatedLocale}/modules.json`).then((m) => m.default),

  ]);

  return {
    locale: validatedLocale,
    messages: {
      common: commonMessages,
      dashboard: dashboardMessages,
      construction: constructionMessages,
      taxZoning: taxZoningMessages.taxZoning,
      floor: floorMessages,
      taxZone: taxzoneMessages.taxZone,
      quickDataEntry: quickDataEntryMessages,
      rateSectionMaster: rateSectionMasterMessages,
      assessmentYearRange: assessmentYearRangeMessages,
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
      aliasMaster: aliasMasterMessages,
      userManagement: userManagementMessages,
      grievanceCategory: grievanceCategoryMessages,
      combineProperty: combinePropertyMessages,
      ptisMainTaxDetails: ptisMainTaxDetailsMessages,
      paymentModeMaster: paymentModeMasterMessages,
      moduleMaster: moduleMasterMessages,
      waterConnection: waterConnectionMessages?.waterConnection || waterConnectionMessages,
      waterConnectionMaster: waterConnectionMasterMessages.waterConnectionMaster,
      commonDetailsUpdate: commonDetailsUpdateMessages?.commonDetailsUpdate || commonDetailsUpdateMessages,
      modules: modulesMessages,
    },
  };
});
