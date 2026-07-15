import { NextResponse } from 'next/server';
import { getDocument } from '@/lib/api/document.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ guid: string; action: string }> }
) {
  try {
    const { guid, action } = await params;
    if (action !== 'view' && action !== 'download') {
      return new NextResponse('Invalid action', { status: 400 });
    }
    const res = await getDocument(guid, action);
    return new NextResponse(res.buffer, {
      headers: {
        'Content-Type': res.contentType,
        'Content-Disposition': res.contentDisposition,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('API Route Error fetching document:', error);
    return new NextResponse('Document not found', { status: 404 });
  }
}
