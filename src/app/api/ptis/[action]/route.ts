import { NextResponse } from 'next/server';
import { ptisSearchService } from '@/lib/api/ptis/tab/ptis-search';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;

    if (action === 'suggestions') {
      const { searchParams } = new URL(request.url);
      const wardId = searchParams.get('wardId');
      const propertyNo = searchParams.get('propertyNo') || undefined;
      const partitionNo = searchParams.get('partitionNo') || undefined;
      const maxResults = searchParams.get('maxResults');

      if (!wardId) {
        return NextResponse.json({ success: false, error: 'Ward ID is required' }, { status: 400 });
      }

      const resolvedWardId = parseInt(wardId, 10);
      if (isNaN(resolvedWardId)) {
        return NextResponse.json({ success: false, error: 'Invalid Ward ID' }, { status: 400 });
      }

      const resolvedMaxResults = maxResults ? parseInt(maxResults, 10) : 100;

      const result = await ptisSearchService.getPropertySuggestionsByPropwise(
        resolvedWardId,
        propertyNo,
        partitionNo,
        resolvedMaxResults
      );

      if (result.success && result.data && Array.isArray(result.data)) {
        // Return propertyId alongside propertyNo, partitionNo and displayLabel,
        // but keep other internal database keys (zoneId, zoneNo, wardId, wardNo, upicId) hidden.
        const filtered = result.data.map((item) => ({
          propertyId: item.propertyId,
          propertyNo: item.propertyNo,
          partitionNo: item.partitionNo,
          displayLabel: item.displayLabel,
        }));
        return NextResponse.json({ success: true, data: filtered });
      }

      return NextResponse.json(result);
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
