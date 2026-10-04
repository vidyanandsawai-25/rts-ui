'use client';

import type { PdfImportLayout, PdfLayoutItem } from './build-imported-report';

interface PdfViewport {
  width: number;
  height: number;
  scale: number;
  transform: number[];
}

interface PdfTextItem {
  str?: string;
  width?: number;
  fontName?: string;
  transform?: number[];
}

interface PdfPage {
  getViewport: (options: { scale: number }) => PdfViewport;
  getTextContent: () => Promise<{
    items: PdfTextItem[];
    styles?: Record<string, { fontFamily?: string }>;
  }>;
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
    background?: string;
  }) => { promise: Promise<void> };
}

export interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

interface PdfJsLibrary {
  GlobalWorkerOptions: { workerSrc: string };
  Util: {
    transform: (left: number[], right: number[]) => number[];
  };
  getDocument: (source: string | { data: Uint8Array; fontExtraProperties?: boolean }) => {
    promise: Promise<PdfDocument>;
  };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLibrary;
  }
}

let pdfLibraryPromise: Promise<PdfJsLibrary> | null = null;

function loadBrowserScript(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${source}"]`);
    if (existing?.dataset.loaded === 'true') {
      resolve();
      return;
    }
    const script = existing ?? document.createElement('script');
    const handleLoad = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error(`Script could not be loaded: ${source}`)),
      {
        once: true,
      }
    );
    if (!existing) {
      script.src = source;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export async function loadPdfLibrary(): Promise<PdfJsLibrary> {
  if (window.pdfjsLib) return window.pdfjsLib;
  if (!pdfLibraryPromise) {
    pdfLibraryPromise = loadBrowserScript('/api/classic-report-designer?asset=pdf').then(() => {
      if (!window.pdfjsLib) throw new Error('PDF renderer did not initialize.');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        '/api/classic-report-designer?asset=pdf-worker';
      return window.pdfjsLib;
    });
  }
  return await pdfLibraryPromise;
}


export async function loadPdfDocument(source: File | string): Promise<PdfDocument> {
  const pdf = await loadPdfLibrary();
  if (typeof source === 'string') return pdf.getDocument(source).promise;
  const data = new Uint8Array(await source.arrayBuffer());
  return pdf.getDocument({ data, fontExtraProperties: true }).promise;
}


function mergeNearbyTextItems(items: PdfLayoutItem[]): PdfLayoutItem[] {
  const sorted = [...items].sort((left, right) => left.y - right.y || left.x - right.x);
  const merged: PdfLayoutItem[] = [];
  for (const item of sorted) {
    const previous = merged[merged.length - 1];
    const sameLine =
      previous && Math.abs(previous.y - item.y) <= Math.max(2, (previous.fontSize || 10) * 0.35);
    const gap = previous ? item.x - (previous.x + previous.width) : Number.POSITIVE_INFINITY;
    if (sameLine && gap >= -2 && gap <= Math.max(18, (previous.fontSize || 10) * 1.5)) {
      const right = Math.max(previous.x + previous.width, item.x + item.width);
      previous.text = `${previous.text}${gap > 1 ? ' ' : ''}${item.text}`;
      previous.width = right - previous.x;
      previous.height = Math.max(previous.height, item.height);
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}

export async function extractPdfLayout(
  file: File,
  onProgress?: (message: string) => void
): Promise<PdfImportLayout> {
  const pdfLibrary = await loadPdfLibrary();
  const document = await loadPdfDocument(file);
  const page = await document.getPage(1);
  const viewport = page.getViewport({ scale: 96 / 72 });
  const content = await page.getTextContent();
  const styles = content.styles ?? {};
  const items = content.items.flatMap((item): PdfLayoutItem[] => {
    if (!item.str?.trim() || !item.transform) return [];
    const text = item.str.normalize('NFC').trim();
    if (!text) return [];
    const transform = pdfLibrary.Util.transform(viewport.transform, item.transform);
    const fontHeight = Math.max(5, Math.hypot(transform[2], transform[3]));
    const rawWidth = Number(item.width || 0) * viewport.scale;
    return [
      {
        text,
        x: Math.max(0, transform[4]),
        y: Math.max(0, transform[5] - fontHeight),
        width: Math.max(2, rawWidth > 2 ? rawWidth : text.length * fontHeight * 0.6),
        height: fontHeight * 1.2,
        fontSize: fontHeight,
        fontFamily:
          styles[item.fontName || '']?.fontFamily || "'Noto Sans Devanagari', Arial, sans-serif",
        fontWeight: /bold/i.test(styles[item.fontName || '']?.fontFamily || '') ? 700 : 400,
        color: '#111827',
        textAlign: 'left',
      },
    ];
  });

  let extractionMode: PdfImportLayout['extractionMode'] = 'unicode';
  if (items.length === 0) {
    extractionMode = 'image';
  }

  onProgress?.('PDF layout analysis completed.');
  return {
    pageWidth: viewport.width,
    pageHeight: viewport.height,
    widthMm: viewport.width / (96 / 25.4),
    heightMm: viewport.height / (96 / 25.4),
    pageCount: document.numPages,
    extractionMode,
    items: mergeNearbyTextItems(items),
    graphics: [],
  };
}

export async function renderPdfPageToCanvas(
  source: string,
  canvas: HTMLCanvasElement,
  targetWidth: number
): Promise<void> {
  const document = await loadPdfDocument(source);
  const page = await document.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const cssScale = targetWidth / Math.max(1, baseViewport.width);
  const viewport = page.getViewport({ scale: cssScale * pixelRatio });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${viewport.height / pixelRatio}px`;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Blueprint canvas could not be initialized.');
  context.clearRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
}
