import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";

export interface FlatSocialAttributeState {
    id: number | null; // Database propertySocialDetailId
    socialAttributeId: number;
    socialAttributeCode: string;
    socialAttributeName: string;
    dataType: string;
    parentAttributeId: number | null | undefined;
    isRequiredWhenParentTrue: boolean;
    bitValue: boolean | null;
    intValue: number | string | null;
    decimalValue: number | string | null;
    textValue: string | null;
    dateValue: string | null;
    documentBindingId: number | null;
    uploadedGuid?: string;
    remark: string | null;
    isUploading: boolean;
    isDeleting?: boolean;
    isPhotoRequired?: boolean;
    isDocumentRequired?: boolean;
    documentGuid?: string | null;
    documentUrl?: string | null;
    photoBindingId?: number | null;
    photoGuid?: string | null;
    pendingFile?: File;
}

const normalizePositiveId = (value: number | null | undefined): number | null => {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
};

/**
 * Flattens the nested social attributes tree into a flat map keyed by socialAttributeId.
 */
export function flattenAttributes(attributes: SocialAttributeHierarchyDto[]): Record<number, FlatSocialAttributeState> {
    const map: Record<number, FlatSocialAttributeState> = {};
    const traverse = (attrs: SocialAttributeHierarchyDto[], parentId?: number | null) => {
        for (const attr of attrs) {
            const isBitType = attr.dataType.toUpperCase() === "BIT";
            const isRootAttr = attr.parentAttributeId === null || attr.parentAttributeId === undefined || !parentId;
            let initialBitValue = attr.bitValue ?? null;

            if (isBitType || isRootAttr) {
                initialBitValue = attr.bitValue ?? false;
            } else {
                const hasValue = 
                    (attr.intValue !== null && attr.intValue !== undefined) || 
                    (attr.decimalValue !== null && attr.decimalValue !== undefined) || 
                    (attr.textValue !== null && attr.textValue !== undefined && String(attr.textValue).trim() !== "") || 
                    (attr.bitValue === true);
                initialBitValue = hasValue;
            }

            map[attr.id] = {
                id: attr.propertySocialDetailId ?? null,
                socialAttributeId: attr.id,
                socialAttributeCode: attr.socialAttributeCode,
                socialAttributeName: attr.socialAttributeName,
                dataType: attr.dataType,
                parentAttributeId: attr.parentAttributeId || parentId || null,
                isRequiredWhenParentTrue: attr.isRequiredWhenParentTrue,
                bitValue: initialBitValue,
                intValue: attr.intValue ?? null,
                decimalValue: attr.decimalValue ?? null,
                textValue: attr.textValue ?? null,
                dateValue: attr.dateValue ? attr.dateValue.split("T")[0] : null,
                documentBindingId: normalizePositiveId(attr.documentBindingId ?? attr.photoBindingId),
                remark: attr.remark ?? null,
                isUploading: false,
                isPhotoRequired: attr.isPhotoRequired,
                isDocumentRequired: attr.isDocumentRequired,
                documentGuid: attr.documentGuid ?? attr.photoGuid ?? null,
                documentUrl: (attr.documentGuid ?? attr.photoGuid) ? `/api/documents/${encodeURIComponent(attr.documentGuid ?? attr.photoGuid ?? "")}/view` : null,
                photoBindingId: normalizePositiveId(attr.photoBindingId),
                photoGuid: attr.photoGuid ?? null
            };
            if (attr.children && attr.children.length > 0) {
                traverse(attr.children, attr.id);
            }
        }
    };
    traverse(attributes, null);
    return map;
}

/**
 * Checks if a given attribute is enabled based on its parent attribute status.
 */
export function isAttributeEnabled(
    attr: FlatSocialAttributeState,
    currentData: Record<number, FlatSocialAttributeState>
): boolean {
    const code = (attr.socialAttributeCode || "").toUpperCase();
    const isSpecialToggle = 
        code === "ROAD_WIDTH" || 
        code.includes("WATER_CONN") || 
        code.includes("TREE");

    if (isSpecialToggle && attr.bitValue === false) {
        return false;
    }

    if (!attr.parentAttributeId) {
        if (attr.dataType.toUpperCase() === "BIT") {
            return attr.bitValue === true;
        }
        return true;
    }
    const parent = currentData[attr.parentAttributeId];
    if (!parent) return false;
    return parent.bitValue === true && isAttributeEnabled(parent, currentData);
}

/**
 * Checks if a card contains validation errors.
 */
export function isCardInvalid(
    attr: SocialAttributeHierarchyDto,
    errors: Record<number, string>
): boolean {
    if (errors[attr.id]) return true;
    return (attr.children ?? []).some((child) => isCardInvalid(child, errors));
}

/**
 * Gets a localized name/label for a social attribute code and name using next-intl translations.
 * Prioritizes dynamic DB attribute names when provided, while respecting non-English (Hindi/Marathi) translations.
 */
export function getLocalizedName(
    code: string | undefined | null,
    name: string | undefined | null,
    t?: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    }
): string {
    const trimmedName = name?.trim();
    const rawName = trimmedName || code || "";
    if (!t) return rawName;

    const tryTranslate = (key: string): string | null => {
        const fullKey = `discount.socialAttributes.${key}`;
        if (typeof t.has === "function") {
            if (t.has(fullKey)) {
                return t(fullKey);
            }
        } else {
            try {
                const val = t(fullKey);
                if (val && !val.includes("discount.socialAttributes")) {
                    return val;
                }
            } catch {
                // Ignore missing translation errors
            }
        }
        return null;
    };

    let translated: string | null = null;
    if (code) {
        translated = tryTranslate(code) || tryTranslate(code.toUpperCase());
    }

    if (!translated && trimmedName) {
        const sanitized = trimmedName
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "");
        translated = tryTranslate(sanitized);
    }

    if (translated !== null) {
        // If a non-English (Hindi/Marathi Devanagari range) translation is present, use it for i18n
        const isNonEnglishLocale = /[\u0900-\u097F]/.test(translated);
        if (isNonEnglishLocale) {
            return translated;
        }
    }

    // When dynamic DB name is provided from API, prefer it over static English dictionary fallbacks
    if (trimmedName) {
        return trimmedName;
    }

    return translated || rawName;
}

