import { NextResponse } from "next/server";
import {
  downloadAdminRtsDocument,
  viewAdminRtsDocument,
} from "@/lib/api/rts/rtsdocument.service";

const DOCUMENT_ACTIONS = new Set(["view", "download"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ guid: string; action: string }> }
) {
  const { action, guid } = await params;

  if (!guid?.trim() || !DOCUMENT_ACTIONS.has(action)) {
    return NextResponse.json({ message: "Invalid document request" }, { status: 400 });
  }

  try {
    const backendResponse =
      action === "view"
        ? await viewAdminRtsDocument(guid)
        : await downloadAdminRtsDocument(guid);

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: "The document could not be retrieved." },
        { status: backendResponse.status >= 400 ? backendResponse.status : 502 }
      );
    }

    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    const contentDisposition = backendResponse.headers.get("content-disposition");
    const contentLength = backendResponse.headers.get("content-length");

    if (contentDisposition) headers.set("Content-Disposition", contentDisposition);
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(backendResponse.body, { headers });
  } catch (error) {
    console.error("Failed to proxy RTS document from fallback route:", error);
    return NextResponse.json(
      { message: "The document service is temporarily unavailable." },
      { status: 502 }
    );
  }
}
