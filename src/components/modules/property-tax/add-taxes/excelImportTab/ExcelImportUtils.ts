import { WardItem } from '@/types/wardMaster.types';

export const normalizeKey = (k: string) => k.toLowerCase().replace(/[\s\-_]/g, '');

export const autoDetectScopeType = (dataRows: Record<string, unknown>[]) => {
  if (dataRows.length === 0) return 'property';

  const sampleRow = dataRows[0];
  const headers = Object.keys(sampleRow).map(normalizeKey);

  const hasPropertyWise = headers.includes('upicid') || headers.includes('mobileno');
  const hasBuildingWise = headers.includes('zone') || headers.includes('ward') || headers.includes('propertyno');

  if (hasPropertyWise && !hasBuildingWise) {
    return 'property';
  } else if (hasBuildingWise && !hasPropertyWise) {
    return 'building';
  }
  return 'property';
};

export const mapExcelDataToPayload = (
  dataRows: Record<string, unknown>[],
  scopeType: string,
  zoneOptions: { value: string; label: string }[],
  fetchedWards: WardItem[]
) => {
  const zoneIds: number[] = [];
  const wardIds: number[] = [];
  const building: string[] = [];
  const upicIds: string[] = [];
  const mobileNumbers: string[] = [];

  dataRows.forEach(row => {
    let rawZone = "";
    let rawWard = "";
    let rawPropNo = "";
    let rawUpicId = "";
    let rawMobile = "";

    Object.keys(row).forEach(k => {
      const norm = normalizeKey(k);
      if (norm === 'zone') rawZone = String(row[k]).trim();
      else if (norm === 'ward') rawWard = String(row[k]).trim();
      else if (norm === 'propertyno' || norm === 'propertynumber') rawPropNo = String(row[k]).trim();
      else if (norm === 'upicid' || norm === 'upic') rawUpicId = String(row[k]).trim();
      else if (norm === 'mobileno' || norm === 'mobile') rawMobile = String(row[k]).trim();
    });

    if (rawZone) {
      const matchedZone = zoneOptions.find(opt => {
        const labelLower = opt.label.toLowerCase();
        const valueLower = opt.value.toLowerCase();
        const valLower = rawZone.toLowerCase();
        return labelLower.includes(valLower) || valueLower === valLower;
      });
      if (matchedZone) {
        zoneIds.push(Number(matchedZone.value));
      } else if (/^\d+$/.test(rawZone)) {
        zoneIds.push(Number(rawZone));
      }
    }

    if (rawWard) {
      const matchedWard = fetchedWards.find(w => {
        const descLower = (w.description || "").toLowerCase();
        const wardNoLower = (w.wardNo || "").toLowerCase();
        const valLower = rawWard.toLowerCase();
        return descLower.includes(valLower) || wardNoLower === valLower || String(w.id) === valLower;
      });
      if (matchedWard) {
        wardIds.push(Number(matchedWard.id));
      } else if (/^\d+$/.test(rawWard)) {
        wardIds.push(Number(rawWard));
      }
    }

    if (rawPropNo) building.push(rawPropNo);
    if (rawUpicId) upicIds.push(rawUpicId);
    if (rawMobile) mobileNumbers.push(rawMobile);
  });

  const uniqueZoneIds = Array.from(new Set(zoneIds)).filter(Boolean);
  const uniqueWardIds = Array.from(new Set(wardIds)).filter(Boolean);
  const uniqueBuilding = Array.from(new Set(building)).filter(Boolean);
  const uniqueUpicIds = Array.from(new Set(upicIds)).filter(Boolean);
  const uniqueMobileNumbers = Array.from(new Set(mobileNumbers)).filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Scope data format varies dynamically by scope type
  const scope: any = {};
  if (scopeType === 'building') {
    scope.zoneIds = uniqueZoneIds;
    scope.wardIds = uniqueWardIds;
    scope.building = uniqueBuilding;
  } else {
    scope.upicIds = uniqueUpicIds;
    scope.mobileNumbers = uniqueMobileNumbers;
  }

  return scope;
};
