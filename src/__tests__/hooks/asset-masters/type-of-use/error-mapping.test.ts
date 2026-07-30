import { beforeEach, describe, expect, it, vi } from "vitest";
import { getErrorMessage } from "@/hooks/asset-masters/type-of-use/error-mapping";

describe("TypeOfUse error-mapping getErrorMessage", () => {
  const mockT = vi.fn((key: string, values?: Record<string, string>) => {
    if (key === "apiErrors.referencedIn") {
      return `Cannot deactivate or delete this ${values?.entity} because it is referenced in: ${values?.tables}.`;
    }
    if (key === "type.title") return "Type of Use";
    if (key === "subtype.title" || key === "subType.title") return "Sub-Types of Use";
    if (key === "group.title") return "Use Group";
    if (key === "apiErrors.inUse") return "Record is in use.";
    if (key === "apiErrors.operationFailed") return "Something went wrong.";
    return key;
  });

  const mockTCommon = vi.fn((key: string) => {
    if (key === "errors.generic") return "Something went wrong.";
    if (key === "errors.deleteError") return "Failed to delete record.";
    return key;
  });

  beforeEach(() => {
    mockT.mockClear();
    mockTCommon.mockClear();
  });

  it("should dynamically parse referencedIn messages for type of use", () => {
    const rawMessage = "Cannot deactivate/delete this AssetTypeOfUseMaster because it is referenced in: Asset SubType Of Use Master";
    const result = getErrorMessage(rawMessage, 400, mockT, mockTCommon, "Type of Use");

    expect(result).toBe("Cannot deactivate or delete this Type of Use because it is referenced in: Asset SubType Of Use Master.");
    expect(mockT).toHaveBeenCalledWith("apiErrors.referencedIn", {
      entity: "Type of Use",
      tables: "Asset SubType Of Use Master",
    });
  });

  it("should dynamically parse referencedIn messages for subtype of use", () => {
    const rawMessage = "Cannot deactivate/delete this AssetSubTypeOfUse because it is referenced in: Some Other Table";
    const result = getErrorMessage(rawMessage, 400, mockT, mockTCommon, "Sub-Types of Use");

    expect(result).toBe("Cannot deactivate or delete this Sub-Types of Use because it is referenced in: Some Other Table.");
  });

  it("should fall back to apiErrors.inUse for 409 status code without match", () => {
    const result = getErrorMessage("Some random conflict message", 409, mockT, mockTCommon, "Type of Use");
    expect(result).toBe("Record is in use.");
  });

  it("should fall back to a generic error for non-matching 500 error", () => {
    const result = getErrorMessage("Server exploded", 500, mockT, mockTCommon, "Type of Use");
    expect(result).toBe("Something went wrong.");
  });
});
