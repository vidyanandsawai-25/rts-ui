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
  let totalCount = 0;

  // 1. Property No.
  const newNum = newProp.propNo.replace(/\D/g, "");
  const oldNum = cand.propNo.replace(/\D/g, "");
  if (newNum !== "" || oldNum !== "") {
    totalCount++;
    if (newNum === oldNum && newNum !== "") matchedCount++;
  }

  // 2. Owner Name (supports English & Marathi Unicode)
  const o1 = newProp.owner.toLowerCase().trim();
  const o2 = cand.owner.toLowerCase().trim();
  if (o1 !== "" || o2 !== "") {
    totalCount++;
    if (o1 !== "" && o2 !== "") {
      const clean1 = o1.replace(/[^a-z0-9\u0900-\u097F]/g, "");
      const clean2 = o2.replace(/[^a-z0-9\u0900-\u097F]/g, "");
      if (clean1 !== "" && clean2 !== "" && (clean1.includes(clean2) || clean2.includes(clean1))) {
        matchedCount++;
      }
    }
  }

  // 3. Address
  const a1 = newProp.address.toLowerCase();
  const a2 = cand.address.toLowerCase();
  if (a1 !== "" || a2 !== "") {
    totalCount++;
    if (a1 !== "" && a2 !== "") {
      if (a1.includes(a2) || a2.includes(a1)) {
        matchedCount++;
      } else {
        const tokens1 = a1.split(/[\s,.-]+/).filter(t => t.length > 3);
        const tokens2 = a2.split(/[\s,.-]+/).filter(t => t.length > 3);
        if (tokens1.some(t => tokens2.includes(t))) {
          matchedCount++;
        } else {
          const zones = ["kolshet", "naupada", "majiwada"];
          const newZoneMatch = zones.find(z => a1.includes(z));
          const oldZoneMatch = zones.find(z => a2.includes(z));
          if (newZoneMatch && oldZoneMatch && newZoneMatch === oldZoneMatch) {
            matchedCount += 0.5;
          }
        }
      }
    }
  }

  // 4. Area
  if (cand.area > 0 || newProp.builtUpArea > 0) {
    totalCount++;
    if (cand.area > 0 && newProp.builtUpArea > 0) {
      const diff = Math.abs(newProp.builtUpArea - cand.area);
      const pct = (diff / cand.area) * 100;
      if (pct <= 10) matchedCount++;
      else if (pct <= 25) matchedCount += 0.5;
    }
  }

  // 5. Floors
  const f1 = newProp.floors.toLowerCase();
  const f2 = cand.floors.toLowerCase();
  if (f1 !== "" || f2 !== "") {
    totalCount++;
    if (f1 !== "" && f2 !== "") {
      if (f1 === f2) {
        matchedCount++;
      } else {
        const isGround1 = f1.includes("ground") || f1.includes("तळमजला") || f1.includes("g");
        const isGround2 = f2.includes("ground") || f2.includes("तळमजला") || f2.includes("g");
        if (isGround1 && isGround2) matchedCount++;
      }
    }
  }

  // 6. Tax
  if (cand.tax > 0 || newProp.tax > 0) {
    totalCount++;
    if (cand.tax > 0 && newProp.tax > 0) {
      const diff = Math.abs(newProp.tax - cand.tax);
      const pct = (diff / cand.tax) * 100;
      if (pct <= 10) matchedCount++;
      else if (pct <= 25) matchedCount += 0.5;
    }
  }

  // 7. CTS
  const c1 = newProp.cts.toLowerCase().replace(/[^0-9a-z]/g, "");
  const c2 = (cand.cts || "").toLowerCase().replace(/[^0-9a-z]/g, "");
  if (c1 !== "" || c2 !== "") {
    totalCount++;
    if (c1 !== "" && c2 !== "" && (c1 === c2 || c1.includes(c2) || c2.includes(c1))) matchedCount++;
  }

  // 8. Use Category (supports Marathi ↔ English cross-lingual matching)
  const u1 = (newProp.use || "").toLowerCase().trim();
  const u2 = (cand.use || "").toLowerCase().trim();
  if (u1 !== "" || u2 !== "") {
    totalCount++;
    if (u1 !== "" && u2 !== "") {
      if (u1.includes(u2) || u2.includes(u1)) {
        matchedCount++;
      } else {
        const isRes1 = u1.includes("res") || u1.includes("निवासी") || u1.includes("रिवासी");
        const isRes2 = u2.includes("res") || u2.includes("निवासी") || u2.includes("रिवासी");
        const isComm1 = u1.includes("comm") || u1.includes("व्यावसायिक") || u1.includes("वाणिज्यिक");
        const isComm2 = u2.includes("comm") || u2.includes("व्यावसायिक") || u2.includes("वाणिज्यिक");
        if ((isRes1 && isRes2) || (isComm1 && isComm2)) {
          matchedCount++;
        }
      }
    }
  }

  // 9. Zone / Ward
  const z1 = (newProp.zone || "").toLowerCase().replace(/\D/g, "");
  const z2 = (cand.zone || "").toLowerCase().replace(/\D/g, "");
  const w1 = (newProp.ward || "").toLowerCase().replace(/\D/g, "");
  const w2 = (cand.ward || "").toLowerCase().replace(/\D/g, "");
  if (z1 !== "" || z2 !== "" || w1 !== "" || w2 !== "") {
    totalCount++;
    const zoneMatch = z1 !== "" && z2 !== "" && (z1 === z2 || z1.includes(z2) || z2.includes(z1));
    const wardMatch = w1 !== "" && w2 !== "" && (w1 === w2 || w1.includes(w2) || w2.includes(w1));
    if (zoneMatch || wardMatch) matchedCount++;
  }

  // 10. Plot Number
  const p1 = (newProp.plotNo || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const p2 = (cand.plotNo || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (p1 !== "" || p2 !== "") {
    totalCount++;
    if (p1 !== "" && p2 !== "" && p1 === p2) matchedCount++;
  }

  // 11. Construction Year
  const y1 = (newProp.constructionYear || "").toLowerCase().replace(/\D/g, "");
  const y2 = (cand.constructionYear || "").toLowerCase().replace(/\D/g, "");
  if (y1 !== "" || y2 !== "") {
    totalCount++;
    if (y1 !== "" && y2 !== "" && y1 === y2) matchedCount++;
  }

  // 12. RV / CV comparison
  if ((cand.rv && cand.rv > 0) || (newProp.rv && newProp.rv > 0)) {
    totalCount++;
    if (cand.rv && cand.rv > 0 && newProp.rv && newProp.rv > 0) {
      const diff = Math.abs(newProp.rv - cand.rv);
      const pct = (diff / cand.rv) * 100;
      if (pct <= 10) matchedCount++;
      else if (pct <= 25) matchedCount += 0.5;
    }
  }

  if (totalCount === 0) return 100;
  return Math.min(100, Math.round((matchedCount / totalCount) * 100));
}
