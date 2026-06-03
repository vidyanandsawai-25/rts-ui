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
    intValue: number | null;
    decimalValue: number | null;
    textValue: string | null;
    dateValue: string | null;
    documentBindingId: number | null;
    uploadedGuid?: string;
    remark: string | null;
    isUploading: boolean;
}

/**
 * Flattens the nested social attributes tree into a flat map keyed by socialAttributeId.
 */
export function flattenAttributes(attributes: SocialAttributeHierarchyDto[]): Record<number, FlatSocialAttributeState> {
    const map: Record<number, FlatSocialAttributeState> = {};
    const traverse = (attrs: SocialAttributeHierarchyDto[], parentId?: number | null) => {
        for (const attr of attrs) {
            map[attr.id] = {
                id: attr.propertySocialDetailId || null,
                socialAttributeId: attr.id,
                socialAttributeCode: attr.socialAttributeCode,
                socialAttributeName: attr.socialAttributeName,
                dataType: attr.dataType,
                parentAttributeId: attr.parentAttributeId || parentId || null,
                isRequiredWhenParentTrue: attr.isRequiredWhenParentTrue,
                bitValue: attr.bitValue ?? null,
                intValue: attr.intValue ?? null,
                decimalValue: attr.decimalValue ?? null,
                textValue: attr.textValue ?? null,
                dateValue: attr.dateValue ? attr.dateValue.split("T")[0] : null,
                documentBindingId: attr.documentBindingId ?? null,
                remark: attr.remark ?? null,
                isUploading: false
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
    if (!attr.parentAttributeId) return true;
    const parent = currentData[attr.parentAttributeId];
    if (!parent) return false;
    return !!parent.bitValue && isAttributeEnabled(parent, currentData);
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
 */
export function getLocalizedName(
    code: string | undefined | null,
    name: string | undefined | null,
    t?: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has: (key: string) => boolean;
    }
): string {
    const rawName = name || code || "";
    if (!t) return rawName;

    const tryTranslate = (key: string): string | null => {
        const fullKey = `discount.socialAttributes.${key}`;
        if (typeof t.has === "function" && t.has(fullKey)) {
            return t(fullKey);
        }
        return null;
    };

    if (code) {
        // 1. Direct code lookup
        let translated = tryTranslate(code);
        if (translated !== null) return translated;

        // 2. Uppercase code lookup
        translated = tryTranslate(code.toUpperCase());
        if (translated !== null) return translated;
    }

    if (name) {
        // 3. Sanitized name lookup
        const sanitized = name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "");
        
        const translated = tryTranslate(sanitized);
        if (translated !== null) return translated;
    }

    return rawName;
}
