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
  isExpanded?: boolean;
}

const BuildingPermissionTab: React.FC<BuildingPermissionTabProps> = ({ data, isExpanded = false }) => {
  const t = useTranslations('ptis');
  const locale = useLocale();
  const [activeViewingGuid, setActiveViewingGuid] = React.useState<string | null>(null);
  const [viewerData, setViewerData] = React.useState<{ isOpen: boolean; url: string; name: string; label?: string } | null>(null);

  // Filter for items that have actual certificate data (number, date, or document) or hasCertificate=true
  const items = React.useMemo(() => {
    return (data?.items || []).filter((item) => {
      const hasContent = !!(item.certificateNo?.trim() || item.issueDate?.trim() || item.documentGuid?.trim());
      return item.hasCertificate || hasContent;
    });
  }, [data?.items]);

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
      <div className="flex flex-col items-center justify-center p-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <AlertCircle className="h-7 w-7 text-slate-400 mb-1.5" />
        <p className="text-xs font-semibold">{t('noDataAvailable') || 'No attached certificates available'}</p>
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

    const scopeName = item.floorDescription
      ? item.floorDescription
      : item.propertyDetailsId
      ? `Floor #${item.propertyDetailsId}`
      : null;

    const cardKey = item.propertyCertificateId 
      ? String(item.propertyCertificateId) 
      : `${item.certificateTypeId}-${item.propertyDetailsId || 'property'}`;

    return (
      <FieldShell
        key={cardKey}
        className="relative transition-all hover:shadow-md min-w-[200px] mt-1 mb-1 snap-start border border-blue-100 bg-blue-50/20"
        label={<span className="font-bold text-blue-900">{item.certificateTypeName}</span>}
      >
        <div className="flex flex-col gap-1 p-0.5 min-w-0 mt-0.5 mb-0.5">
          <div className="flex items-center gap-1 min-w-0 justify-start pl-1">
            <span className="text-xs font-bold text-blue-900 shrink-0 select-none">
              {t('fields.numberLabel') || 'No:'}
            </span>
            <div className="w-[70%] min-w-0 font-extrabold text-slate-900 text-xs truncate">
              <ValueDisplay value={item.certificateNo || '-'} />
            </div>
          </div>
          <div className="flex items-center min-w-0 gap-1.5 pl-1 pr-1">
            <span className="text-xs font-bold text-blue-900 shrink-0 select-none">
              {t('fields.dateLabel') || 'Date:'}
            </span>
            <div className="w-[45%] min-w-0 font-extrabold text-slate-900 text-xs shrink-0">
              <ValueDisplay value={formattedDate} />
            </div>
            {scopeName && (
              <div className="ml-auto min-w-0 truncate">
                <span className="inline-block px-1.5 py-0.5 text-xs font-extrabold bg-blue-100 text-blue-900 rounded truncate max-w-full">
                  {scopeName}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={activeViewingGuid !== null}
            onClick={async (e) => {
              e.stopPropagation();
              if (!item.documentGuid) {
                toast.info(t('building.noDocumentAttached') || 'No document file attached for this certificate.');
                return;
              }
              setActiveViewingGuid(item.documentGuid);
              try {
                const res = await getDocumentBlobUrl(item.documentGuid, locale);
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
            {Boolean(item.documentGuid && activeViewingGuid === item.documentGuid) ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-blue-600" />
            )}
          </button>
        </div>
      </FieldShell>
    );
  };

  return (
    <>
      <div
        className={`transition-all duration-300 overflow-y-auto snap-y snap-mandatory scroll-py-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full ${
          isExpanded ? 'max-h-[205px]' : 'max-h-[102px]'
        }`}
      >
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
