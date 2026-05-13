import { BuildingPermissionItems, BuildingPermissionState } from "@/types/building-permission.types";

/**
 * Formats a date string for input type="date" (YYYY-MM-DD)
 */

/**
 * Formats a date string for input type="date" (YYYY-MM-DD)
 * API sometimes returns the literal string "string" as a placeholder for missing values
 */
export const formatDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === "string") return "";
    try {
        return dateStr.split('T')[0];
    } catch {
        return "";
    }
};

/**
 * Checks if a certificate entry should be considered enabled based on its values
 */
export const isCertificateEnabled = (
    no: string | null | undefined, 
    date: string | null | undefined, 
    guid: string | null | undefined
): boolean => {
    const isValid = (val: string | null | undefined) =>
        !!val &&
        String(val).trim() !== "" &&
        String(val).toLowerCase() !== "string" &&
        String(val).toLowerCase() !== "null";

    return isValid(no) || isValid(date) || isValid(guid);
};

/**
 * Maps API response items to the internal component state
 */
export const mapApiToBuildingState = (items: BuildingPermissionItems | null | undefined): BuildingPermissionState => {
    const normalizeGuid = (guid: string | null | undefined) => {
        if (!guid || guid.toLowerCase() === "null" || guid.toLowerCase() === "string") return undefined;
        return guid;
    };
    const createEntry = (no: string | null | undefined, date: string | null | undefined, guid: string | null | undefined) => ({
        enabled: isCertificateEnabled(no, date, guid),
        number: no === "string" ? "" : (no || ""),
        date: formatDateForInput(date),
        documentGuid: normalizeGuid(guid),
    });

    if (!items) {
        const emptyEntry = { enabled: false, number: "", date: "" };
        return {
            buildingPermit: emptyEntry,
            commencementCertificate: emptyEntry,
            occupancyCertificate: emptyEntry,
            possessionCertificate: emptyEntry,
            index2: emptyEntry,
            electricBill: emptyEntry,
            buildCompletionCertificate: emptyEntry,
        };
    }

    return {
        buildingPermit: createEntry(items.buildingPermitNo, items.buildingPermitDate, items.buildingPermitDocumentGuid),
        commencementCertificate: createEntry(items.commencementNo, items.commencementDate, items.commencementDocumentGuid),
        occupancyCertificate: createEntry(items.occupancyCertNo, items.occupancyCertDate, items.occupancyCertDocumentGuid),
        possessionCertificate: createEntry(items.possessionCertNo, items.possessionCertDate, items.possessionCertDocumentGuid),
        index2: createEntry(items.index2No, items.index2Date, items.index2DocumentGuid),
        electricBill: createEntry(items.electricBillNo, items.electricBillDate, items.electricBillDocumentGuid),
        buildCompletionCertificate: createEntry(items.buildCompletionCertNo, items.buildCompletionDate, items.buildCompletionCertDocumentGuid),
    };
};

/**
 * Maps component state back to the API payload format
 */
export const mapBuildingStateToApi = (state: BuildingPermissionState): Partial<BuildingPermissionItems> => {
    const formatPayloadDate = (date: string | undefined) => date ? `${date}T00:00:00` : null;

    return {
        buildingPermitNo: state.buildingPermit.number || null,
        buildingPermitDate: formatPayloadDate(state.buildingPermit.date),
        buildingPermitDocumentGuid: state.buildingPermit.documentGuid || null,

        commencementNo: state.commencementCertificate.number || null,
        commencementDate: formatPayloadDate(state.commencementCertificate.date),
        commencementDocumentGuid: state.commencementCertificate.documentGuid || null,

        occupancyCertNo: state.occupancyCertificate.number || null,
        occupancyCertDate: formatPayloadDate(state.occupancyCertificate.date),
        occupancyCertDocumentGuid: state.occupancyCertificate.documentGuid || null,

        possessionCertNo: state.possessionCertificate.number || null,
        possessionCertDate: formatPayloadDate(state.possessionCertificate.date),
        possessionCertDocumentGuid: state.possessionCertificate.documentGuid || null,

        index2No: state.index2.number || null,
        index2Date: formatPayloadDate(state.index2.date),
        index2DocumentGuid: state.index2.documentGuid || null,

        electricBillNo: state.electricBill.number || null,
        electricBillDate: formatPayloadDate(state.electricBill.date),
        electricBillDocumentGuid: state.electricBill.documentGuid || null,

        buildCompletionCertNo: state.buildCompletionCertificate.number || null,
        buildCompletionDate: formatPayloadDate(state.buildCompletionCertificate.date),
        buildCompletionCertDocumentGuid: state.buildCompletionCertificate.documentGuid || null,
    };
};
