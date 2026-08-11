import { describe, it, expect, vi } from "vitest";
import { getAssetGrievanceCategoryColumns } from "@/components/modules/assets/configuration/master-data/grievance-category-master/AssetGrievanceCategoryColumns";

describe("AssetGrievanceCategoryColumns", () => {
  const t = (key: string) => `trans_${key}`;
  const tCommon = (key: string) => `common_${key}`;

  it("should return the correct column configuration", () => {
    const columns = getAssetGrievanceCategoryColumns(t, tCommon);
    expect(columns).toHaveLength(4);
    expect(columns[0].key).toBe("categoryName");
    expect(columns[1].key).toBe("resolutionSlaDays");
    expect(columns[2].key).toBe("description");
    expect(columns[3].key).toBe("isActive");
  });

  it("should configure only categoryName and resolutionSlaDays as sortable", () => {
    const onSortMock = vi.fn();
    const columns = getAssetGrievanceCategoryColumns(t, tCommon, "categoryName", "asc", onSortMock);

    // categoryName (index 0) and resolutionSlaDays (index 1) headers should be React objects (since they render SortableHeader)
    expect(typeof columns[0].label).toBe("object");
    expect(typeof columns[1].label).toBe("object");

    // description (index 2) header is plain text
    expect(typeof columns[2].label).toBe("string");
    expect(columns[2].label).toBe("trans_list.headers.description");
  });
});
