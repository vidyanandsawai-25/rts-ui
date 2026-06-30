import { describe, it } from "vitest";
import { searchProperties } from "@/lib/api/property-search/services/search.service";

describe("Find Dashboard Filter values", () => {
  it("should query grid with DashboardFilters 1 to 9", async () => {
    // Set base URL so apiClient doesn't fail parsing relative URL
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://localhost:7293/api";
    
    console.log("Starting grid search queries...");
    for (let i = 1; i <= 10; i++) {
      try {
        const response = await searchProperties({
          dashboardFilter: i,
          pageNumber: 1,
          pageSize: 1, // only need totalCount
        });
        console.log(`DashboardFilter = ${i} -> totalCount: ${response.totalCount}`);
      } catch (error) {
        console.log(`DashboardFilter = ${i} -> Failed: ${(error as Error).message}`);
      }
    }
  });
});
