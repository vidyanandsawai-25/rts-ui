'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Drawer } from '@/components/common/Drawer';
import { Button, CancelButton, LoadingPage, SaveButton } from '@/components/common';
import { MasterTable } from '@/components/common/MasterTable';
import { Tabs } from '@/components/common/Tabs';
import { ChevronDown, ChevronUp, User, Building2, Layers } from 'lucide-react';
import type {
  ApartmentQCDetail,
  ApartmentTaxDetailsItems,
  DualMethodTaxDetails,
} from '@/types/apartmentQC.types';
import type { Floor } from '@/types/floor.types';
import type { ConstructionType } from '@/types/construction.types';
import type { UseType, UseSubType } from '@/types/typeOfUse.types';
import { usePropertyEditScreenDrawer } from '@/hooks/apartmentQc/usePropertyEditScreenDrawer';
import {
  useDrawerCommonColumns,
  useDrawerRateableColumns,
  useDrawerCapitalColumns,
} from './PropertyEditScreenColumns';
import {
  EditableInput,
  EditableSelect,
  ReadOnlyInput,
  EditableInputWithRefresh,
} from './PropertyEditDrawerInputs';
import type { RoomWiseSubmissionData } from '@/lib/api/ptis/appartmentQC/appartmentQC-room.service';
import {
  getRoomWiseSubmissionsAction,
  fetchApartmentTaxDetailsByIdAction,
  fetchApartmentTaxDetailsCvByIdAction,
  fetchDualMethodTaxDetailsByIdAction,
} from '@/app/[locale]/property-tax/ptis/appartmentQC/action';
import type { RoomAPIResponse } from '@/types/room-details.types';
import type { DrawerFloorDataRow } from '@/hooks/apartmentQc/propertyEditScreenDrawer.types';
import { RoomWiseSubmission } from './roomSubmission/RoomWiseSubmission';
import { ApartmentTaxDetailsTable } from './ApartmentTaxDetailsTable';
import { limitSingleAtEmail, limitTwoDigitNumber } from '@/lib/utils/validation-rules';
import { capitalizeEachWord } from '@/lib/utils/input-sanitization';

interface ResidentialEditScreenProps {
  open: boolean;
  onClose?: () => void;
  onSaveOrClose?: () => void;
  propertyData?: ApartmentQCDetail | null;
  subTab?: string;
  floors?: Floor[];
  constructionTypes?: ConstructionType[];
  useTypes?: UseType[];
  allSubTypes?: UseSubType[];
  initialFloorQCData?: ApartmentQCDetail[];
  initialPropertyTypes?: Array<{ value: string; label: string }>;
  returnTo?: 'amenities' | 'commercial' | 'residential';
}

