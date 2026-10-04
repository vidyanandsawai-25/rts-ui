import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { CLASSIC_DESIGNER_HTML } from '@/components/modules/property-tax/report-designer/classic-designer-html';

export const dynamic = 'force-dynamic';

const assets = {
  renderer: {
    path: ['public', 'engine', 'report_renderer.js'],
    contentType: 'application/javascript; charset=utf-8',
  },
  pdf: {
    path: ['public', 'vendor', 'pdfjs', 'pdf.min.js'],
    contentType: 'application/javascript; charset=utf-8',
  },
  'pdf-worker': {
    path: ['public', 'vendor', 'pdfjs', 'pdf.worker.min.js'],
    contentType: 'application/javascript; charset=utf-8',
  },
  css: {
    path: ['src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.css'],
    contentType: 'text/css; charset=utf-8',
  },
  js: {
    path: ['src', 'components', 'modules', 'property-tax', 'report-designer', 'designer.js'],
    contentType: 'application/javascript; charset=utf-8',
  },
} as const;

export async function GET(request: NextRequest) {
  const assetName = request.nextUrl.searchParams.get('asset');
  const asset = assetName ? assets[assetName as keyof typeof assets] : undefined;

  try {
    if (asset) {
      try {
        const source = await readFile(path.join(process.cwd(), ...asset.path));
        return new Response(source, {
          headers: {
            'Cache-Control': 'no-store',
            'Content-Type': asset.contentType,
          },
        });
      } catch {
        if (assetName === 'pdf' || assetName === 'pdf-worker') {
          return new Response('// PDF engine optional', {
            headers: {
              'Cache-Control': 'no-store',
              'Content-Type': 'application/javascript; charset=utf-8',
            },
          });
        }
        throw new Error(`Asset ${assetName} not found`);
      }
    }

    return new Response(CLASSIC_DESIGNER_HTML, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Classic report designer asset could not be loaded.', error);
    return new Response('Classic report designer is unavailable.', { status: 500 });
  }
}
