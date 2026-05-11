import type { IZoneDescription, RateCategory } from "@/types/RVRateMaster";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  taxZoneId?: number;
  [key: string]: number | string | undefined;
};

interface ParsedImportData {
  zoneEdits: Record<string, Record<string, number>>;
  importedRateCount: number;
}

/**
 * Parse CSV content into zone edits
 */
export function parseCsvContent(
  csvText: string,
  allZones: IZoneDescription[],
  rateCategories: RateCategory[]
): ParsedImportData {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('File is empty or invalid');
  }

  const dataLines = lines.slice(1); // Skip header
  const excelDataByZone = new Map<string, Record<string, number>>();
  let importedRateCount = 0;

  dataLines.forEach((line) => {
    const values = line.split(',').map(v => v.trim());
    const taxZoneNo = values[0];
    const zone = allZones.find(z => String(z.zoneNo) === taxZoneNo);
    
    if (!zone) return; // Skip if zone not found

    const zoneEdits: Record<string, number> = {};

    rateCategories.forEach((cat, catIndex) => {
      const valueIndex = 1 + catIndex;
      if (valueIndex < values.length) {
        const parsedValue = parseFloat(values[valueIndex]);
        const finalValue = isNaN(parsedValue) ? 0 : parsedValue;
        if (finalValue > 0) {
          importedRateCount++;
          const key = cat.constructionCode || cat.constructionId;
          zoneEdits[key] = finalValue;
        }
      }
    });

    if (Object.keys(zoneEdits).length > 0) {
      excelDataByZone.set(zone.zoneNo, zoneEdits);
    }
  });

  // Convert Map to Record
  const zoneEdits: Record<string, Record<string, number>> = {};
  excelDataByZone.forEach((edits, zoneNo) => {
    zoneEdits[zoneNo] = edits;
  });

  return { zoneEdits, importedRateCount };
}

/**
 * Update matrix data with imported edits
 */
export function applyImportedEditsToMatrix(
  matrixData: MatrixRow[],
  importedEdits: Record<string, Record<string, number>>
): MatrixRow[] {
  return matrixData.map((row) => {
    const zoneNo = row.zoneNo as string;
    const zoneEdits = importedEdits[zoneNo] || {};
    
    if (Object.keys(zoneEdits).length > 0) {
      return { ...row, ...zoneEdits };
    }
    return row;
  });
}

/**
 * Validate uploaded file type
 */
export function validateFileType(file: File): boolean {
  const validTypes = ['text/csv'];
  return validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.csv');
}
