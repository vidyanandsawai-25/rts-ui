'use client';

import { Download, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button, Drawer } from '@/components/common';

interface RtsApplicationDocumentViewProps {
  open: boolean;
  fileUrl: string;
  downloadUrl: string;
  fileName: string;
  label?: string;
}

export default function RtsApplicationDocumentView({
  open,
  fileUrl,
  downloadUrl,
  fileName,
  label,
}: RtsApplicationDocumentViewProps) {
  const router = useRouter();
  const t = useTranslations('rts.applicationDashboard.processDrawer');
  const tCommon = useTranslations('common');
  const title = label || fileName;
  const handleClose = () => router.back();

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width="md"
      hideHeader
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" icon={Download} onClick={() => window.open(downloadUrl, '_blank')}>
            {t('download')}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={handleClose}>
            {tCommon('buttons.close')}
          </Button>
        </div>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-slate-100">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b-2 border-blue-200 bg-[#143D7D] px-5 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{title}</p>
              <p className="text-[11px] font-semibold text-blue-100">{t('documents')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={tCommon('buttons.close')}
            title={tCommon('buttons.close')}
            className="rounded-lg p-2 text-blue-100 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <main className="min-h-0 flex-1 p-5">
          <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <iframe src={fileUrl} title={title} className="h-full w-full border-0" />
          </div>
        </main>
      </div>
    </Drawer>
  );
}
