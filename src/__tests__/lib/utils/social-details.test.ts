import { describe, it, expect } from "vitest";
import { getLocalizedName } from "@/lib/utils/social-details";

describe("getLocalizedName", () => {
    it("should return raw dynamic DB name when provided", () => {
        const mockT = (key: string) => key === "discount.socialAttributes.HAS_SOLAR" ? "Solar Installed" : key;
        mockT.has = (key: string) => key === "discount.socialAttributes.HAS_SOLAR";

        const result = getLocalizedName("HAS_SOLAR", "Solar Installed on high", mockT);
        expect(result).toBe("Solar Installed on high");
    });

    it("should return non-English translation for Hindi/Marathi locale", () => {
        const mockT = (key: string) => key === "discount.socialAttributes.HAS_SOLAR" ? "सौर स्थापित" : key;
        mockT.has = (key: string) => key === "discount.socialAttributes.HAS_SOLAR";

        const result = getLocalizedName("HAS_SOLAR", "Solar Installed on high", mockT);
        expect(result).toBe("सौर स्थापित");
    });

    it("should fallback to code translation if name is null or empty", () => {
        const mockT = (key: string) => key === "discount.socialAttributes.HAS_SOLAR" ? "Solar Installed" : key;
        mockT.has = (key: string) => key === "discount.socialAttributes.HAS_SOLAR";

        const result = getLocalizedName("HAS_SOLAR", null, mockT);
        expect(result).toBe("Solar Installed");
    });
});
