import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await params;
  const id = Number(templateId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid report template id.' }, { status: 400 });
  }

  const result = await apiClient.delete<void>(`/designer-report-templates/${id}`);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error || 'Report could not be deleted.' },
      { status: result.statusCode || 500 },
    );
  }

  return NextResponse.json({ success: true });
}
