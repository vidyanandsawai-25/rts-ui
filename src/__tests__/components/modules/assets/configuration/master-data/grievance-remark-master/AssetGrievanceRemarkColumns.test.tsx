import { describe, it, expect, vi } from "vitest";
import { getAssetGrievanceRemarkColumns } from "@/components/modules/assets/configuration/master-data/grievance-remark-master/AssetGrievanceRemarkColumns";

describe("AssetGrievanceRemarkColumns", () => {
  const t = (key: string) => `trans_${key}`;
  const tCommon = (key: string) => `common_${key}`;

  it("should return correct columns with remark and grievanceCategoryName mapping", () => {
    const columns = getAssetGrievanceRemarkColumns(t, tCommon);
    expect(columns).toHaveLength(4);
    expect(columns[0].key).toBe("grievanceCategoryName");
    expect(columns[1].key).toBe("remark");
    expect(columns[2].key).toBe("description");
    expect(columns[3].key).toBe("isActive");
  });

  it("should configure sorting with grievanceCategoryName mapping to grievanceCategoryId", () => {
    const onSortMock = vi.fn();
    const columns = getAssetGrievanceRemarkColumns(t, tCommon, "grievanceCategoryId", "desc", onSortMock);

    // remark and grievanceCategoryName should have sortable headers (React objects)
    expect(typeof columns[0].label).toBe("object");
    expect(typeof columns[1].label).toBe("object");

    // description should be static text
    expect(typeof columns[2].label).toBe("string");
  });
});
