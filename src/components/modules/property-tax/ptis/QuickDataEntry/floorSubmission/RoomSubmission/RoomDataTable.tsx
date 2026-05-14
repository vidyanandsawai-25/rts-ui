"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Edit2, Trash2, Info, XCircle } from "lucide-react";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { Tooltip, Button } from "@/components/common";
import { RoomDataTableProps, RoomData } from "@/types/room-details.types";
import { OffsetData } from "@/types/offset-details.types";
import { COLUMN_WIDTHS } from "./RoomTableConfig";
import { cn } from "@/lib/utils/cn";
import { RoomTypeSelect } from "./components/RoomTypeSelect";

export const RoomDataTable: React.FC<RoomDataTableProps> = (props) => {
    const {
        rooms,
        grandTotal,
        builtupGrandTotal,
        areaUnit,
        setRooms,
        inlineEditingCell,
        setInlineEditingCell,
        handleEdit,
        handleDelete,
        handleCancelEdit,
        editingIndex,
        selectedRoomForPlan,
        onOpenOffset,
    } = props;

    const t = useTranslations("quickDataEntry");

    const columns = useMemo(() => [
        {
            key: "roomNo",
            label: t("roomSubmission.table.roomNo"),
            width: COLUMN_WIDTHS.roomNo,
            headerClassName: "text-center",
            cellClassName: "font-medium text-gray-700 text-center",
        },
        {
            key: "utilities",
            label: t("roomSubmission.table.roomType"),
            width: COLUMN_WIDTHS.roomType,
            render: (_val: unknown, row: RoomData, idx: number) => (
                <div className="flex justify-center">
                    {inlineEditingCell?.rowIndex === idx && inlineEditingCell?.field === 'utilities' ? (
                        <RoomTypeSelect
                            value={row.utilities}
                            onChange={(newVal) => {
                                const updatedRooms = [...rooms];
                                updatedRooms[idx] = { ...updatedRooms[idx], utilities: newVal };
                                setRooms(updatedRooms);
                                setInlineEditingCell(null);
                            }}
                        />
                    ) : (
                        <div
                            className="cursor-pointer hover:bg-blue-100/50 px-2 py-1 rounded transition-colors truncate text-gray-900"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(idx);
                                setInlineEditingCell({ rowIndex: idx, field: 'utilities' });
                            }}
                        >
                            {row.utilities || "-"}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "shape",
            label: t("roomSubmission.table.shape"),
            width: COLUMN_WIDTHS.shape,
            render: (val: unknown) => (
                <div className="px-2 text-gray-900 font-medium truncate text-center">
                    {val && val !== "-Select-" ? t(`roomSubmission.input.shapes.${String(val).replace(/\s+/g, '').replace(/^\w/, c => c.toLowerCase())}`) : "-Select-"}
                </div>
            )
        },
        {
            key: "area",
            label: `${t("roomSubmission.table.area")} (${areaUnit})`,
            width: COLUMN_WIDTHS.area,
            render: (val: unknown) => <div className="text-center"><span className="font-semibold text-gray-800">{parseFloat(String(val || 0)).toFixed(2)}</span></div>
        },
        {
            key: "roomCount",
            label: t("roomSubmission.table.roomCount"),
            width: COLUMN_WIDTHS.roomCount,
            cellClassName: "text-gray-700 text-center",
        },
        {
            key: "offsetMinus",
            label: t("roomSubmission.table.offset"),
            width: COLUMN_WIDTHS.offset,
            render: (val: unknown, row: RoomData, idx: number) => (
                <div className="flex justify-center">
                    <Tooltip placement="top" content={row.offsets && row.offsets.length > 0
                        ? t("offsetTooltip", {
                            details: row.offsets.map((off: OffsetData) => {
                                                                // Normalize shape to match translation keys (remove spaces, lowercase first char only)
                                                                const normalizedShape = off.shape
                                                                    ? off.shape.replace(/\s+/g, "").replace(/^\w/, c => c.toLowerCase())
                                                                    : "";
                                                                return `${t(`roomSubmission.input.shapes.${normalizedShape}`)}, ${off.operation === "subtract" ? "-" : "+"}${off.area.toFixed(2)}`;
                            }).join(", ")
                        })
                        : t("offsetTooltipEmpty")}
                    >
                        <div
                            className="flex justify-center items-center gap-1 cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenOffset) onOpenOffset(idx);
                            }}
                        >
                            {val === "Yes" ? (
                                <div className="flex items-center text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 font-bold">
                                    {row.offsets?.length || 0}
                                    <Info className="w-2.5 h-2.5 ml-1" />
                                </div>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100">{t("floor.no")}</span>
                            )}
                        </div>
                    </Tooltip>
                </div>
            )
        },
        {
            key: "outer",
            label: t("roomSubmission.table.outer"),
            width: COLUMN_WIDTHS.outer,
            render: (val: unknown) => (
                <div className="flex justify-center">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        val === "Yes" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-600 border border-blue-100"
                    )}>
                        {val === "Yes" ? t("floor.yes") : t("floor.no")}
                    </span>
                </div>
            )
        },
        {
            key: "total",
            label: `${t("roomSubmission.table.total")} (${areaUnit})`,
            width: COLUMN_WIDTHS.total,
            render: (val: unknown) => <div className="text-center"><span className="font-bold text-indigo-700">{parseFloat(String(val || 0)).toFixed(2)}</span></div>
        }
    ], [rooms, areaUnit, inlineEditingCell, t, handleEdit, onOpenOffset, setInlineEditingCell, setRooms]);

    const finalColumns = columns;

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <MasterTable<RoomData & Record<string, unknown>>
                columns={finalColumns as Column<RoomData & Record<string, unknown>>[]}
                data={rooms as (RoomData & Record<string, unknown>)[]}
                maxBodyHeightClassName="max-h-[260px]"
                emptyText={t("roomSubmission.table.noData")}
                getRowKey={(row: RoomData) => String(row.tempId || row.roomNo || '')}
                rowClassName={(row: RoomData, idx: number) => cn(
                    "transition-colors hover:bg-blue-50/50 cursor-pointer",
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                    editingIndex === idx || selectedRoomForPlan?.tempId === row.tempId ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : ""
                )}
                renderActions={(row: RoomData) => {
                    const idx = rooms.indexOf(row);
                    return (
                        <>
                            {editingIndex === idx && (
                                <Tooltip placement="top" content={t("roomSubmission.table.cancel")}> 
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        icon={XCircle}
                                        onClick={(e) => { e.stopPropagation(); handleCancelEdit?.(); }}
                                        className="shadow-sm hover:scale-110 active:scale-95"
                                    />
                                </Tooltip>
                            )}
                            <Tooltip placement="top" content={t("roomSubmission.table.edit")}> 
                                <Button
                                    variant="edit"
                                    size="xs"
                                    icon={Edit2}
                                    onClick={(e) => { e.stopPropagation(); handleEdit(idx); }}
                                    className="shadow-sm hover:scale-110 active:scale-95"
                                />
                            </Tooltip>
                            <Tooltip placement="top" content={t("roomSubmission.table.delete")}> 
                                <Button
                                    variant="delete"
                                    size="xs"
                                    icon={Trash2}
                                    onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                                    className="shadow-sm hover:scale-110 active:scale-95"
                                />
                            </Tooltip>
                        </>
                    );
                }}
                footerRightContent={
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-600">
                                {t("roomSubmission.table.totalArea")}
                            </span>
                            <span className="text-sm font-bold text-gray-800">
                                {grandTotal.toFixed(2)} {areaUnit}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-600 uppercase">
                                {t("roomSubmission.table.totalBuiltupArea")}
                            </span>
                            <span className="text-[12px] font-bold text-blue-700">
                                {builtupGrandTotal.toFixed(2)} {areaUnit}
                            </span>
                        </div>
                    </div>
                }
            >
            </MasterTable>
        </div>
    );
};

