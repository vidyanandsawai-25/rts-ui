'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { AlertCircle, Eye, Pencil, Loader2, FileText } from 'lucide-react';
import { getDocumentBlobUrl } from '@/lib/utils/document-client-utils';
import { DocumentViewerModal } from '@/components/common';
import { toast } from 'sonner';
import type { BuildingPermissionData, BuildingPermissionItem } from '@/types/ptis.types';
import { cn } from '@/lib/utils/cn';

export interface BuildingPermissionTabProps {
  data?: BuildingPermissionData;
  propertyId?: number | string | null;
  wardNo?: string | null;
  wardId?: number | string | null;
  propertyNo?: string | null;
  partitionNo?: string | null;
  onFieldChange?: (field: string, value: string | boolean) => void;
  readOnly?: boolean;
  isExpanded?: boolean;
}

const BuildingPermissionTab: React.FC<BuildingPermissionTabProps> = ({
  data,
  propertyId,
  wardNo,
  wardId,
  propertyNo,
  partitionNo,
}) => {
  const t = useTranslations('ptis');
  const locale = useLocale();
  const router = useRouter();

  const [activeViewingKey, setActiveViewingKey] = React.useState<string | null>(null);
  const [viewerData, setViewerData] = React.useState<{
    isOpen: boolean;
    url: string;
    name: string;
    label?: string;
    contentType?: string;
  } | null>(null);

  // Filter for items that have actual certificate data (number, date, or document) or hasCertificate=true
  const items = React.useMemo(() => {
    return (data?.items || []).filter(Boolean).filter((item) => {
      const hasContent = !!(
        item.certificateNo?.trim() ||
        item.issueDate?.trim() ||
        item.documentGuid?.trim()
      );
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

  const handleViewDocument = async (item: BuildingPermissionItem, rowKey: string) => {
    if (!item.documentGuid) {
      toast.info(
        t('building.noDocumentAttached') ||
          'No document file attached for this certificate.'
      );
      return;
    }

    setActiveViewingKey(rowKey);
    try {
      const res = await getDocumentBlobUrl(item.documentGuid, locale);
      const isImg = res.contentType?.toLowerCase().startsWith('image/');
      const defaultExt = isImg
        ? (res.contentType.toLowerCase().includes('png') ? 'png' : 'jpg')
        : 'pdf';
      const resolvedName = item.fileName || `${item.certificateNo || 'Document'}.${defaultExt}`;
      setViewerData({
        isOpen: true,
        url: res.url,
        name: resolvedName,
        label: item.certificateTypeName,
        contentType: res.contentType,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to view document');
    } finally {
      setActiveViewingKey(null);
    }
  };

  const handleEditCertificate = (item: BuildingPermissionItem) => {
    const resolvedPropId = propertyId || (item as { propertyId?: number }).propertyId;
    if (!resolvedPropId) {
      toast.error('Property ID is required to edit certificates.');
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set('propertyId', String(resolvedPropId));
    if (wardNo) searchParams.set('wardNo', String(wardNo));
    if (wardId) searchParams.set('wardId', String(wardId));
    if (propertyNo) searchParams.set('propertyNo', String(propertyNo));
    if (partitionNo) searchParams.set('partitionNo', String(partitionNo));
    searchParams.set('returnTab', 'buildingpermission');
    searchParams.set('fromFooterEdit', 'true');
    searchParams.set('hideWing', 'true');

    // Specify the exact certificate to open and edit
    if (item.certificateTypeId) {
      searchParams.set('certificateTypeId', String(item.certificateTypeId));
    }

    // Specify the floor scope if this certificate is floor-specific
    if (item.propertyDetailsId) {
      searchParams.set('activeScope', 'Floor');
      searchParams.set('selectedFloorId', String(item.propertyDetailsId));
      searchParams.set('activeFloorId', String(item.propertyDetailsId));
    }

    const editUrl = `/${locale}/property-tax/ptis/QuickDataEntry/${resolvedPropId}/Building?${searchParams.toString()}`;
    router.push(editUrl);
  };

  const formatCertificateDate = (dateStr?: string | null): string => {
    if (!dateStr) return '-';
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return format(parsed, 'dd/MM/yyyy');
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-xs font-semibold text-slate-600">
          {t('building.noCertificatesAttached') ||
            t('noDataAvailable') ||
            'No attached certificates available for this property.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full text-xs table-fixed">
            <thead>
              <tr className="bg-[#1e3a8a] text-white border-b border-blue-700/60 font-bold uppercase tracking-wider text-[12px]">
                <th className="py-2.5 px-4 whitespace-nowrap text-center w-[35%] min-w-[200px] border-r border-blue-700/60">
                  {t('building.certificateName') || 'Certificate Name'}
                </th>
                <th className="py-2.5 px-4 whitespace-nowrap text-center w-[25%] min-w-[150px] border-r border-blue-700/60">
                  {t('building.certificateNo') || 'Certificate No.'}
                </th>
                <th className="py-2.5 px-4 whitespace-nowrap text-center w-[23%] min-w-[130px] border-r border-blue-700/60">
                  {t('building.certificateDate') || 'Certificate Date'}
                </th>
                <th className="py-2.5 px-4 whitespace-nowrap text-center w-[17%] min-w-[100px]">
                  {t('building.action') || 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {items.map((item, index) => {
                const scopeName = item.floorDescription
                  ? item.floorDescription
                  : item.propertyDetailsId
                    ? `Floor #${item.propertyDetailsId}`
                    : null;

                const rowKey = item.propertyCertificateId
                  ? String(item.propertyCertificateId)
                  : `${item.certificateTypeId}-${item.propertyDetailsId || 'property'}-${index}`;

                const hasDoc = Boolean(item.documentGuid);
                const isViewingThis = activeViewingKey === rowKey;

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-blue-50/40 transition-colors duration-150"
                  >
                    {/* Certificate Name - centered to align with header */}
                    <td className="py-2.5 px-4 align-middle text-center font-medium text-slate-900 border-r border-slate-200">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-900 text-xs">
                          {item.certificateTypeName}
                        </span>
                        {scopeName ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 shrink-0">
                            {scopeName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {t('building.propertyScope') || 'Property Level'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Certificate No. - centered */}
                    <td className="py-2.5 px-4 align-middle text-center font-semibold text-slate-800 font-mono text-xs border-r border-slate-200">
                      {item.certificateNo || '-'}
                    </td>

                    {/* Certificate Date - centered */}
                    <td className="py-2.5 px-4 align-middle text-center text-slate-700 font-medium text-xs border-r border-slate-200">
                      {formatCertificateDate(item.issueDate)}
                    </td>

                    {/* Action Column: Eye button to view and Pencil button to edit */}
                    <td className="py-2.5 px-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Eye Button to View */}
                        <button
                          type="button"
                          onClick={() => handleViewDocument(item, rowKey)}
                          disabled={!hasDoc || activeViewingKey !== null}
                          className={cn(
                            'p-1.5 rounded-md border transition-all shadow-xs inline-flex items-center justify-center cursor-pointer',
                            hasDoc
                              ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 border-blue-200 active:scale-95'
                              : 'text-slate-300 bg-slate-50 border-slate-200 cursor-not-allowed opacity-50'
                          )}
                          title={
                            hasDoc
                              ? t('building.viewDocument') || 'View Document'
                              : t('building.noDocumentAttached') || 'No document attached'
                          }
                          aria-label={t('building.viewDocument') || 'View Document'}
                        >
                          {isViewingThis ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </button>

                        {/* Pencil Button to Edit */}
                        <button
                          type="button"
                          onClick={() => handleEditCertificate(item)}
                          className="p-1.5 rounded-md border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 transition-all shadow-xs inline-flex items-center justify-center cursor-pointer active:scale-95"
                          title={t('building.editCertificate') || 'Edit Certificate'}
                          aria-label={t('building.editCertificate') || 'Edit Certificate'}
                        >
                          <Pencil className="w-4 h-4 text-amber-600 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewerData && (
        <DocumentViewerModal
          isOpen={viewerData.isOpen}
          onClose={closeViewer}
          fileUrl={viewerData.url}
          fileName={viewerData.name}
          label={viewerData.label}
          contentType={viewerData.contentType}
        />
      )}
    </>
  );
};

export default BuildingPermissionTab;
