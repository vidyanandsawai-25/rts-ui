'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { AlertCircle, Eye, Loader2 } from 'lucide-react';
import FieldShell from '@/components/common/FieldShell';
import { ValueDisplay } from './components/ValueDisplay';
import { getDocumentBlobUrl } from '@/lib/utils/document-client-utils';
import { DocumentViewerModal } from '@/components/common';
import { toast } from 'sonner';
import type {
  BuildingPermissionData,
  BuildingPermissionItem,
} from '@/types/ptis.types';

export interface BuildingPermissionTabProps {
  data?: BuildingPermissionData;
  onFieldChange?: (field: string, value: string | boolean) => void;
  readOnly?: boolean;
}

const BuildingPermissionTab: React.FC<BuildingPermissionTabProps> = ({ data }) => {
  const t = useTranslations('ptis');
  const locale = useLocale();
  const [activeViewingGuid, setActiveViewingGuid] = React.useState<string | null>(null);
  const [viewerData, setViewerData] = React.useState<{ isOpen: boolean; url: string; name: string; label?: string } | null>(null);
  const items = (data?.items || []).filter((item) => item.isActive);

  const closeViewer = React.useCallback(() => {
    if (viewerData?.url) {
      URL.revokeObjectURL(viewerData.url);
    }
    setViewerData(null);
  }, [viewerData]);

  React.useEffect(() => {
    return () => {
      if (viewerData?.url) {
        URL.revokeObjectURL(viewerData.url);
      }
    };
  }, [viewerData]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium">{t('noDataAvailable') || 'No data available'}</p>
      </div>
    );
  }

  const renderCard = (item: BuildingPermissionItem) => {
    let formattedDate = '-';
    if (item.issueDate) {
      try {
        const date = new Date(item.issueDate);
        if (!isNaN(date.getTime())) {
          formattedDate = format(date, 'dd/MM/yyyy');
        }
      } catch (_) {
        formattedDate = item.issueDate;
      }
    }

    return (
      <FieldShell
        key={item.certificateTypeId}
        className="relative transition-all hover:shadow-md min-w-0 mt-1 mb-1 ml-1 snap-start"
        label={item.certificateTypeName}
      >
        <div className="flex flex-col gap-1 p-0 min-w-0 mt-1 mb-1">
          <div className="flex items-center gap-1 min-w-0 justify-start pl-2">
            <span className="text-xs font-semibold text-blue-800 shrink-0 select-none pl-1">
              {t('fields.numberLabel') || 'No'}
            </span>
            <div className="w-[70%] min-w-0">
              <ValueDisplay value={item.certificateNo || '-'} />
            </div>
          </div>
          <div className="flex items-center min-w-0 gap-1 pl-1">
            <span className="text-xs font-semibold text-blue-800 shrink-0 select-none">
              {t('fields.dateLabel') || 'Date'}
            </span>
            <div className="w-[70%] min-w-0">
              <ValueDisplay value={formattedDate} />
            </div>
          </div>
          {item.documentGuid && (
            <button
              type="button"
              disabled={activeViewingGuid !== null}
              onClick={async (e) => {
                e.stopPropagation();
                setActiveViewingGuid(item.documentGuid!);
                try {
                  const res = await getDocumentBlobUrl(item.documentGuid!, locale);
                  setViewerData({
                    isOpen: true,
                    url: res.url,
                    name: item.fileName || "Document",
                    label: item.certificateTypeName
                  });
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : "Failed to view document");
                } finally {
                  setActiveViewingGuid(null);
                }
              }}
              className="absolute top-1 right-1 p-1 rounded hover:bg-blue-200 text-blue-800 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent disabled:opacity-50"
              title={t('actions.viewDocument') || 'View Document'}
            >
              {activeViewingGuid === item.documentGuid ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </FieldShell>
    );
  };

  return (
    <>
      <div className="max-h-[105px] overflow-y-auto snap-y snap-mandatory scroll-py-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {items.map(renderCard)}
        </div>
      </div>
      {viewerData && (
        <DocumentViewerModal
          isOpen={viewerData.isOpen}
          onClose={closeViewer}
          fileUrl={viewerData.url}
          fileName={viewerData.name}
          label={viewerData.label}
        />
      )}
    </>
  );
};

export default BuildingPermissionTab;
