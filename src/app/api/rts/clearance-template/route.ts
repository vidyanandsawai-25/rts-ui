import { NextResponse } from "next/server";
import { apiClient } from "@/services/api.service";

/**
 * Downloads the Excel template (.xlsx) for bank clearance scroll upload.
 * Proxies to backend GET /api/RTSPayment/clearance-template.
 */
export async function GET() {
  try {
    const upstream = await apiClient.fetch("/RTSPayment/clearance-template", {}, false);

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "Template download failed");
      return NextResponse.json(
        { error: errText || "Template download failed" },
        { status: upstream.status }
      );
    }

    const headers = new Headers();
    headers.set("Cache-Control", "no-store");
    headers.set(
      "Content-Type",
      upstream.headers.get("Content-Type") ??
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set(
      "Content-Disposition",
      upstream.headers.get("Content-Disposition") ??
        'attachment; filename="Payment_Clearance_Template.xlsx"'
    );

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to download clearance template" },
      { status: 500 }
    );
  }
}
