import { describe, it, expect, vi } from "vitest";
import { getPenaltyRuleErrorMessage, parsePenaltyRuleApiErrors } from "@/hooks/asset-masters/penalty-rule-master/error-mapping";

describe("Penalty Rule Master error-mapping getPenaltyRuleErrorMessage", () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      "title": "Penalty Rule Master",
      "form.messages.duplicate": "This record already exists",
      "apiErrors.duplicateRecord": "This record already exists",
      "apiErrors.Penaltyrule_Code_Duplicate": "Penalty Rule Code already exists",
    };
    return translations[key] || key;
  });

  const mockTCommon = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      "errors.generic": "Failed to connect to the server",
      "errors.deleteError": "Failed to delete",
    };
    return translations[key] || key;
  });

  it("should return localized duplicate message when message contains Penaltyrule_Code_Duplicate", () => {
    const result = getPenaltyRuleErrorMessage("Penaltyrule_Code_Duplicate", 400, mockT, mockTCommon);
    expect(result).toBe("This record already exists");
  });

  it("should return localized duplicate message when message contains 'Create Penalty rule failed: Penaltyrule_Code_Duplicate'", () => {
    const result = getPenaltyRuleErrorMessage("Create Penalty rule failed: Penaltyrule_Code_Duplicate", 400, mockT, mockTCommon);
    expect(result).toBe("This record already exists");
  });

  it("should return localized duplicate message when statusCode is 409", () => {
    const result = getPenaltyRuleErrorMessage("", 409, mockT, mockTCommon);
    expect(result).toBe("This record already exists");
  });

  it("should parse JSON error response payload containing validation errors", () => {
    const jsonMsg = JSON.stringify({
      statusCode: 400,
      errors: { PenaltyCode: ["Penaltyrule_Code_Duplicate"] }
    });
    const result = getPenaltyRuleErrorMessage(jsonMsg, 400, mockT, mockTCommon);
    expect(result).toBe("This record already exists");
  });

  it("should return reference deletion message when entity is referenced in tables", () => {
    const refError = "Cannot deactivate/delete this Penalty Rule Master because it is referenced in: LeaseRentDemand";
    const result = getPenaltyRuleErrorMessage(refError, 400, mockT, mockTCommon);
    expect(result).toContain("Penalty Rule Master");
    expect(result).toContain("LeaseRentDemand");
  });
});

describe("Penalty Rule Master parsePenaltyRuleApiErrors", () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      "title": "Penalty Rule Master",
      "form.messages.duplicate": "This record already exists",
      "form.validation.penaltyCodeDuplicate": "Penalty code already exists",
      "form.validation.penaltyNameDuplicate": "Penalty name already exists",
    };
    return translations[key] || key;
  });

  const mockTCommon = vi.fn((key: string) => key);

  it("should parse fieldErrors and map penaltyCode duplicate error correctly", () => {
    const jsonMsg = JSON.stringify({
      errors: { PenaltyCode: ["Penaltyrule_Code_Duplicate"] }
    });
    const result = parsePenaltyRuleApiErrors(jsonMsg, 400, mockT, mockTCommon);
    expect(result.fieldErrors.penaltyCode).toBe("Penalty code already exists");
  });

  it("should parse fieldErrors and map penaltyName duplicate error correctly", () => {
    const jsonMsg = JSON.stringify({
      errors: { PenaltyName: ["Penalty name already exists"] }
    });
    const result = parsePenaltyRuleApiErrors(jsonMsg, 400, mockT, mockTCommon);
    expect(result.fieldErrors.penaltyName).toBe("Penalty name already exists");
  });

  it("should fallback penaltyName field error when generic duplicate message 'This record already exists' or 409 is returned", () => {
    const result = parsePenaltyRuleApiErrors("This record already exists", 409, mockT, mockTCommon);
    expect(result.fieldErrors.penaltyName).toBe("Penalty name already exists");
    expect(result.fieldErrors.penaltyCode).toBeUndefined();
  });

  it("should map penaltyCode field error when message explicitly mentions code", () => {
    const result = parsePenaltyRuleApiErrors("Penalty code LATE_01 already exists", 400, mockT, mockTCommon);
    expect(result.fieldErrors.penaltyCode).toBe("Penalty code already exists");
    expect(result.fieldErrors.penaltyName).toBeUndefined();
  });

  it("should parse fieldErrors for penaltyValue, calculationType, and gracePeriodDays correctly", () => {
    const jsonMsg = JSON.stringify({
      errors: {
        penaltyValue: ["Invalid value"],
        calculationType: ["Calculation type required"],
        gracePeriodDays: ["Invalid grace period"],
      }
    });
    const result = parsePenaltyRuleApiErrors(jsonMsg, 400, mockT, mockTCommon);
    expect(result.fieldErrors.penaltyValue).toBeDefined();
    expect(result.fieldErrors.calculationType).toBeDefined();
    expect(result.fieldErrors.gracePeriodDays).toBeDefined();
  });
});
