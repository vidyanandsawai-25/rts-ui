import { AgeFactorCVMaster } from "@/types/ageFactorCv.types";

/**
 * Parses a range string like "0-10" into { ageFrom: number, ageTo: number }.
 */
export const parseRangeValue = (rangeVal: string) => {
    const [ageFrom, ageTo] = rangeVal.split("-").map(Number);
    if (isNaN(ageFrom) || isNaN(ageTo)) {
        return null;
    }
    return { ageFrom, ageTo };
};

/**
 * Generates a unique identifier for an AgeFactorCVMaster record.
 * Uses ID for existing records and a composite key for unsaved records.
 */
export const getAgeFactorRowUid = (row: AgeFactorCVMaster): string => {
    const yearId = row.yearRangeCVId || row.yearRangeCVID || 'noYear';
    return row.id !== 0
        ? row.id.toString()
        : `${row.id}-${row.constructionTypeId}-${yearId}-${row.ageFrom}-${row.ageTo}`;
};

/**
 * Checks if an age factor record already exists in the database.
 * This serves as duplicate checking against persistent storage.
 */
export const hasExistingAgeFactor = (
    constructionTypeId: number,
    targetYearId: number,
    ageFrom: number,
    ageTo: number,
    allAgeFactors: AgeFactorCVMaster[]
) =>
    allAgeFactors.some(r =>
        r.id > 0 &&
        r.constructionTypeId === constructionTypeId &&
        (r.yearRangeCVId === targetYearId || r.yearRangeCVID === targetYearId) &&
        r.ageFrom === ageFrom &&
        r.ageTo === ageTo
    );

/**
 * Validates the factor input value.
 */
export const validateFactorValue = (factorValue: string): { isValid: boolean; factor: number } => {
    const factor = parseFloat(factorValue);
    if (isNaN(factor) || factor <= 0) {
        return { isValid: false, factor: 0 };
    }
    return { isValid: true, factor };
};

/**
 * Checks if a row matches the given filter criteria.
 */
export const matchesFilterCriteria = (
    row: AgeFactorCVMaster,
    criteria: {
        constructionType: string;
        selectedAgeRange: string;
        ageFrom: string;
        ageTo: string;
        selectedYear: string;
    }
): boolean => {
    const { constructionType, selectedAgeRange, ageFrom, ageTo, selectedYear } = criteria;

    const matchesConstruction = !constructionType || row.constructionTypeId === parseInt(constructionType);

    let matchesAge = true;
    if (selectedAgeRange) {
        const [minAge, maxAge] = selectedAgeRange.split("-").map(Number);
        matchesAge = row.ageFrom === minAge && row.ageTo === maxAge;
    } else if (ageFrom || ageTo) {
        matchesAge = (!ageFrom || row.ageFrom >= parseInt(ageFrom)) &&
            (!ageTo || row.ageTo <= parseInt(ageTo));
    }

    const rowYearId = row.yearRangeCVId || row.yearRangeCVID || 0;
    const matchesYear = !selectedYear || Number(rowYearId) === parseInt(selectedYear);

    return matchesConstruction && matchesAge && matchesYear;
};
