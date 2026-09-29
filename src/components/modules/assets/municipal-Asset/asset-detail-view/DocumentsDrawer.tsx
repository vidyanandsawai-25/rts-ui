'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Image as ImageIcon, Download, Check, Eye } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getDownloadDocumentUrl } from '@/lib/utils/document-utils';
import { Button } from '@/components/common';
import { Drawer } from '@/components/common';

export type DrawerItem = { id: string; name: string; url: string; type: string; isImage: boolean };

export function DocumentsDrawer({
  drawerOpen,
  setDrawerOpen,
  totalFiles,
  groups,
  setViewerState,
}: {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  totalFiles: number;
  groups: Record<string, DrawerItem[]>;
  setViewerState: (state: { open: boolean; url: string; name: string }) => void;
}): React.ReactElement {
  const t = useTranslations('asset-detail');

  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      width="md"
      title={
        <div className="flex items-center gap-2 text-[#0f3482]">
          <FileText className="w-5 h-5 font-black" />
          <span className="text-[14px] font-black tracking-wide uppercase">{t('allDocuments')} ({totalFiles})</span>
        </div>
      }
    >
      <div className="space-y-5 p-5">
        <div className="space-y-3 pb-8">
          {Object.entries(groups).map(([groupName, files]) => (
            <React.Fragment key={groupName}>
              {files.map((file) => (
                <div key={file.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0 pr-4">
                      <div className={cn("w-12 h-12 rounded flex flex-col items-center justify-center text-white shrink-0 shadow-sm", file.isImage ? "bg-[#ff5722]" : "bg-red-500")}>
                        {file.isImage ? <ImageIcon className="w-5 h-5 mb-0.5" /> : <FileText className="w-5 h-5 mb-0.5" />}
                        <span className="text-[9px] font-black">{file.type}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-0.5 flex-1 min-w-0">
                        <span className="text-[14px] font-bold text-[#0f3482] truncate" title={file.name}>{file.name}</span>
                        <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[12px] truncate">{file.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#00c853] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="primary"
                      icon={Eye}
                      iconPosition="left"
                      onClick={() => setViewerState({ open: true, url: file.url, name: file.name })}
                      disabled={!file.url}
                      className="flex-1 py-2.5 rounded-md shadow-sm !h-auto text-[12px] font-black tracking-wide"
                    >
                      VIEW
                    </Button>
                    <Button
                      variant="outline"
                      icon={Download}
                      iconPosition="left"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = getDownloadDocumentUrl(file.id);
                        a.download = file.name;
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      disabled={!file.id}
                      className="flex-1 py-2.5 rounded-md shadow-sm !h-auto text-[12px] font-black tracking-wide"
                    >
                      DOWNLOAD
                    </Button>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
          {totalFiles === 0 && (
            <div className="text-center text-slate-500 text-sm font-medium py-4">
              {t('noDocumentsAvailable', { defaultValue: 'No files available' })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
