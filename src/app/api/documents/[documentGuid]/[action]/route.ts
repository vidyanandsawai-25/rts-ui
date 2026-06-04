import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppConfig } from "@/config/app.config";
import { serverFetch } from "@/lib/utils/server-fetch";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ documentGuid: string; action: string }> }
) {
    try {
        const resolvedParams = await params;
        const { documentGuid, action } = resolvedParams;
        
        if (!documentGuid || !action) {
            return new NextResponse("Invalid request parameters", { status: 400 });
        }

        // Only allow "view" and "download" actions
        if (action !== "view" && action !== "download") {
            return new NextResponse("Invalid action", { status: 400 });
        }

        const config = getAppConfig();
        const baseUrl = config.api.baseUrl?.trim();
        if (!baseUrl) {
            return new NextResponse("Backend API base URL is not configured", { status: 500 });
        }
        
        // Remove trailing slashes and /api prefix from base URL to match standard backend URL
        let cleanBase = baseUrl.replace(/\/+$/, "");
        if (cleanBase.endsWith("/api")) {
            cleanBase = cleanBase.substring(0, cleanBase.length - 4);
        }
        
        const finalRoot = cleanBase.endsWith("/") ? cleanBase : `${cleanBase}/`;
        // Build direct backend URL (e.g. http://localhost:7293/api/documents/{guid}/{action})
        const backendUrl = `${finalRoot}api/documents/${encodeURIComponent(documentGuid)}/${action}`;

        // Get auth token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const headers: Record<string, string> = {
            "Accept": "*/*",
            "Authorization": `Bearer ${token}`
        };

        // Call backend API via serverFetch
        const response = await serverFetch(backendUrl, {
            method: "GET",
            headers
        });

        if (!response.ok) {
            return new NextResponse(
                `Backend responded with status ${response.status}`,
                { status: response.status }
            );
        }

        // Forward response headers (Content-Type, Content-Disposition, etc.)
        const responseHeaders = new Headers();
        responseHeaders.set("Cache-Control", "no-store");
        
        const contentType = response.headers.get("content-type");
        if (contentType) responseHeaders.set("Content-Type", contentType);

        const contentDisposition = response.headers.get("content-disposition");
        if (contentDisposition) responseHeaders.set("Content-Disposition", contentDisposition);

        const contentLength = response.headers.get("content-length");
        if (contentLength) responseHeaders.set("Content-Length", contentLength);

        // Stream response back instead of buffering whole file in memory
        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders
        });
    } catch (error) {
        console.error("Error in document proxy route:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
