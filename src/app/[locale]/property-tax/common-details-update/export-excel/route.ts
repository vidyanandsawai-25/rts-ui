import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wardId = searchParams.get('WardId');
    const updateCode = searchParams.get('UpdateCode');

    if (!wardId || !updateCode) {
      return NextResponse.json(
        { error: 'Missing required parameters: WardId and UpdateCode' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized: No authentication token found' },
        { status: 401 }
      );
    }

    const config = getAppConfig();
    const params = new URLSearchParams(searchParams.toString());
    const backendUrl = `${config.api.baseUrl.replace(/\/$/, '')}/CommonDetails/export-excel?${params.toString()}`;

    logger.info('[Common Details Excel Export] Proxying request', { backendUrl });

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      logger.error('[Common Details Excel Export] Backend API error', {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { error: `Backend API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const fileData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const contentDisposition = response.headers.get('content-disposition') || 
      `attachment; filename="${updateCode}_${wardId}.xlsx"`;

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    logger.error('[Common Details Excel Export] Unexpected error', { error: error as Error });
    return NextResponse.json(
      { error: 'Internal server error during Excel export' },
      { status: 500 }
    );
  }
}
