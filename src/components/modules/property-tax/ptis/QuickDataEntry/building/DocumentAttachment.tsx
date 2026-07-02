"use client";

import React from "react";
import { Eye, FileText, ShieldCheck, Download, UploadCloud, Loader2, Trash2 } from "lucide-react";
import { Button, Badge } from "@/components/common";
import { downloadDocumentClient, getDocumentBlobUrl } from "@/lib/utils/document-client-utils";
import { DocumentViewerModal } from "@/components/common";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { UploadDropzone } from "./UploadDropzone";
import { PreviousAttachmentInfo } from "./PreviousAttachmentInfo";

interface DocumentAttachmentProps {
    documentGuid?: string;
    fileName?: string;
    documentUrl?: string;
    hasDocumentBinding?: boolean;
    isUploading?: boolean;
    isDisabled: boolean;
    isDocumentInvalid: boolean;
    documentError?: string;
    onFileUpload: (file: File) => void;
    onFileDelete?: () => void;
    t: (key: string) => string;
    label?: string;
    pendingFile?: File;
}

export const DocumentAttachment: React.FC<DocumentAttachmentProps> = ({
    documentGuid, fileName, hasDocumentBinding, isUploading, isDisabled,
    isDocumentInvalid, documentError, onFileUpload, onFileDelete, t, label, pendingFile
}) => {
    const locale = useLocale();
    const [isViewing, setIsViewing] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [viewerData, setViewerData] = React.useState<{ isOpen: boolean; url: string; name: string } | null>(null);

    const isAnyActionRunning = !!isUploading || isViewing || isDownloading;

    React.useEffect(() => {
        return () => { if (viewerData?.url?.startsWith("blob:")) URL.revokeObjectURL(viewerData.url); };
    }, [viewerData]);

    const handleViewDocument = async () => {
        if (pendingFile) {
            setViewerData({ isOpen: true, url: URL.createObjectURL(pendingFile), name: fileName || "document" });
            return;
        }
        if (!documentGuid) return;
        setIsViewing(true);
        try {
            const { url } = await getDocumentBlobUrl(documentGuid, locale);
            setViewerData({ isOpen: true, url, name: fileName || "document" });
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to view document");
        } finally {
            setIsViewing(false);
        }
    };

    const closeViewer = () => {
        if (viewerData?.url?.startsWith("blob:")) URL.revokeObjectURL(viewerData.url);
        setViewerData(null);
    };

    const handleDownloadDocument = async () => {
        if (!documentGuid) return;
        setIsDownloading(true);
        try {
            await downloadDocumentClient(documentGuid, fileName, locale);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to download document");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!documentGuid && !hasDocumentBinding && !pendingFile) {
        return <UploadDropzone isDisabled={isDisabled} isUploading={isUploading} isDocumentInvalid={isDocumentInvalid} documentError={documentError} onFileUpload={onFileUpload} t={t} />;
    }

    if (!documentGuid && hasDocumentBinding && !pendingFile) {
        return <PreviousAttachmentInfo isDisabled={isDisabled} isUploading={isUploading} onFileUpload={onFileUpload} t={t} />;
    }

    const isPending = (documentGuid === "pending") || (!documentGuid && !!pendingFile);

    return (
        <div className="border border-blue-100 rounded-xl bg-blue-50/10 p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 shadow-sm border border-blue-100/50">
                    <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-blue-950 truncate mb-1">{fileName || t("building.documentAttached") || "Document Attached"}</p>
                    <div className="flex items-center gap-1.5">
                        <Badge
                            variant={isPending ? "warning" : "success"} size="sm" icon={ShieldCheck}
                            className={isPending ? "bg-amber-50 text-amber-700 border-amber-200 font-bold animate-pulse" : "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold"}
                        >
                            {isPending ? (t("building.pendingSave") || "Pending Save") : (t("building.activeAttachment") || "Active Attachment")}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                    disabled={isDisabled || isAnyActionRunning || (isPending && !pendingFile)}
                    isLoading={isViewing} variant="primary" size="sm" icon={Eye}
                    className="text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer disabled:opacity-50"
                    onClick={handleViewDocument}
                >
                    {t("building.viewDocument") || "View Document"}
                </Button>
                <Button
                    disabled={isDisabled || isAnyActionRunning || isPending}
                    isLoading={isDownloading} variant="secondary" size="sm" icon={Download}
                    className="text-sm font-bold border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50/40 hover:border-blue-500 cursor-pointer disabled:opacity-50"
                    onClick={handleDownloadDocument}
                >
                    {t("building.downloadDocument") || "Download Document"}
                </Button>
                {onFileDelete && (
                    <Button
                        disabled={isDisabled || isAnyActionRunning} variant="delete" size="sm" icon={Trash2}
                        className="text-sm font-bold border border-red-200 text-red-700 rounded-lg hover:bg-red-50/40 hover:border-red-500 cursor-pointer"
                        onClick={onFileDelete}
                    >
                        {t("building.deleteDocument") || "Delete Document"}
                    </Button>
                )}
                <label
                    className={`h-8 px-3 text-sm font-bold flex items-center gap-2 border border-blue-200 text-blue-700 rounded-lg transition-all bg-white shadow-sm whitespace-nowrap ${
                        isDisabled || isAnyActionRunning ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer hover:bg-blue-50/40 hover:border-blue-500"
                    }`}
                >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                    <span>{isUploading ? t("building.uploading") || "Uploading..." : t("building.replaceDocument") || "Replace File"}</span>
                    <input
                        type="file" className="hidden" disabled={isDisabled || isAnyActionRunning}
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                                onFileUpload(file);
                                e.target.value = "";
                            }
                        }}
                    />
                </label>
            </div>
            {viewerData && (
                <DocumentViewerModal
                    isOpen={viewerData.isOpen} onClose={closeViewer} fileUrl={viewerData.url} fileName={viewerData.name} label={label}
                />
            )}
        </div>
    );
};