const ResidentialEditScreen = ({
  open,
  onClose,
  onSaveOrClose,
  propertyData,
  subTab: subTabProp = 'rateable',
  floors = [],
  constructionTypes = [],
  useTypes = [],
  allSubTypes = [],
  initialFloorQCData,
  initialPropertyTypes,
  returnTo = 'amenities',
}: ResidentialEditScreenProps) => {
  const t = useTranslations('appartmentQC');
  const [areaUnit, setAreaUnit] = useState<'sq.m' | 'sq.ft'>('sq.m');

  const handleToggleUnit = () => {
    setAreaUnit((prev) => (prev === 'sq.m' ? 'sq.ft' : 'sq.m'));
  };
  const hook = usePropertyEditScreenDrawer({
    open,
    onClose,
    onSaveOrClose,
    propertyData,
    subTabProp,
    initialFloorQCData,
    initialPropertyTypes,
    floors,
    constructionTypes,
    useTypes,
    allSubTypes,
  });

  // Destructure the hook handles used within callbacks so the dep arrays are
  // primitive references rather than 'hook.x.y' chains (react-hooks/exhaustive-deps).
  const {
    roomDrawerOpen,
    roomPdnId,
    roomPropertyId,
    formData: hookFormData,
    updateFormField: hookUpdateFormField,
    floorData: hookFloorData,
    refetchFloorQC: hookRefetchFloorQC,
    handleOpenRoomSubmission: hookHandleOpenRoomSubmission,
  } = hook;

  // State for client-side fetched room data
  const [clientRoomData, setClientRoomData] = useState<RoomWiseSubmissionData[]>([]);
  const [isLoadingRoomData, setIsLoadingRoomData] = useState(false);
  const [selectedFloorRow, setSelectedFloorRow] = useState<DrawerFloorDataRow | null>(null);

  // State for tax details
  const [taxDetails, setTaxDetails] = useState<ApartmentTaxDetailsItems | null>(null);
  const [dualMethodTaxDetails, setDualMethodTaxDetails] = useState<DualMethodTaxDetails | null>(
    null
  );
  const [isLoadingTaxDetails, setIsLoadingTaxDetails] = useState(false);

  // Clear selected floor row when room drawer closes
  useEffect(() => {
    if (!roomDrawerOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFloorRow(null);
    }
  }, [roomDrawerOpen]);

  // Update selectedFloorRow when hookFloorData changes (after refetch)
  useEffect(() => {
    if (selectedFloorRow && hookFloorData.length > 0) {
      const updatedRow = hookFloorData.find((row) => row.pdnId === selectedFloorRow.pdnId);
      if (updatedRow) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedFloorRow(updatedRow);
      }
    }
  }, [hookFloorData, selectedFloorRow]);

  // Fetch room data when room drawer opens (client-side).
  // Reset state in cleanup (the lint rule exempts cleanups) instead of setting
  // it inside the effect body, which would trip react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!roomDrawerOpen || !roomPdnId || !roomPropertyId) return;
    let cancelled = false;
    const fetchRoomData = async () => {
      try {
        setIsLoadingRoomData(true);
        const result = await getRoomWiseSubmissionsAction({
          propertyId: Number(roomPropertyId),
          propertyDetailsId: Number(roomPdnId),
        });
        if (!cancelled) {
          setClientRoomData(result.success && result.data ? result.data : []);
        }
      } catch {
        if (!cancelled) setClientRoomData([]);
      } finally {
        if (!cancelled) setIsLoadingRoomData(false);
      }
    };
    fetchRoomData();
    return () => {
      cancelled = true;
      setClientRoomData([]);
    };
  }, [roomDrawerOpen, roomPdnId, roomPropertyId]);

  // Extract propertyId to a stable reference for useEffect
  const propertyId = propertyData?.id ?? null;

  // Fetch tax details when drawer opens using property ID
  useEffect(() => {
    if (!open || propertyId === null) return;

    const mainTab = returnTo; // 'amenities', 'commercial', or 'residential'

    let cancelled = false;

    const fetchTaxData = async () => {
      try {
        setIsLoadingTaxDetails(true);

        if (subTabProp === 'dual-method') {
          const result = await fetchDualMethodTaxDetailsByIdAction(propertyId, mainTab);
          if (!cancelled && result.success) {
            setDualMethodTaxDetails(result.data || null);
            setTaxDetails(null);
          }
        } else if (subTabProp === 'capital') {
          const result = await fetchApartmentTaxDetailsCvByIdAction(propertyId, mainTab);
          if (!cancelled && result.success) {
            setTaxDetails(result.data || null);
            setDualMethodTaxDetails(null);
          }
        } else {
          // rateable
          const result = await fetchApartmentTaxDetailsByIdAction(propertyId, mainTab);
          if (!cancelled && result.success) {
            setTaxDetails(result.data || null);
            setDualMethodTaxDetails(null);
          }
        }
      } catch {
        // Error handling - silent fail
      } finally {
        if (!cancelled) setIsLoadingTaxDetails(false);
      }
    };

    fetchTaxData();

    return () => {
      cancelled = true;
      setTaxDetails(null);
      setDualMethodTaxDetails(null);
      setIsLoadingTaxDetails(false);
    };
  }, [open, propertyId, returnTo, subTabProp]);

  // Handle old property data refresh
  const handleOldPropertyRefresh = useCallback(async () => {
    const oldPropNo = hookFormData.oldPropertyNo?.trim();
    if (!oldPropNo) return;

    // Helper to clear all old property fields
    const clearOldPropertyFields = () => {
      hookUpdateFormField('oldRV', '');
      hookUpdateFormField('oldTax', '');
      hookUpdateFormField('oldArea', '');
      hookUpdateFormField('oldUseType', '');
      hookUpdateFormField('oldConstructionType', '');
      hookUpdateFormField('oldConstructionYear', '');
      hookUpdateFormField('oldCSN', '');
    };

    try {
      const { fetchOldPropertyDataAction } =
        await import('@/app/[locale]/property-tax/ptis/appartmentQC/action');
      const result = await fetchOldPropertyDataAction(oldPropNo);

      if (!result.success) {
        // Clear all old property fields when fetch fails
        clearOldPropertyFields();
        toast.error(result.error || 'Failed to fetch old property data');
        return;
      }
      if (!result.data) {
        // Clear all old property fields when no data found
        clearOldPropertyFields();
        toast.error('No old property data found');
        return;
      }

      const d = result.data;

      // Check if all old property fields are null/empty
      const hasOldRV = d.oldRV != null && d.oldRV !== 0;
      const hasOldTax = d.oldTotalTax != null && d.oldTotalTax !== 0;
      const hasOldArea = d.oldConstructionArea != null && d.oldConstructionArea !== 0;
      const hasOldUseType = d.oldUseType && d.oldUseType.trim() !== '';
      const hasOldConType = d.oldConstructionType && d.oldConstructionType.trim() !== '';
      const hasOldConYear = d.oldConstructionYear && d.oldConstructionYear.trim() !== '';
      const hasOldCSN = d.oldCSN && d.oldCSN.trim() !== '';

      const hasAnyData =
        hasOldRV ||
        hasOldTax ||
        hasOldArea ||
        hasOldUseType ||
        hasOldConType ||
        hasOldConYear ||
        hasOldCSN;

      if (!hasAnyData) {
        // Clear all old property fields when all values are null/empty
        clearOldPropertyFields();
        toast.error(`No old property data found for property no. "${oldPropNo}"`);
        return;
      }

      hookUpdateFormField('oldRV', d.oldRV != null ? String(d.oldRV) : '');
      hookUpdateFormField('oldTax', d.oldTotalTax != null ? String(d.oldTotalTax) : '');
      hookUpdateFormField(
        'oldArea',
        d.oldConstructionArea != null ? String(d.oldConstructionArea) : ''
      );
      hookUpdateFormField('oldUseType', d.oldUseType || '');
      hookUpdateFormField('oldConstructionType', d.oldConstructionType || '');
      hookUpdateFormField('oldConstructionYear', d.oldConstructionYear || '');
      hookUpdateFormField('oldCSN', d.oldCSN || '');
      toast.success('Old property data refreshed');
    } catch {
      // Clear all old property fields on error
      clearOldPropertyFields();
      toast.error('Failed to fetch old property data');
    }
  }, [hookFormData.oldPropertyNo, hookUpdateFormField]);

  // Map room data to expected format for RoomWiseSubmission component
  const mappedRoomData: RoomAPIResponse[] = useMemo(() => {
    return clientRoomData.map((r) => {
      // Map roomWiseMinusData to offsets format
      const offsets = (r.roomWiseMinusData || []).map((minus) => ({
        id: minus.id || 0,
        roomWiseSubmissionId: minus.roomWiseSubmissionId || 0,
        lengthMtr: minus.lengthMtr || 0,
        length: minus.lengthMtr || 0,
        widthMtr: minus.widthMtr || 0,
        breadth: minus.widthMtr || 0,
        heightMtr: minus.heightMtr || 0,
        height: minus.heightMtr || 0,
        areaSqMtr: minus.areaSqMtr || 0,
        area: minus.areaSqMtr || 0,
        shape: minus.shape || 'Rectangle',
        base1Mtr: minus.base1Mtr || 0,
        base2Mtr: minus.base2Mtr || 0,
        operation: minus.operation || 'subtract',
        remark: minus.remark || 'SUB',
        isOffset: minus.isOffset ?? false,
      })) as RoomAPIResponse['offsets'];

      const mapped: RoomAPIResponse = {
        id: r.id || 0,
        roomWiseSubmissionId: r.id || 0,
        roomNo: String(r.roomNo || ''),
        roomType: r.roomTypeDescription || r.roomType || '',
        utilities: r.roomTypeDescription || r.roomType || '',
        roomTypeId: r.roomTypeId || 0,
        lengthMtr: r.lengthMtr || 0,
        length: r.lengthMtr || 0,
        widthMtr: r.widthMtr || 0,
        breadth: r.widthMtr || 0,
        width: r.widthMtr || 0,
        heightMtr: r.heightMtr || 0,
        height: r.heightMtr || 0,
        areaSqMtr: r.areaSqMtr || 0,
        area: r.areaSqMtr || 0,
        noOfRooms: r.noOfRooms || 1,
        roomCount: r.noOfRooms || 1,
        totalAreaSqMtr: r.totalAreaSqMtr || 0,
        total: r.totalAreaSqMtr || 0,
        shape: r.shape || 'Rectangle',
        shapeType: r.shape || 'Rectangle',
        outerYesNo: r.outerYesNo || false,
        OuterYesNo: r.outerYesNo || false,
        outer: r.outerYesNo ? 'Yes' : 'No',
        minusYesNo: r.minusYesNo || false,
        MinusYesNo: r.minusYesNo || false,
        offsetMinus: r.minusYesNo ? 'Yes' : 'No',
        submissionType: r.submissionType || 'room',
        base1Mtr: r.base1Mtr || 0,
        base2Mtr: r.base2Mtr || 0,
        offsets: offsets,
        minusRooms: offsets,
        roomWiseMinusData: r.roomWiseMinusData || [],
        shapeParameters: {
          length: String(r.lengthMtr || 0),
          width: String(r.widthMtr || 0),
          radius: '',
          base: '',
          height: String(r.heightMtr || 0),
          side: '',
          base1: String(r.base1Mtr || 0),
          base2: String(r.base2Mtr || 0),
        },
      };

      return mapped;
    });
  }, [clientRoomData]);

  const isDrawerLoading =
    hook.isLoadingFloorQCData ||
    hook.isLoadingPropertyTypes ||
    hook.isLoadingFloors ||
    hook.isLoadingConTypes ||
    hook.isLoadingUseTypes ||
    isLoadingTaxDetails;

  // Refetch tax details - used after room submission updates to refresh the tax details based on the latest room data changes.
  const refetchTaxDetails = useCallback(async () => {
    if (!propertyId) return;

    try {
      setIsLoadingTaxDetails(true);

      const mainTab = returnTo;

      if (subTabProp === 'dual-method') {
        const result = await fetchDualMethodTaxDetailsByIdAction(propertyId, mainTab);

        if (result.success) {
          setDualMethodTaxDetails(result.data || null);
          setTaxDetails(null);
        }
      } else if (subTabProp === 'capital') {
        const result = await fetchApartmentTaxDetailsCvByIdAction(propertyId, mainTab);

        if (result.success) {
          setTaxDetails(result.data || null);
          setDualMethodTaxDetails(null);
        }
      } else {
        const result = await fetchApartmentTaxDetailsByIdAction(propertyId, mainTab);

        if (result.success) {
          setTaxDetails(result.data || null);
          setDualMethodTaxDetails(null);
        }
      }
    } catch {
      toast.error('Failed to refresh tax details');
    } finally {
      setIsLoadingTaxDetails(false);
    }
  }, [propertyId, returnTo, subTabProp]);
  // Handle room submission updates: optimistic local area update, then ask
  // the backend to recompute room aggregates for this floor (sync-rooms), then
  // refetch the Floor QC table so the new aggregates appear in the drawer.
  const handleRoomUpdate = useCallback(
    async (_data: {
      floorNumber: string;
      rooms: import('@/types/room-details.types').RoomData[];
      totalAreaSqM: number;
      builtUpAreaSqM: number;
      roomCount: number;
    }) => {
      if (!roomPdnId || !roomPropertyId) return;

      const floorRow = hookFloorData.find((row) => row.pdnId === Number(roomPdnId));
      if (floorRow) {
        // hookUpdateFloorRowArea(floorRow.id, data.totalAreaSqM.toFixed(2));
        // // Optimistically update noOfRooms so the count changes immediately
        // if (data.roomCount !== undefined) {
        //   hookUpdateFloorRowCount(floorRow.id, String(data.roomCount));
        // }
        await hookRefetchFloorQC();
        await refetchTaxDetails();
      }

      try {
        const { syncRoomsForPropertyDetailsAction } =
          await import('@/app/[locale]/property-tax/ptis/appartmentQC/action');
        const result = await syncRoomsForPropertyDetailsAction(
          Number(roomPropertyId),
          Number(roomPdnId)
        );
        if (result.success) {
          await hookRefetchFloorQC();
        } else {
          toast.error(result.error || 'Failed to sync rooms');
        }
      } catch {
        toast.error('Failed to sync rooms');
      }
    },
    [
      roomPdnId,
      roomPropertyId,
      hookFloorData,
      hookRefetchFloorQC,
      refetchTaxDetails,
    ]
  );

  // Wrap the room submission opener so the loader appears immediately in the
  // same synchronous event tick as the URL change. React 18 batches these
  // state updates, so the RoomWiseSubmission drawer renders with the loader
  // on the very first frame instead of flashing empty data.
  const handleOpenRoomSubmissionWithLoading = useCallback(
    (row: DrawerFloorDataRow) => {
      setIsLoadingRoomData(true);
      setSelectedFloorRow(row);
      hookHandleOpenRoomSubmission(row);
    },
    [hookHandleOpenRoomSubmission]
  );

  // Column definitions
  const commonColumns = useDrawerCommonColumns({
    floorOptions: hook.floorOptions,
    conTypeOptions: hook.conTypeOptions,
    useTypeOptions: hook.useTypeOptions,
    getSubTypeOptions: hook.getSubTypeOptionsForUseType,
    isLoadingFloors: hook.isLoadingFloors,
    isLoadingConTypes: hook.isLoadingConTypes,
    isLoadingUseTypes: hook.isLoadingUseTypes,
    handleFloorDropdownClick: hook.handleFloorDropdownClick,
    handleConTypeDropdownClick: hook.handleConTypeDropdownClick,
    handleUseTypeDropdownClick: hook.handleUseTypeDropdownClick,
    updateRow: hook.updateFloorRow,
    onOpenRoomSubmission: handleOpenRoomSubmissionWithLoading,
  });
  const rateableColumns = useDrawerRateableColumns();
  const capitalColumns = useDrawerCapitalColumns();

  const floorColumns = useMemo(() => {
    if (hook.subTab === 'capital') return [...commonColumns, ...capitalColumns];
    if (hook.subTab === 'dual-method') {
      return hook.dualMethodTab === 'capital'
        ? [...commonColumns, ...capitalColumns]
        : [...commonColumns, ...rateableColumns];
    }
    return [...commonColumns, ...rateableColumns];
  }, [commonColumns, rateableColumns, capitalColumns, hook.subTab, hook.dualMethodTab]);

  // if (!propertyData) {
  //   return (
  //     <Drawer open={open} onClose={hook.handleClose} width="xl" title={t('drawer.title')}>
  //       <div className="p-8 text-center">
  //         <p className="text-gray-600">{t('drawer.noPropertyData')}</p>
  //         <Button onClick={hook.handleClose} variant="secondary" size="sm" className="mt-4">
  //           {t('drawer.goBack')}
  //         </Button>
  //       </div>
  //     </Drawer>
  //   );
  // }

  const tableStyle = (col: (typeof floorColumns)[0]) => ({
    ...col,
    cellClassName: `${col.cellClassName || ''} whitespace-nowrap`,
    headerClassName: `${col.headerClassName || ''} !px-1 !py-0.5 border-l !border-gray-300`,
  });

  return (
    <>
      <Drawer
        open={open}
        onClose={hook.handleClose}
        width="xl"
        title={
          <div className="flex items-center justify-between w-full">
            <h2 className="text-base font-semibold text-gray-900">{t('drawer.title')}</h2>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">{`Ward: ${propertyData?.wardNo || propertyData?.wardId || '-'}`}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-medium">{`Zone: ${propertyData?.zoneNo || '-'}`}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">{`Prop: ${propertyData?.propertyNo || '-'}`}</span>
            </div>
          </div>
        }
        footer={
          <>
            <CancelButton onClick={hook.handleClose} label={t('drawer.cancel')} />
            <SaveButton
              onClick={hook.handleSave}
              isLoading={hook.isSavingFloorQC}
              disabled={hook.isSavingFloorQC}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
          </>
        }
      >
        {isDrawerLoading ? (
          <LoadingPage />
        ) : (
          <div className="p-3 space-y-3">
            {/* Basic Information Section */}
            <div className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => hook.setIsBasicInfoOpen(!hook.isBasicInfoOpen)}
                className="w-full bg-blue-600 text-gray-100 px-3 py-2 flex items-center justify-between hover:bg-blue-500 transition"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-semibold text-sm">{t('drawer.basicInformation')}</span>
                </div>
                {hook.isBasicInfoOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {hook.isBasicInfoOpen && (
                <div className="p-3 bg-white space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <EditableInput
                      label={t('basicInfo.fields.ownerName.label')}
                      value={hook.formData.ownerName}
                      onChange={(v) => hook.updateFormField('ownerName', capitalizeEachWord(v))}
                      required
                      error={hook.formErrors.ownerName}
                      onBlur={() => hook.handleFieldBlur('ownerName')}
                    />
                    <EditableInput
                      label={t('basicInfo.fields.occupierName.label')}
                      value={hook.formData.occupierName}
                      onChange={(v) => hook.updateFormField('occupierName', capitalizeEachWord(v))}
                      required
                      error={hook.formErrors.occupierName}
                      onBlur={() => hook.handleFieldBlur('occupierName')}
                    />
                    <EditableInput
                      label={t('basicInfo.fields.renterName.label')}
                      value={hook.formData.renterName}
                      onChange={(v) => hook.updateFormField('renterName', capitalizeEachWord(v))}
                      error={hook.formErrors.renterName}
                      onBlur={() => hook.handleFieldBlur('renterName')}
                    />
                    <EditableSelect
                      label={t('basicInfo.fields.propertyDescription.label')}
                      value={hook.formData.propertyTypeId}
                      onChange={(v) => {
                        hook.updateFormField('propertyTypeId', v);
                        const s = hook.propertyTypeOptions.find((o) => o.value === v);
                        hook.updateFormField('propertyDescription', s?.label || '');
                      }}
                      options={hook.propertyTypeOptions}
                      isLoading={hook.isLoadingPropertyTypes}
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    <EditableInput
                      label={t('basicInfo.fields.bhk.label')}
                      value={hook.formData.bhk}
                      onChange={(v) => hook.updateFormField('bhk', limitTwoDigitNumber(v))}
                      error={hook.formErrors.bhk}
                      onBlur={() => hook.handleFieldBlur('bhk')}
                    />
                    <EditableInput
                      label={t('basicInfo.fields.mobileNo.label')}
                      value={hook.formData.mobileNo}
                      onChange={(v) => hook.updateFormField('mobileNo', v)}
                      error={hook.formErrors.mobileNo}
                      onBlur={() => hook.handleFieldBlur('mobileNo')}
                    />
                    <EditableInput
                      label={t('basicInfo.fields.emailId.label')}
                      value={hook.formData.emailId}
                      type="text"
                      onChange={(v) => hook.updateFormField('emailId', limitSingleAtEmail(v))}
                      error={hook.formErrors.emailId}
                      onBlur={() => hook.handleFieldBlur('emailId')}
                    />
                    <EditableInput
                      label={t('basicInfo.fields.flatOrShopName.label')}
                      value={hook.formData.flatOrShopName}
                      onChange={(v) => hook.updateFormField('flatOrShopName', capitalizeEachWord(v))}
                      error={hook.formErrors.flatOrShopName}
                      onBlur={() => hook.handleFieldBlur('flatOrShopName')}
                    />
                    <EditableInput
                      label={t('basicInfo.fields.wingName.label')}
                      value={hook.formData.wingName}
                      onChange={(v) => hook.updateFormField('wingName', capitalizeEachWord(v))}
                      error={hook.formErrors.wingName}
                      onBlur={() => hook.handleFieldBlur('wingName')}
                    />
                    <EditableInput
                      label={t('basicInfo.fields.flatOrShopNo.label')}
                      value={hook.formData.flatOrShopNo}
                      onChange={(v) => hook.updateFormField('flatOrShopNo', v)}
                      required
                      error={hook.formErrors.flatOrShopNo}
                      onBlur={() => hook.handleFieldBlur('flatOrShopNo')}
                    />
                    <EditableInputWithRefresh
                      label={t('basicInfo.fields.oldPropertyNo.label')}
                      value={hook.formData.oldPropertyNo}
                      onChange={(v) => hook.updateFormField('oldPropertyNo', v)}
                      onRefresh={handleOldPropertyRefresh}
                      error={hook.formErrors.oldPropertyNo}
                      onBlur={() => hook.handleFieldBlur('oldPropertyNo')}
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    <ReadOnlyInput
                      label={t('basicInfo.fields.remark.label')}
                      value={hook.formData.remark}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.oldRV.label')}
                      value={hook.formData.oldRV}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.newRV.label')}
                      value={hook.formData.newRV}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.oldTax.label')}
                      value={hook.formData.oldTax}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.newTax.label')}
                      value={hook.formData.newTax}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.oldArea.label')}
                      value={hook.formData.oldArea}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.newArea.label')}
                      value={hook.formData.newArea}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <ReadOnlyInput
                      label={t('basicInfo.fields.oldUseType.label')}
                      value={hook.formData.oldUseType}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.oldConstructionType.label')}
                      value={hook.formData.oldConstructionType}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.oldCSN.label')}
                      value={hook.formData.oldCSN}
                    />
                    <ReadOnlyInput
                      label={t('basicInfo.fields.oldConstructionYear.label')}
                      value={hook.formData.oldConstructionYear}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Floor QC Section */}
            <div className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => hook.setIsFloorQCOpen(!hook.isFloorQCOpen)}
                className="w-full bg-blue-600 px-3 py-2 flex items-center justify-between hover:bg-blue-500 transition"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-100" />
                  <span className="font-semibold text-sm text-gray-100">{t('drawer.floorQC')}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">{`${hook.floorData.length} floors`}</span>
                </div>
                {hook.isFloorQCOpen ? (
                  <ChevronUp className="w-4 h-4 text-white" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white" />
                )}
              </button>
              {hook.isFloorQCOpen && (
                <div className="bg-white my-3">
                  {hook.subTab === 'dual-method' ? (
                    <Tabs
                      value={hook.dualMethodTab}
                      onChange={(v) => hook.setDualMethodTab(v as 'rateable' | 'capital')}
                      variant="pills"
                      size="sm"
                      className="p-2"
                    >
                      <Tabs.TabList className="mb-0">
                        <Tabs.Tab value="rateable">{t('drawer.tabs.rateable')}</Tabs.Tab>
                        <Tabs.Tab value="capital">{t('drawer.tabs.capital')}</Tabs.Tab>
                      </Tabs.TabList>
                      <Tabs.TabPanel value="rateable">
                        <MasterTable
                          columns={floorColumns.map(tableStyle)}
                          data={hook.floorData}
                          loading={hook.isLoadingFloorQCData}
                          tableClassName="text-[10px] w-max min-w-full"
                          theadClassName="bg-[#e8eef4] text-black sticky top-0 z-20"
                          height="sm"
                        />
                      </Tabs.TabPanel>
                      <Tabs.TabPanel value="capital">
                        <MasterTable
                          columns={floorColumns.map(tableStyle)}
                          data={hook.floorData}
                          loading={hook.isLoadingFloorQCData}
                          tableClassName="text-[10px] w-max min-w-full"
                          theadClassName="bg-[#e8eef4] text-black sticky top-0 z-20"
                          height="sm"
                        />
                      </Tabs.TabPanel>
                    </Tabs>
                  ) : (
                    <MasterTable
                      columns={floorColumns.map(tableStyle)}
                      data={hook.floorData}
                      loading={hook.isLoadingFloorQCData}
                      tableClassName="text-[10px] w-max min-w-full"
                      theadClassName="bg-[#e8eef4] text-black sticky top-0 z-20"
                      height="sm"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Tax Details Section */}
            <ApartmentTaxDetailsTable
              taxDetails={taxDetails}
              dualMethodDetails={dualMethodTaxDetails}
              loading={isLoadingTaxDetails}
              activeMainTab={returnTo}
              activeSubTab={subTabProp}
            />
          </div>
        )}
      </Drawer>

      {/* Room Submission Drawer */}
      {hook.roomDrawerOpen && hook.roomPdnId && hook.roomPropertyId && (
        <Drawer
          open={hook.roomDrawerOpen}
          onClose={hook.handleCloseRoomDrawer}
          width="xl"
          title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">

              <h2 className="text-base font-bold flex items-center gap-2 text-blue-900">
                <Layers className="w-4 h-4 text-blue-600" />
                {t('drawer.roomWiseSubmission')}
                ({areaUnit === "sq.m" ? t('drawer.units.sqM') : t('drawer.units.sqFt')})
              </h2>

              {/* Unit Toggle Pill */}
              <div className="flex items-center bg-blue-50/50 rounded-full p-0.5 border border-blue-100 shadow-inner ml-2">

                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => areaUnit === "sq.ft" && handleToggleUnit()}
                  className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
                    areaUnit === "sq.m"
                      ? "bg-white text-blue-600 shadow-sm scale-105"
                      : "text-blue-400/70 hover:text-blue-600"
                  }`}
                >
                  {t('drawer.units.sqM')}
                </Button>


                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => areaUnit === "sq.m" && handleToggleUnit()}
                  className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
                    areaUnit === "sq.ft"
                      ? "bg-white text-blue-600 shadow-sm scale-105"
                      : "text-blue-400/70 hover:text-blue-600"
                  }`}
                >
                  {t('drawer.units.sqFt')}
                </Button>

              </div>

            </div>
          </div>
        }
        >
          {isLoadingRoomData ? (
            <LoadingPage />
          ) : (
            <RoomWiseSubmission
              key={`room-submission-${hook.roomPdnId}-${clientRoomData.length}`}
              isOpen={true}
              onClose={hook.handleCloseRoomDrawer}
              onUpdate={handleRoomUpdate}
              displayMode="inline"
              initialPropertyID={Number(hook.roomPropertyId)}
              initialFloorId={Number(hook.roomPdnId)}
              floorNumber={String(hook.roomPdnId)}
              initialRooms={mappedRoomData}
              existingRooms={mappedRoomData}
              externalAreaUnit={areaUnit}
              onExternalToggleUnit={handleToggleUnit}
              maxRooms={100}
              selectedFloorRow={selectedFloorRow}
              floorLookup={hook.loadedFloorOptions}
              constructionLookup={hook.loadedConTypeOptions}
              useLookup={hook.loadedUseTypeOptions}
              subTypeLookup={hook.loadedSubTypeOptions}
            />
          )}
        </Drawer>
      )}
    </>
  );
};

export default ResidentialEditScreen;
