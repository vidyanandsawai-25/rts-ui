import { 
    BuildingPermissionState,
    PropertyCertificateWithStatusDto,
    PropertyCertificateBulkSaveDto,
    PropertyCertificateItemDto
} from "@/types/building-permission.types";

export const formatDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === "string" || dateStr.toLowerCase() === "null") return "";
    try {
        return dateStr.split('T')[0];
    } catch {
        return "";
    }
};

/** Strips backend placeholder values ("string", "null", "undefined") to empty string. */
const sanitizeString = (value: string | null | undefined): string => {
    if (!value) return "";
    const lower = value.trim().toLowerCase();
    if (lower === "string" || lower === "null" || lower === "undefined") return "";
    return value.trim();
};

const MAPPING: Record<string, string> = {
    propertytaxcertificate: "propertyTaxCertificate", noduescertificate: "noDuesCertificate",
    assessmentcertificate: "assessmentCertificate", propertyvaluationcertificate: "propertyValuationCertificate",
    encumbrancecertificate: "encumbranceCertificate", buildingpermissioncertificate: "buildingPermissionCertificate",
    buildingplanapprovalcertificate: "buildingPlanApprovalCertificate", commencementcertificatecc: "commencementCertificate",
    occupancycertificateoc: "occupancyCertificate", completioncertificate: "buildCompletionCertificate",
    buildcompletioncertificate: "buildCompletionCertificate", revisedbuildingpermissioncertificate: "revisedBuildingPermissionCertificate",
    buildingregularizationcertificate: "buildingRegularizationCertificate", buildingrenovationapprovalcertificate: "buildingRenovationApprovalCertificate",
    buildingextensionapprovalcertificate: "buildingExtensionApprovalCertificate", additionalfloorpermissioncertificate: "additionalFloorPermissionCertificate",
    layoutapprovalcertificate: "layoutApprovalCertificate", subdivisionapprovalcertificate: "subdivisionApprovalCertificate",
    amalgamationapprovalcertificate: "amalgamationApprovalCertificate", developmentpermissioncertificate: "developmentPermissionCertificate",
    buildingsafetycertificate: "buildingSafetyCertificate", structuralstabilitycertificate: "structuralStabilityCertificate",
    firesafetycertificate: "fireSafetyCertificate", liftsafetycertificate: "liftSafetyCertificate",
    electricalsafetycertificate: "electricalSafetyCertificate", waterconnectionapprovalcertificate: "waterConnectionApprovalCertificate",
    sewerageconnectionapprovalcertificate: "sewerageConnectionApprovalCertificate", rainwaterharvestingcompliancecertificate: "rainwaterHarvestingComplianceCertificate",
    environmentalclearancecertificate: "environmentalClearanceCertificate", treecuttingpermissioncertificate: "treeCuttingPermissionCertificate",
    demolitionpermissioncertificate: "demolitionPermissionCertificate", roadcuttingpermissioncertificate: "roadCuttingPermissionCertificate",
    noccertificate: "nocCertificate", propertycertificate: "propertyCertificate",
    ownershipcertificate: "ownershipCertificate", landusecertificate: "landUseCertificate",
    zoningcertificate: "zoningCertificate", addressverificationcertificate: "addressVerificationCertificate",
    buildingpermit: "buildingPermit", permit: "buildingPermit",
    possessioncertificate: "possessionCertificate", index2: "index2",
    electricbill: "electricBill",
};

export const mapTypeNameToKey = (name: string): string | null => {
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (MAPPING[norm]) return MAPPING[norm];
    if (norm.includes("commencement")) return "commencementCertificate";
    if (norm.includes("occupancy")) return "occupancyCertificate";
    if (norm.includes("possession")) return "possessionCertificate";
    if (norm.includes("index")) return "index2";
    if (norm.includes("electric")) return "electricBill";
    if (norm.includes("completion") || norm.includes("buildcompletion")) return "buildCompletionCertificate";
    if (norm.includes("buildingpermit") || norm === "permit") return "buildingPermit";
    return null;
};

export const mapApiToBuildingState = (
    items: PropertyCertificateWithStatusDto[] | null | undefined
): BuildingPermissionState => {
    const state: BuildingPermissionState = {};
    if (!items || !Array.isArray(items)) return state;

    items.forEach((item) => {
        state[item.certificateTypeId] = {
            enabled: item.isActive,
            number: sanitizeString(item.certificateNo),
            date: formatDateForInput(item.issueDate),
            documentGuid: sanitizeString(item.documentGuid) || undefined,
            certificateTypeId: item.certificateTypeId,
            propertyCertificateId: item.propertyCertificateId || null,
            fileName: sanitizeString(item.fileName) || undefined,
            certificateTypeName: item.certificateTypeName,
            displayOrder: item.displayOrder
        };
    });
    return state;
};

export const mapBuildingStateToApi = (
    state: BuildingPermissionState,
    propertyId: number
): PropertyCertificateBulkSaveDto => {
    const certificates: PropertyCertificateItemDto[] = [];
    Object.values(state).forEach((item) => {
        certificates.push({
            certificateTypeId: item.certificateTypeId,
            isEnabled: item.enabled,
            certificateNumber: item.number ? item.number : null,
            certificateDate: item.date ? `${item.date}T00:00:00` : null,
            propertyCertificateId: item.propertyCertificateId || null,
            existingDocumentGuid: item.documentGuid || null,
            hasNewDocument: false
        });
    });
    return { propertyId, certificates };
};

export const localizeBackendError = (errorMsg: string, t: (key: string) => string): string => {
    if (!errorMsg) return "";
    const cleanMsg = errorMsg.trim().toLowerCase();
    if (cleanMsg.includes("without an issue date")) {
        return t("building.errors.cannotEnableWithoutDate") || "Cannot enable certificate without an issue date.";
    }
    if (cleanMsg.includes("without a certificate number")) {
        return t("building.errors.cannotEnableWithoutNumber") || "Cannot enable certificate without a certificate number.";
    }
    if (cleanMsg.includes("cannot be in the future")) {
        return t("building.errors.futureDate") || "Issue date cannot be in the future.";
    }
    if (cleanMsg.includes("cannot exceed 100 characters")) {
        return t("building.errors.numberExceedsLimit") || "Certificate number cannot exceed 100 characters.";
    }
    if (cleanMsg.includes("not found")) {
        return t("building.errors.notFound") || "Certificate not found.";
    }
    return errorMsg;
};

export const parseAndLocalizeBackendError = (
    errorMsg: string,
    buildingPermission: Record<number, { certificateTypeName?: string }>,
    t: (key: string) => string
): string => {
    if (!errorMsg) return "";
    const errors = errorMsg.split(";").map(err => err.trim()).filter(Boolean);
    const localizedErrors = errors.map(err => {
        const match = err.match(/Certificate Type (\d+):\s*(.*)/i);
        if (match) {
            const typeId = parseInt(match[1]);
            const innerError = match[2];
            const cert = buildingPermission[typeId];
            let certName = `Certificate Type ${typeId}`;
            if (cert?.certificateTypeName) {
                const key = mapTypeNameToKey(cert.certificateTypeName);
                certName = key && t(`building.${key}`) && t(`building.${key}`) !== `building.${key}`
                    ? t(`building.${key}`)
                    : cert.certificateTypeName;
            }
            const localizedInner = localizeBackendError(innerError, t);
            return `${certName}: ${localizedInner}`;
        }
        return localizeBackendError(err, t);
    });
    return localizedErrors.join("\n");
};
