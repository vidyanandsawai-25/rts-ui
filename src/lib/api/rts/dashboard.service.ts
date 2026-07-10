import "server-only";
import { getMockTrackingApplication as queryMockTracking } from "@/lib/mock/rts/tracking";
import type { TrackingData } from "@/types/rts/departments.types";

export async function getMockTrackingApplication(
  id: string,
  lang: string
): Promise<TrackingData | null> {
  return queryMockTracking(id, lang);
}
