/**
 * Utility functions for Floor filtering and formatting in PTIS Redesign
 */

export function normalizeFloor(floor: unknown): string {
  if (floor == null) return '';
  return String(floor).trim();
}

export function formatFloorLabel(floor: string): string {
  const trimmed = floor.trim();
  const lower = trimmed.toLowerCase();
  if (lower === '0' || lower === 'g' || lower.includes('ground')) {
    return 'Ground Floor';
  }
  const numMatch = trimmed.match(/^(\d+)$/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${n}${suffix} Floor`;
  }
  return trimmed;
}

export function matchesFloor(
  unitFloor: unknown,
  selectedFloor: string | null | undefined,
  wgFl?: string
): boolean {
  if (!selectedFloor || selectedFloor.trim() === '' || selectedFloor.toLowerCase() === 'all') {
    return true;
  }

  const sel = selectedFloor.trim().toLowerCase();
  const unitStr = unitFloor != null ? String(unitFloor).trim().toLowerCase() : '';
  const wgFlStr = wgFl != null ? String(wgFl).trim().toLowerCase() : '';

  if (unitStr && unitStr === sel) return true;

  const isSelGround = sel === '0' || sel === 'g' || sel.includes('ground');
  if (isSelGround) {
    if (unitStr === '0' || unitStr === 'g' || unitStr.includes('ground')) return true;
    if (wgFlStr.includes('/ 0') || wgFlStr.includes('/ g') || wgFlStr.includes('ground')) return true;
  }

  const selNumMatch = sel.match(/\d+/);
  const selNum = selNumMatch ? parseInt(selNumMatch[0], 10) : null;

  if (selNum !== null) {
    const unitNumMatch = unitStr.match(/\d+/);
    const unitNum = unitNumMatch ? parseInt(unitNumMatch[0], 10) : null;
    if (unitNum !== null && unitNum === selNum) return true;

    if (wgFlStr) {
      const parts = wgFlStr.split('/');
      if (parts.length > 1) {
        const flPart = parts[parts.length - 1].trim();
        const flPartNumMatch = flPart.match(/\d+/);
        const flPartNum = flPartNumMatch ? parseInt(flPartNumMatch[0], 10) : null;
        if (flPartNum !== null && flPartNum === selNum) return true;
      }
    }
  }

  return false;
}

export function extractAvailableFloors(
  surveyUnits?: { flr?: unknown; rawSurvey?: { floor?: unknown } }[],
  previousUnits?: { flr?: unknown; rawSurvey?: { floor?: unknown } }[],
  wings?: { wingMasterId?: number; floorRange?: string }[],
  selectedWingId?: number | null
): string[] {
  const set = new Set<string>();

  const collect = (val: unknown) => {
    if (val == null) return;
    const s = String(val).trim();
    if (s && s !== '-' && s !== 'null' && s !== 'undefined') {
      set.add(s);
    }
  };

  surveyUnits?.forEach((u) => {
    collect(u.rawSurvey?.floor);
    collect(u.flr);
  });
  previousUnits?.forEach((u) => {
    collect(u.rawSurvey?.floor);
    collect(u.flr);
  });

  if (set.size === 0 && wings && wings.length > 0) {
    const activeWing = selectedWingId
      ? wings.find((w) => w.wingMasterId === selectedWingId) || wings[0]
      : wings[0];
    if (activeWing?.floorRange) {
      const match = activeWing.floorRange.match(/\d+/g);
      if (match && match.length > 0) {
        const maxFloor = Math.min(Math.max(...match.map(Number)), 50);
        if (maxFloor > 0) {
          for (let i = 1; i <= maxFloor; i++) {
            set.add(String(i));
          }
        }
      }
    }
  }

  if (set.size === 0) {
    return ['1', '2', '3', '4', '5', '6', '7'];
  }

  return Array.from(set).sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aIsG = aLower === '0' || aLower === 'g' || aLower.includes('ground');
    const bIsG = bLower === '0' || bLower === 'g' || bLower.includes('ground');
    if (aIsG && !bIsG) return -1;
    if (!aIsG && bIsG) return 1;

    const aNum = a.match(/\d+/);
    const bNum = b.match(/\d+/);
    if (aNum && bNum) {
      const diff = parseInt(aNum[0], 10) - parseInt(bNum[0], 10);
      if (diff !== 0) return diff;
    }
    return a.localeCompare(b, undefined, { numeric: true });
  });
}
