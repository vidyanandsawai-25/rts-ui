"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Map as MapIcon } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { ZoneItem } from "@/types/zoneMaster.types";
import { WardItem } from "@/types/wardMaster.types";
import { NextPageButton, SearchSelect, StatusBadge } from "@/components/common";
import { ViewWards } from "./ViewWards";
import { ZoneWards } from "./ZoneWards";
import { handleLinkWardsToZone } from "./wardHandlers";
import { getAllWardsForLinkAction, getAllWardsForZoneAction } from "@/app/[locale]/property-tax/zone-master/actions";

const PAGE_SIZE_OPTIONS = [
	{ label: "10", value: "10" },
	{ label: "20", value: "20" },
	{ label: "50", value: "50" },
	{ label: "100", value: "100" }
];

interface Props {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	onWardsChanged?: () => void;
	zones: ZoneItem[];
	selectedZoneId: number | null;
	ssrAllWards?: WardItem[];
	ssrAllZones?: ZoneItem[];
	ssrSelectedWards?: WardItem[];
	ssrViewAllWards?: WardItem[];
	ssrViewAllWardsTotalCount?: number;
	ssrViewAllWardsTotalPages?: number;
}

export default function LinkWard({
	open,
	onClose,
	onWardsChanged,
	zones,
	selectedZoneId,
	ssrAllZones = [],
	ssrSelectedWards = [],
	ssrViewAllWards = [],
	ssrViewAllWardsTotalCount = 0,
	ssrViewAllWardsTotalPages = 0,
}: Props) {
	const t = useTranslations("zoneMaster");
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [selectAllLoading, setSelectAllLoading] = useState(false);
	const [isSelectAllActive, setIsSelectAllActive] = useState(false);
	const hasInitialized = useRef(false);
	const prevOpen = useRef(open);

	// State for zone selection
	const [currentZoneId, setCurrentZoneId] = useState<number | null>(selectedZoneId);
	const [loadingZoneWards, setLoadingZoneWards] = useState(false);
	const [zoneWardsList, setZoneWardsList] = useState<WardItem[]>(ssrSelectedWards);

	// Search state
	const [zoneSearchTerm, setZoneSearchTerm] = useState("");
	const [viewAllSearchTerm, setViewAllSearchTerm] = useState("");

	const zonePage = Number(searchParams.get("zonewardpage")) || 1;
	const zonePageSize = Number(searchParams.get("zonewardpagesize")) || 10;

	const viewWardPage = Number(searchParams.get("viewwardpage")) || 1;
	const viewWardPageSize = Number(searchParams.get("viewwardpagesize")) || 10;
	
	// Extract viewwardq param value for initialization
	const initialViewWardSearch = searchParams.get("viewwardq") || "";

	// Zone options for SearchSelect
	const zoneOptions = useMemo(() => {
		const allZones = [...zones, ...ssrAllZones];
		const uniqueZones = Array.from(
			new Map<number, ZoneItem>(allZones.map(z => [z.id, z])).values()
		);
		return uniqueZones.map(zone => ({
			label: zone.description && zone.description !== zone.zoneNo
				? `${zone.zoneNo} - ${zone.description}`
				: zone.zoneNo,
			value: String(zone.id),
		}));
	}, [zones, ssrAllZones]);

	// Helper to get zone display label
	const getZoneDisplayLabel = useCallback((zoneId: number | undefined | null): string | null => {
		if (zoneId === undefined || zoneId === null || zoneId === 0) return null;
		const allZones = [...zones, ...ssrAllZones];
		const zone = allZones.find(z => z.id === zoneId);
		if (!zone) return null;
		const description = zone.description || zone.zoneNo || "";
		const zoneNo = zone.zoneNo || "";
		if (description && zoneNo && description !== zoneNo) {
			return `${description} (${zoneNo})`;
		}
		return zoneNo || description;
	}, [zones, ssrAllZones]);

	// Check if ward is assigned to a zone
	const isWardAssigned = useCallback((ward: WardItem): boolean => {
		return ward.zoneId !== undefined && ward.zoneId !== null && ward.zoneId > 0;
	}, []);

	// View all wards from SSR
	const viewAllFilteredWards = ssrViewAllWards;

	// Filter zone wards (client-side)
	const zoneWardsRaw = useMemo(() => {
		let wards = zoneWardsList;
		if (zoneSearchTerm) {
			const term = zoneSearchTerm.toLowerCase();
			wards = wards.filter(w =>
				w.wardNo.toLowerCase().includes(term) ||
				(w.description && w.description.toLowerCase().includes(term))
			);
		}
		return wards;
	}, [zoneWardsList, zoneSearchTerm]);

	// Paginate Zone Wards
	const zoneWards = useMemo(() => zoneWardsRaw, [zoneWardsRaw]);
	const totalZonePages = Math.ceil(zoneWards.length / zonePageSize) || 1;
	const paginatedZoneWards = useMemo(() => {
		const start = (zonePage - 1) * zonePageSize;
		const end = start + zonePageSize;
		return zoneWards.slice(start, end);
	}, [zoneWards, zonePage, zonePageSize]);

	// Handle zone selection change
	const handleZoneChange = async (_name: string | undefined, value: string) => {
		const zoneId = Number(value);
		if (!zoneId || isNaN(zoneId)) return;

		setCurrentZoneId(zoneId);
		setLoadingZoneWards(true);

		// Reset zone ward page to 1 when changing zones, preserve page size
		const params = new URLSearchParams(searchParams.toString());
		params.set("zonewardpage", "1");
		// Preserve existing page size or set default
		if (!params.has("zonewardpagesize")) {
			params.set("zonewardpagesize", String(zonePageSize));
		}
		router.replace(`${pathname}?${params.toString()}`);

		// Fetch wards for the selected zone using the new API
		try {
			const result = await getAllWardsForZoneAction(zoneId);
			if (result.success && result.data) {
				setZoneWardsList(result.data);
			} else {
				toast.error(result.error || t("wardMessages.failedToFetchWards"));
				setZoneWardsList([]);
			}
		} catch {
			toast.error(t("wardMessages.failedToFetchWards"));
			setZoneWardsList([]);
		} finally {
			setLoadingZoneWards(false);
		}
	};

	// Initialize states when drawer opens (only once per open)
	useEffect(() => {
		// Only initialize when drawer transitions from closed to open
		if (open && !prevOpen.current) {
			hasInitialized.current = false;
		}
		prevOpen.current = open;

		if (open && !hasInitialized.current) {
			hasInitialized.current = true;
			setCheckedAvailable(new Set());
			setCurrentZoneId(selectedZoneId);
			setZoneWardsList(ssrSelectedWards);
			setViewAllSearchTerm(initialViewWardSearch);
			setZoneSearchTerm("");
			setIsSelectAllActive(false);
		}
	}, [open, selectedZoneId, ssrSelectedWards, initialViewWardSearch]);

	// Toggle checkbox in view wards list
	const toggleAvailableCheck = useCallback((wardNo: string) => {
		// Check if ward is already in the selected zone
		const isAlreadyInZone = zoneWardsList.some(w => w.wardNo === wardNo);
		
		if (isAlreadyInZone) {
			const zoneLabel = getZoneDisplayLabel(currentZoneId);
			toast.warning(
				t("wardMessages.wardAlreadyInCurrentZone", {
					wardNo,
					zoneLabel: zoneLabel || ""
				})
			);
			return;
		}

		setCheckedAvailable(prev => {
			const newChecked = new Set(prev);
			if (newChecked.has(wardNo)) {
				newChecked.delete(wardNo);
			} else {
				newChecked.add(wardNo);
			}
			return newChecked;
		});
	}, [zoneWardsList, currentZoneId, getZoneDisplayLabel, t]);

	// Handle Select All in ViewWards - just toggle state, API call happens in moveToSelected
	const handleSelectAllViewWards = useCallback((isChecked: boolean) => {
		setIsSelectAllActive(isChecked);
		if (!isChecked) {
			// When unchecked, clear any individual selections
			setCheckedAvailable(new Set());
		}
	}, []);

	// Move checked items from view wards to selected zone
	const moveToSelected = async () => {
		if (!currentZoneId) return;

		// If select all is active, fetch all wards from API
		if (isSelectAllActive) {
			setLoading(true);
			setSelectAllLoading(true);
			try {
				// Fetch all wards when moving to selected (API call happens here, not on checkbox click)
				const result = await getAllWardsForLinkAction(viewAllSearchTerm || undefined);
				if (!result.success || !result.data) {
					toast.error(result.error || t("wardMessages.fetchError"));
					return;
				}
				
				// Filter out wards that are already in the selected zone
				const wardsToLink = result.data.filter(
					w => !zoneWardsList.some(zw => zw.wardNo === w.wardNo)
				);
				
				if (wardsToLink.length === 0) {
					const zoneLabel = getZoneDisplayLabel(currentZoneId);
					toast.info(
						t("wardMessages.allWardsAlreadyInZone", {
							zoneLabel: zoneLabel || ""
						})
					);
					return;
				}

				const linkResult = await handleLinkWardsToZone({
					currentZoneId,
					wardNos: wardsToLink.map(w => w.wardNo),
					zoneWardsList,
					viewAllFilteredWards,
					onWardsChanged,
					t: (key: string, values?: Record<string, unknown>) => t(key, values as never)
				});

				if (linkResult.success) {
					// Refresh zone wards from API after successful linking
					const zoneWardsResult = await getAllWardsForZoneAction(currentZoneId);
					if (zoneWardsResult.success && zoneWardsResult.data) {
						setZoneWardsList(zoneWardsResult.data);
					} else if (linkResult.updatedWards) {
						setZoneWardsList(linkResult.updatedWards);
					}
					setIsSelectAllActive(false);
					setCheckedAvailable(new Set());
				}
			} finally {
				setLoading(false);
				setSelectAllLoading(false);
			}
			return;
		}

		// Normal flow: move individually checked wards
		const toMove = Array.from(checkedAvailable);
		if (toMove.length === 0) return;

		setLoading(true);
		const result = await handleLinkWardsToZone({
			currentZoneId,
			wardNos: toMove,
			zoneWardsList,
			viewAllFilteredWards,
			onWardsChanged,
			t: (key: string, values?: Record<string, unknown>) => t(key, values as never)
		});

		if (result.success) {
			// Refresh zone wards from API after successful linking
			const zoneWardsResult = await getAllWardsForZoneAction(currentZoneId);
			if (zoneWardsResult.success && zoneWardsResult.data) {
				setZoneWardsList(zoneWardsResult.data);
			} else if (result.updatedWards) {
				setZoneWardsList(result.updatedWards);
			}
			setCheckedAvailable(new Set());
		}
		setLoading(false);
	};

	const handleClose = useCallback(() => {
		// Reset all states
		setCheckedAvailable(new Set());
		setZoneSearchTerm("");
		setViewAllSearchTerm("");
		setIsSelectAllActive(false);

		// Clear zone ward pagination from URL
		const params = new URLSearchParams(searchParams.toString());
		params.delete("zonewardpage");
		params.delete("zonewardpagesize");
		router.replace(`${pathname}?${params.toString()}`);

		// Let the parent handle URL cleanup via onClose (handleCloseDrawer in ZoneContent)
		onClose();
	}, [onClose, searchParams, router, pathname]);

	const handleZoneSearch = useCallback((value: string) => {
		setZoneSearchTerm(value);
		const params = new URLSearchParams(searchParams.toString());
		params.set("zonewardpage", "1");
		router.replace(`${pathname}?${params.toString()}`);
	}, [searchParams, router, pathname]);

	const handleZonePageChange = useCallback((newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("zonewardpage", newPage.toString());
		router.replace(`${pathname}?${params.toString()}`);
	}, [searchParams, router, pathname]);

	const handleZonePageSizeChange = useCallback((newSize: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("zonewardpagesize", newSize.toString());
		params.set("zonewardpage", "1");
		router.replace(`${pathname}?${params.toString()}`);
	}, [searchParams, router, pathname]);

	const handleViewAllSearch = useCallback((value: string) => {
		setViewAllSearchTerm(value);
		const params = new URLSearchParams(searchParams.toString());
		if (value) params.set("viewwardq", value);
		else params.delete("viewwardq");
		params.set("viewwardpage", "1");
		router.replace(`${pathname}?${params.toString()}`);
	}, [searchParams, router, pathname]);

	const handleViewPageChange = useCallback((newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("viewwardpage", newPage.toString());
		router.replace(`${pathname}?${params.toString()}`);
	}, [searchParams, router, pathname]);

	const handleViewPageSizeChange = useCallback((newSize: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("viewwardpagesize", newSize.toString());
		params.set("viewwardpage", "1");
		router.replace(`${pathname}?${params.toString()}`);
	}, [searchParams, router, pathname]);

	return (
		<Drawer
			open={open}
			width="lg"
			title={
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
						<MapIcon size={20} />
					</div>
					<div>
						<div className="text-lg font-bold text-blue-900">
							{t("wardList.linkTitle")}
						</div>
					</div>
				</div>
			}
			onClose={handleClose}
		>
			<div className="flex flex-col md:flex-row gap-3 h-[75vh] p-6">
				{/* View All Wards */}
				<div className="flex-1 flex flex-col rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-md border-2 border-blue-200/50 shadow-lg" data-testid="available-wards-list">
					<div className="bg-gradient-to-r from-[#1A86E8] via-[#1A86E8] to-[#1A86E8] px-4 py-3 font-semibold text-sm text-[#fff] shadow-md">
						<span className="flex items-center gap-2">
							{t("wardList.viewWards")}
							<span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/30 border border-white/40">
								{ssrViewAllWardsTotalCount}
							</span>
						</span>
					</div>

					<ViewWards
						wards={viewAllFilteredWards}
						checkedWards={checkedAvailable}
						onToggleWard={toggleAvailableCheck}
						searchTerm={viewAllSearchTerm}
						onSearchChange={handleViewAllSearch}
						page={viewWardPage}
						pageSize={viewWardPageSize}
						onPageChange={handleViewPageChange}
						onPageSizeChange={handleViewPageSizeChange}
						totalPages={ssrViewAllWardsTotalPages}
						pageSizeOptions={PAGE_SIZE_OPTIONS}
						getZoneLabel={getZoneDisplayLabel}
						isWardAssigned={isWardAssigned}
						onSelectAllChange={handleSelectAllViewWards}
						isSelectAllActive={isSelectAllActive}
						selectAllLoading={selectAllLoading}
						totalCount={ssrViewAllWardsTotalCount}
					/>
				</div>

				{/* Control Buttons */}
				<div className="flex flex-col justify-center gap-3">
					<NextPageButton
						size="sm"
						onClick={moveToSelected}
						disabled={(checkedAvailable.size === 0 && !isSelectAllActive) || loading}
						title={t("wardMessages.moveSelectedToRight")}
					/>
				</div>

				{/* Selected Wards */}
				<div className="flex-1 flex flex-col rounded-xl bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-md border-2 border-purple-200/50 shadow-lg" data-testid="selected-wards-list">
					<div className="bg-gradient-to-r from-[#1A86E8] via-[#1A86E8] to-[#1A86E8] px-4 py-3 font-semibold text-sm text-[#fff] shadow-md">
						<div className="flex items-center justify-between gap-3">
							<span className="flex items-center gap-2">
								{t("wardList.wardsInZone")}
								<StatusBadge
									label={String(zoneWardsList.length)}
									variant="info"
								/>
							</span>
							<div className="flex-1 max-w-xs">
								<SearchSelect
									options={zoneOptions}
									value={String(currentZoneId || '')}
									onChange={handleZoneChange}
									placeholder={t("wardList.selectZone")}
									disabled={loadingZoneWards}
									isLoading={loadingZoneWards}
									disableSearch={false}
									className="text-sm"
								/>
							</div>
						</div>
					</div>
					<ZoneWards
						wards={paginatedZoneWards}
						searchTerm={zoneSearchTerm}
						onSearchChange={handleZoneSearch}
						page={zonePage}
						pageSize={zonePageSize}
						onPageChange={handleZonePageChange}
						onPageSizeChange={handleZonePageSizeChange}
						totalPages={totalZonePages}
						pageSizeOptions={PAGE_SIZE_OPTIONS}
						selectedWardCount={zoneWardsList.length}
					/>
				</div>
			</div>
		</Drawer>
	);
}