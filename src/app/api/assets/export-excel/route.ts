import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';

async function handleExport(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('AssetCategoryId');
    const search = searchParams.get('search') || undefined;
    const searchField = searchParams.get('searchField') || undefined;
    const assetNo = searchParams.get('AssetNo') || undefined;
    const assetTypeId = searchParams.get('AssetTypeId') || undefined;
    const zoneId = searchParams.get('ZoneId');
    const wardId = searchParams.get('WardId');
    const departmentId = searchParams.get('DepartmentId');
    const sortBy = searchParams.get('SortBy');
    const sortOrder = searchParams.get('SortOrder');

    const baseUrl = getAppConfig().api.baseUrl?.replace(/\/$/, '');
    if (!baseUrl) {
      return new NextResponse('API base URL is not configured', { status: 500 });
    }

    const query = new URLSearchParams({ IsActive: 'true', PageNumber: '1', PageSize: '-1' });
    if (categoryId) query.set('AssetCategoryId', categoryId);
    if (assetTypeId && assetTypeId !== 'all') {
      assetTypeId.split(',').forEach((id) => {
        if (id.trim()) query.append('AssetTypeId', id.trim());
      });
    }
    if (zoneId && zoneId !== '-1' && zoneId !== 'all') query.set('ZoneId', zoneId);
    if (wardId && wardId !== '-1' && wardId !== 'all') query.set('WardId', wardId);
    if (departmentId && departmentId !== '-1' && departmentId !== 'all') {
      query.set('DepartmentId', departmentId);
    }
    if (searchField === 'all' && search?.trim()) query.set('SearchTerm', search.trim());
    if (searchField === 'assetId' && search?.trim()) query.set('AssetNo', search.trim());
    else if (assetNo?.trim()) query.set('AssetNo', assetNo.trim());
    if (searchField === 'assetName' && search?.trim()) query.set('AssetName', search.trim());
    if (searchField === 'address' && search?.trim()) query.set('Address', search.trim());
    if (sortBy) query.set('SortBy', sortBy);
    if (sortOrder) query.set('SortOrder', sortOrder);

    // Build headers
    const headers: Record<string, string> = {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const csrf = cookieStore.get('csrf_token')?.value;
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
    const cookieStr = cookieStore
      .getAll()
      .filter((c) =>
        /auth_token|refresh_token|session_id|csrf_token|\.AspNetCore\.Antiforgery/.test(c.name)
      )
      .map((c) => `${c.name.replace(/[^\x00-\x7F]/g, '')}=${c.value.replace(/[^\x00-\x7F]/g, '')}`)
      .join('; ');
    if (cookieStr) {
      headers['Cookie'] = cookieStr;
    }

    const backendUrl = `${baseUrl}/AssetMaster/export-excel?${query.toString()}`;
    const backendResponse = await serverFetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new NextResponse(errorText || 'Export failed', { status: backendResponse.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // Keep the route authoritative with a static filename contract.
    responseHeaders.set('Content-Disposition', 'attachment; filename="asset-register.xlsx"');
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    const contentLength = backendResponse.headers.get('Content-Length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    // Direct proxying of stream
    return new Response(backendResponse.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Failed to export asset register Excel:', error);
    return new NextResponse('Export failed', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleExport(request);
}

export async function HEAD(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return new NextResponse(null, { status: 401 });
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Failed to verify token in HEAD request:', error);
    return new NextResponse(null, { status: 500 });
  }
}
