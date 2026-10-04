'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClassicDesignerOptions } from '../types/designer.types';

export interface UseDesignerEngineOptions extends ClassicDesignerOptions {
  defaultReportId?: string;
}

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
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[data-classic-style="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.classicStyle = href;
  document.head.appendChild(link);
}

export function useDesignerEngine({
  locale = 'mr',
  defaultReportId,
  openImporter = false,
  createNewReport = false,
}: UseDesignerEngineOptions) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    ensureStyleSheet('/api/classic-report-designer?asset=css');

    if (typeof window !== 'undefined') {
      window.handleCanvasAreaMouseDown = window.handleCanvasAreaMouseDown || (() => {});
      window.handleCanvasMouseMove = window.handleCanvasMouseMove || (() => {});
      window.handleCanvasScroll = window.handleCanvasScroll || (() => {});
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

  return { isReady };
}
