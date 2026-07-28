"use client";
 
import React from "react";
import { AlertTriangle, X } from "lucide-react";
 
interface SaveDetailsConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedFloorIds?: number[]) => void;
    certificateName?: string;
    certificateNumber?: string;
    certificateDate?: string;
    targetFloors?: Array<{ 
        propertyDetailsId: number; 
        floorDescription?: string | null; 
        subFloorDescription?: string | null;
        constructionTypeDescription?: string | null;
        typeOfUseDescription?: string | null;
    }>;
    isPropertyWideGlobal?: boolean;
    t: (key: string) => string;
    isUnsavedWarning?: boolean;
    incompleteFloors?: Array<{
        floorName: string;
        certificateNames: string[];
    }>;
}
 
export const SaveDetailsConfirmModal: React.FC<SaveDetailsConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    certificateName = "",
    certificateNumber = "",
    certificateDate = "",
    targetFloors = [],
    isPropertyWideGlobal = false,
    t,
    isUnsavedWarning = false,
    incompleteFloors = []
}) => {
    const [deselectedFloorIds, setDeselectedFloorIds] = React.useState<Set<number>>(new Set());
 
    if (!isOpen) return null;
 
    const isAllSelected = targetFloors.length > 0 && deselectedFloorIds.size === 0;
    const isSomeSelected = deselectedFloorIds.size > 0 && deselectedFloorIds.size < targetFloors.length;
    const selectedCount = targetFloors.length - deselectedFloorIds.size;
 
    const handleSelectAll = () => {
        if (isAllSelected) {
            setDeselectedFloorIds(new Set(targetFloors.map(f => f.propertyDetailsId)));
        } else {
            setDeselectedFloorIds(new Set());
        }
    };
 
    const handleSelectRow = (id: number) => {
        setDeselectedFloorIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };
 
    const handleConfirmClick = () => {
        const selectedFloorIds = targetFloors
            .map(f => f.propertyDetailsId)
            .filter(id => !deselectedFloorIds.has(id));
        onConfirm(selectedFloorIds);
    };
 
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] transition-opacity duration-300" 
                onClick={onClose} 
            />
 
            {/* Modal Box */}
            <div 
                className="relative w-[520px] max-w-[95vw] rounded-2xl bg-white shadow-[0_30px_70px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Accent Top Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${
                    isUnsavedWarning 
                        ? "from-red-600 via-rose-500 to-amber-500" 
                        : "from-amber-500 via-orange-500 to-red-500"
                }`} />
 
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all focus:outline-none"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>
 
                {/* Content Container */}
                <div className="p-8 flex flex-col items-center">
                    {/* Warning Icon wrapper */}
                    <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 animate-bounce duration-1000">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
 
                    {/* Modal Title */}
                    <h3 className="mt-5 text-2xl font-extrabold text-slate-800 tracking-tight text-center">
                        {isUnsavedWarning 
                            ? (t("building.unsavedChangesTitle") || "Unsaved Changes")
                            : t("building.confirmSaveDetailsTitle")}
                    </h3>
 
                    {isUnsavedWarning ? (
                        <>
                            <p className="mt-3 text-sm text-slate-600 text-center max-w-[420px] leading-relaxed font-semibold">
                                {t("building.unsavedChangesDesc") || "You have unsaved changes in the Building Permission tab. Do you want to discard them, or continue editing?"}
                            </p>
 
                            {incompleteFloors && incompleteFloors.length > 0 && (
                                <div className="mt-5 w-full bg-amber-50/40 border border-amber-200 rounded-xl p-4 shadow-sm space-y-2.5 text-left max-h-[200px] overflow-y-auto scrollbar-thin">
                                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                        <span>{t("building.incompleteFloorsWarning")}</span>
                                    </div>
                                    <ul className="space-y-1.5 text-slate-700 text-xs pl-2 font-semibold">
                                        {incompleteFloors.map((inf, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-amber-500 font-bold">•</span>
                                                <span>
                                                    <strong className="text-slate-800">{inf.floorName}</strong>: {inf.certificateNames.join(", ")}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Detailed Card */
                        <div className="mt-6 w-full bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-inner space-y-3.5 text-sm text-slate-700">
                            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">{t("building.confirmCertificateLabel")}:</span>
                                <span className="font-bold text-slate-800 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                                    {certificateName}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">{t("building.confirmCertNumberLabel")}:</span>
                                <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-0.5 border border-slate-100 rounded shadow-sm text-xs">
                                    {certificateNumber || "—"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">{t("building.confirmCertDateLabel")}:</span>
                                <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-0.5 border border-slate-100 rounded shadow-sm text-xs">
                                    {certificateDate || "—"}
                                </span>
                            </div>
                            <div className="pt-1">
                                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs block mb-2">
                                    {t("building.confirmApplyingToFloorsLabel")}:
                                </span>
                                {isPropertyWideGlobal ? (
                                    <div className="space-y-2">
                                        <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-100 rounded block text-xs w-fit">
                                            {t("building.confirmPropertyWideGlobalLabel")}
                                        </span>
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-semibold text-amber-800 leading-relaxed">
                                            {t("building.confirmPropertyWideGlobalWarning") || "Warning: All floors already have floor-wise certificates attached. Applying this certificate property-wide will override the floor-wise certificates on all floors. Do you want to apply it property-wide?"}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-xl bg-white scrollbar-thin">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100/85 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider sticky top-0 bg-slate-100 z-10 select-none">
                                                    <th className="p-2.5 w-12 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isAllSelected}
                                                            ref={(el) => {
                                                                if (el) {
                                                                    el.indeterminate = isSomeSelected;
                                                                }
                                                            }}
                                                            onChange={handleSelectAll}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </th>
                                                    <th className="p-2.5">{t("floor.floor")}</th>
                                                    <th className="p-2.5">{t("floor.conType")}</th>
                                                    <th className="p-2.5">{t("floor.use")}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                                {targetFloors.map(f => {
                                                    const isChecked = !deselectedFloorIds.has(f.propertyDetailsId);
                                                    return (
                                                        <tr 
                                                            key={f.propertyDetailsId} 
                                                            onClick={() => handleSelectRow(f.propertyDetailsId)}
                                                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${isChecked ? 'bg-blue-50/20' : ''}`}
                                                        >
                                                            <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleSelectRow(f.propertyDetailsId)}
                                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="p-2.5 font-bold text-slate-800">
                                                                {f.floorDescription}
                                                                {f.subFloorDescription ? ` - ${f.subFloorDescription}` : ""}
                                                            </td>
                                                            <td className="p-2.5 text-slate-600">
                                                                {f.constructionTypeDescription || "—"}
                                                            </td>
                                                            <td className="p-2.5 text-slate-600">
                                                                {f.typeOfUseDescription || "—"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
 
                    {/* Action Buttons */}
                    <div className="mt-8 flex items-center justify-center gap-4 w-full">
                        {isUnsavedWarning ? (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold h-12 text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>{t("building.continueButton") || "Continue Editing"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onConfirm()}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold h-12 text-sm transition-all border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                                >
                                    <X className="h-4 w-4" />
                                    <span>{t("building.discardConfirmButton") || "Discard Changes"}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleConfirmClick}
                                    disabled={!isPropertyWideGlobal && targetFloors.length > 0 && selectedCount === 0}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold h-12 text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>{t("building.confirmReplaceOk")}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold h-12 text-sm transition-all border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                                >
                                    <X className="h-4 w-4" />
                                    <span>{t("building.confirmReplaceCancel")}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
