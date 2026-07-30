export function getFloorKey(propNo: string, partitionNo?: string | null): string {
  if (partitionNo) {
    return `${propNo} / ${partitionNo}`;
  }
  return propNo;
}

export function calculateMatchScore(
  newProp: {
    propNo: string;
    owner: string;
    address: string;
    builtUpArea: number;
    floors: string;
    tax: number;
    cts: string;
    rv: number;
    use: string;
    ward: string;
    zone: string;
    plotNo: string;
    constructionYear: string;
  },
  cand: {
    propNo: string;
    owner: string;
    address: string;
    area: number;
    floors: string;
    tax: number;
    cts?: string;
    rv?: number;
    use?: string;
    ward?: string;
    zone?: string;
    plotNo?: string;
    constructionYear?: string;
  }
): number {
  let matchedCount = 0;
  let totalCount = 11;

  // 1. Property No.
  const newNum = newProp.propNo.replace(/\D/g, "");
  const oldNum = cand.propNo.replace(/\D/g, "");
  if (newNum === oldNum && newNum !== "") matchedCount++;

  // 2. Owner Name
  const o1 = newProp.owner.toLowerCase().replace(/[^a-z0-9]/g, "");
  const o2 = cand.owner.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (o1 !== "" && o2 !== "" && (o1.includes(o2) || o2.includes(o1))) matchedCount++;

  // 3. Address
  const a1 = newProp.address.toLowerCase();
  const a2 = cand.address.toLowerCase();
  if (a1 !== "" && a2 !== "" && (a1.includes(a2) || a2.includes(a1))) {
    matchedCount++;
  } else if (a1 !== "" && a2 !== "") {
    const zones = ["kolshet", "naupada", "majiwada"];
    const newZoneMatch = zones.find(z => a1.includes(z));
    const oldZoneMatch = zones.find(z => a2.includes(z));
    if (newZoneMatch && oldZoneMatch && newZoneMatch === oldZoneMatch) {
      matchedCount += 0.5;
    }
  }

  // 4. Area
  if (cand.area > 0 && newProp.builtUpArea > 0) {
    const diff = Math.abs(newProp.builtUpArea - cand.area);
    const pct = (diff / cand.area) * 100;
    if (pct <= 10) matchedCount++;
    else if (pct <= 25) matchedCount += 0.5;
  }

  // 5. Floors
  const f1 = newProp.floors.toLowerCase();
  const f2 = cand.floors.toLowerCase();
  if (f1 !== "" && f2 !== "") {
    if (f1 === f2) {
      matchedCount++;
    } else if ((f1.includes("ground + 1") && f2.includes("g + 1")) || (f1.includes("ground only") && f2.includes("ground only"))) {
      matchedCount++;
    }
  }

  // 6. Tax
  if (cand.tax > 0 && newProp.tax > 0) {
    const diff = Math.abs(newProp.tax - cand.tax);
    const pct = (diff / cand.tax) * 100;
    if (pct <= 10) matchedCount++;
    else if (pct <= 25) matchedCount += 0.5;
  }

  // 7. CTS
  const c1 = newProp.cts.toLowerCase().replace(/[^0-9a-z]/g, "");
  const c2 = (cand.cts || "").toLowerCase().replace(/[^0-9a-z]/g, "");
  if (c1 === c2 && c1 !== "") matchedCount++;

  // 8. Use Category
  const u1 = newProp.use.toLowerCase().replace(/[^a-z0-9]/g, "");
  const u2 = (cand.use || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (u1 !== "" && u2 !== "" && (u1.includes(u2) || u2.includes(u1))) matchedCount++;

  // 9. Zone / Ward
  const z1 = newProp.zone.toLowerCase().replace(/[^a-z0-9]/g, "");
  const z2 = (cand.zone || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const w1 = newProp.ward.toLowerCase().replace(/[^a-z0-9]/g, "");
  const w2 = (cand.ward || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if ((z1 !== "" && z2 !== "" && z1 === z2) || (w1 !== "" && w2 !== "" && w1 === w2)) matchedCount++;

  // 10. Plot Number
  const p1 = newProp.plotNo.toLowerCase().replace(/[^a-z0-9]/g, "");
  const p2 = (cand.plotNo || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (p1 !== "" && p2 !== "" && p1 === p2) matchedCount++;

  // 11. Construction Year
  const y1 = newProp.constructionYear.toLowerCase().replace(/[^a-z0-9]/g, "");
  const y2 = (cand.constructionYear || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (y1 !== "" && y2 !== "" && y1 === y2) matchedCount++;

  // 12. RV / CV comparison
  if (cand.rv && cand.rv > 0 && newProp.rv && newProp.rv > 0) {
    totalCount = 12;
    const diff = Math.abs(newProp.rv - cand.rv);
    const pct = (diff / cand.rv) * 100;
    if (pct <= 10) matchedCount++;
    else if (pct <= 25) matchedCount += 0.5;
  }

  return Math.round((matchedCount / totalCount) * 100);
}
