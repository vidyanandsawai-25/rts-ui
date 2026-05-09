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
    typeofusemasterMessages,
    depreciationMessages,
    propertyTypeMessages,
    natureFactorCVMasterMessages,
    useCategoryFactorMasterMessages,
    ageFactorMasterMessages,
    zoneMasterMessages,
    modulesMessages,
    officeMessages,
    appartmentQCMessages
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
    import(`./locales/${validatedLocale}/ptis.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/floorFactorMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/weightageMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/typeofusemaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/depreciation.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/propertyType.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/natureFactorCVMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/useCategoryFactorMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/ageFactorMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/zoneMaster.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/modules.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/office.json`).catch(() => ({})).then((m) => m.default || m),
    import(`./locales/${validatedLocale}/appartmentQC.json`).catch(() => ({})).then((m) => m.default || m),

  ]);

  return {
    locale: validatedLocale,
    messages: {
      common: commonMessages,
      dashboard: dashboardMessages,
      construction: constructionMessages,
      taxZoning: taxZoningMessages.taxZoning,
      floor: floorMessages.floor,
      taxZone: taxzoneMessages.taxZone,
      quickDataEntry: quickDataEntryMessages,
      rateSectionMaster: rateSectionMasterMessages,
      assessmentYearRange: assessmentYearRangeMessages,
      ptis: ptisMessages,
      floorFactorMaster: floorFactorMasterMessages.floorFactorMaster,
      weightageMaster: weightageMasterMessages.weightageMaster,
      depreciation: depreciationMessages.depreciationMaster,
      propertyType: propertyTypeMessages,
      natureFactorCVMaster: natureFactorCVMasterMessages.natureFactorCVMaster,
      useCategoryFactorMaster: useCategoryFactorMasterMessages.useCategoryFactorMaster,
      ageFactorMaster: ageFactorMasterMessages.ageFactorMaster,
      typeofusemaster: typeofusemasterMessages,
      zoneMaster: zoneMasterMessages,
      modules: modulesMessages,
      office: officeMessages,
      appartmentQC: appartmentQCMessages,
    },
  };
});