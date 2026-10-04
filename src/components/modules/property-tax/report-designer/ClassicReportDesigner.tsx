'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CLASSIC_DESIGNER_HTML } from './classic-designer-html';
import './designer.css';

import type { ClassicReportDesignerProps } from './types/designer.types';

function loadScriptSequential(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-classic-script="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', (e) => reject(e), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.classicScript = src;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
}

function ensureStyleSheet(href: string) {
  if (document.querySelector(`link[data-classic-style="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.classicStyle = href;
  document.head.appendChild(link);
}

export function ClassicReportDesigner({
  locale = 'mr',
  defaultReportId,
  openImporter = false,
  createNewReport = false,
}: ClassicReportDesignerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isReady, setIsReady] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    ensureStyleSheet('/api/classic-report-designer?asset=css');

    // Pre-stub canvas event handlers so early clicks never throw ReferenceError
    if (typeof window !== 'undefined') {
      window.handleCanvasAreaMouseDown = window.handleCanvasAreaMouseDown || (() => {});
      window.handleCanvasMouseMove = window.handleCanvasMouseMove || (() => {});
      window.handleCanvasScroll = window.handleCanvasScroll || (() => {});
    }

    if (containerRef.current && !containerRef.current.hasChildNodes()) {
      containerRef.current.innerHTML = CLASSIC_DESIGNER_HTML;
    }

    let cancelled = false;

    async function loadEngine() {
      try {
        if (!window.ReportRenderer) {
          await loadScriptSequential('/api/classic-report-designer?asset=renderer');
        }
        if (!window.initDesignerApp) {
          await loadScriptSequential('/api/classic-report-designer?asset=js');
        }

        if (cancelled) return;

        window.goBackToPreviousScreen = () => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push(`/${locale}/property-tax/reports`);
          }
        };

        if (window.initDesignerApp) {
          await window.initDesignerApp({
            reportId: defaultReportId,
            openImporter,
            createNewReport,
            locale,
          });
        }

        if (!cancelled) {
          initializedRef.current = true;
        }
      } catch (err) {
        console.error('Failed to load classic designer engine:', err);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    loadEngine();

    return () => {
      cancelled = true;
    };
  }, [router, locale, defaultReportId, openImporter, createNewReport]);

  useEffect(() => {
    if (initializedRef.current && defaultReportId && window.switchReport) {
      window.switchReport(defaultReportId);
    }
  }, [defaultReportId]);

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-[#525659]">
      {!isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#525659] text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-xs font-medium text-slate-200">
              {locale === 'mr' ? 'क्लासिक रिपोर्ट डिझायनर लोड होत आहे...' : 'Loading Classic Report Designer...'}
            </span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="cr-designer-root w-full h-full overflow-hidden"
      />
    </div>
  );
}
