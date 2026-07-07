import React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input, AnimatedDigitInput, SearchSelect, SaveButton, CancelButton, Label, ValidationMessage } from '@/components/common';
import { useFloorSubmissionForm } from '@/hooks/apartmentQc/useFloorSubmissionForm';
import type { FloorSubmissionRow } from '@/types/apartmentQC.types';
import { LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { getRoomWiseSubmissionsAction } from '@/app/[locale]/property-tax/ptis/appartmentQC/action';
import RoomWiseSubmission from '@/components/modules/property-tax/ptis/appartmentQC/roomSubmission/RoomWiseSubmission';
import type { RoomAPIResponse } from '@/types/room-details.types';
import type { DrawerFloorDataRow } from '@/hooks/apartmentQc/propertyEditScreenDrawer.types';

import type { Floor } from '@/types/floor.types';
import type { ConstructionType } from '@/types/construction.types';
import type { UseType, UseSubType } from '@/types/typeOfUse.types';

interface FloorSubmissionFormProps {
    initialRow: FloorSubmissionRow;
    onCancel: () => void;
    onSaveSuccess: () => void;
    floorOptions?: Floor[];
    constructionTypeOptions?: ConstructionType[];
    useOptions?: UseType[];
    subUseTypeOptions?: UseSubType[];
    isEditMode?: boolean;
}

export const FloorSubmissionForm = ({
    initialRow,
    onCancel,
    onSaveSuccess,
    floorOptions = [],
    constructionTypeOptions = [],
    useOptions = [],
    subUseTypeOptions = [],
    isEditMode = false
}: FloorSubmissionFormProps) => {
    const t = useTranslations('appartmentQC');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const {
        formData,
        errors,
        isSaving,
        handleFieldChange,
        handleSave,
        handleOpenDropdown,
        floors,
        isLoadingFloors,
        conTypes,
        isLoadingConTypes,
        useTypes,
        isLoadingUseTypes,
        subTypes,
        isLoadingSubTypes,
        isSubTypeDisabled
    } = useFloorSubmissionForm(initialRow, onSaveSuccess, t, floorOptions, constructionTypeOptions, useOptions, subUseTypeOptions);

    const [isRoomDrawerOpen, setIsRoomDrawerOpen] = React.useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = React.useState(false);
    const [existingRooms, setExistingRooms] = React.useState<RoomAPIResponse[]>([]);
    const [areaUnit, setAreaUnit] = React.useState<'sq.m' | 'sq.ft'>('sq.m');

    const handleToggleUnit = () => {
        setAreaUnit((prev) => (prev === 'sq.m' ? 'sq.ft' : 'sq.m'));
    };

    const resolvedPropertyId = React.useMemo(() => {
        const rowPropertyId = (initialRow as Record<string, unknown>).propertyId;
        if (typeof rowPropertyId === 'number' || typeof rowPropertyId === 'string') {
            const parsed = Number(rowPropertyId);
            if (!Number.isNaN(parsed) && parsed > 0) return parsed;
        }

        const fromQuery = searchParams.get('editPropertyId') || searchParams.get('propertyId');
        const parsedQuery = Number(fromQuery || 0);
        return Number.isNaN(parsedQuery) ? 0 : parsedQuery;
    }, [initialRow, searchParams]);

    const handleOpenRoomDrawer = async () => {
        const propertyDetailsId = Number(initialRow.pdnId || 0);
        if (!resolvedPropertyId || !propertyDetailsId) {
            toast.error(t('messages.propertyIdMissing'));
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('roomDrawerOpen', 'true');
        params.set('roomPdnId', String(propertyDetailsId));
        params.set('roomPropertyId', String(resolvedPropertyId));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });

        setIsRoomDrawerOpen(true);
        setIsLoadingRooms(true);

        try {
            const result = await getRoomWiseSubmissionsAction({
                propertyId: resolvedPropertyId,
                propertyDetailsId,
            });

            if (!result.success || !result.data) {
                setExistingRooms([]);
                return;
            }

            const rooms = Array.isArray(result.data) ? result.data : [];
            const mappedRooms: RoomAPIResponse[] = rooms.map((r) => {
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

                return {
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
                    offsets,
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
            });

            setExistingRooms(mappedRooms);
        } catch {
            setExistingRooms([]);
            toast.error(t('messages.failedToLoadRooms'));
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const handleCloseRoomDrawer = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('roomDrawerOpen');
        params.delete('roomPdnId');
        params.delete('roomPropertyId');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });

        setIsRoomDrawerOpen(false);
        router.refresh();
    };

    const selectedFloorRow = React.useMemo<DrawerFloorDataRow>(() => ({
        id: String(initialRow.id || ''),
        pdnId: initialRow.pdnId,
        floorId: String(formData.floorId || initialRow.floorId || ''),
        conYear: String(formData.conYear || initialRow.conYear || ''),
        asstYear: String(formData.asstYear || initialRow.asstYear || ''),
        constructionTypeId: String(formData.constructionTypeId || initialRow.constructionTypeId || ''),
        typeOfUseId: String(formData.typeOfUseId || initialRow.typeOfUseId || ''),
        subTypeOfUseId: String(formData.subTypeOfUseId || initialRow.subTypeOfUseId || ''),
        noOfRooms: String(formData.noOfRooms || initialRow.noOfRooms || ''),
        area: String(formData.area || initialRow.area || ''),
        rentMY: String(initialRow.rentMY || ''),
        rateMY: String(initialRow.rateMY || ''),
        rentalValue: String(initialRow.rentalValue || ''),
        depreciation: String(initialRow.depreciation || ''),
        alv: String(initialRow.alv || ''),
        mr: String(initialRow.mr || ''),
        rv: String(initialRow.rv || ''),
        sdrr: String(initialRow.sdrr || ''),
        baseValue: String(initialRow.baseValue || ''),
        floorFactor: String(initialRow.floorFactor || ''),
        ageFactor: String(initialRow.ageFactor || ''),
        ntbFactor: String(initialRow.ntbFactor || ''),
        useFactor: String(initialRow.useFactor || ''),
        capitalValue: String(initialRow.capitalValue || ''),
    }), [formData, initialRow]);

    return (
        <div className="p-4 bg-white border-t-2 border-blue-200 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Dropdown: Floor */}
                <div className="flex flex-col gap-1 [&_ul[role='listbox']]:!max-h-45">
                    <Label required>{t('floorQC.columns.floor')}</Label>
                    <div onFocusCapture={() => handleOpenDropdown('loadFloor')}>
                        <SearchSelect
                            options={floors}
                            name="floor"
                            value={String(formData.floorId || '')}
                            onChange={(_, val) => handleFieldChange('floorId', val)}
                            placeholder={isLoadingFloors ? t('floorQC.form.loading') : t('floorQC.form.selectFloor')}
                            className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        />
                    </div>
                    {errors.floorId && <ValidationMessage message={t(errors.floorId)} />}
                </div>

                {/* Editable: Con Year */}
                <div className="flex flex-col gap-1">
                    <Label required>{t('floorQC.columns.conYear')}</Label>
                    <AnimatedDigitInput
                        id="conYear"
                        maxLength={4}
                        value={String(formData.conYear || '')}
                        onChange={(val) => handleFieldChange('conYear', val)}
                        placeholder={t('floorQC.form.yearPlaceholder')}
                        className="h-9 text-sm border-blue-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 rounded-lg"
                    />
                    {errors.conYear && <ValidationMessage message={t(errors.conYear)} />}
                </div>

                {/* Editable: Asst Year */}
                <div className="flex flex-col gap-1">
                    <Label required>{t('floorQC.columns.asstYear')}</Label>
                    <AnimatedDigitInput
                        id="asstYear"
                        maxLength={4}
                        value={String(formData.asstYear || '')}
                        onChange={(val) => handleFieldChange('asstYear', val)}
                        placeholder={t('floorQC.form.yearPlaceholder')}
                        className="h-9 text-sm border-blue-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 rounded-lg"
                    />
                    {errors.asstYear && <ValidationMessage message={t(errors.asstYear)} />}
                </div>

                {/* Dropdown: Construction Type */}
                <div className="flex flex-col gap-1 [&_ul[role='listbox']]:!max-h-45">
                    <Label required>{t('floorQC.columns.conType')}</Label>
                    <div onFocusCapture={() => handleOpenDropdown('loadConstruction')}>
                        <SearchSelect
                            options={conTypes}
                            name="constructionType"
                            value={String(formData.constructionTypeId || '')}
                            onChange={(_, val) => handleFieldChange('constructionTypeId', val)}
                            placeholder={isLoadingConTypes ? t('floorQC.form.loading') : t('floorQC.form.selectConType')}
                            className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        />
                    </div>
                    {errors.constructionTypeId && <ValidationMessage message={t(errors.constructionTypeId)} />}
                </div>

                {/* Dropdown: Use */}
                <div className="flex flex-col gap-1 [&_ul[role='listbox']]:!max-h-30">
                    <Label required>{t('floorQC.columns.use')}</Label>
                    <div onFocusCapture={() => handleOpenDropdown('loadUsage')}>
                        <SearchSelect
                            options={useTypes}
                            name="typeOfUse"
                            value={String(formData.typeOfUseId || '')}
                            onChange={(_, val) => {
                                handleFieldChange('typeOfUseId', val);
                                handleFieldChange('subTypeOfUseId', '');
                                if (val) {
                                    handleOpenDropdown('loadSubType', val);
                                }
                            }}
                            placeholder={isLoadingUseTypes ? t('floorQC.form.loading') : t('floorQC.form.selectUse')}
                            className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        />
                    </div>
                    {errors.typeOfUseId && <ValidationMessage message={t(errors.typeOfUseId)} />}
                </div>

                {/* Dropdown: Sub Type of Use */}
                <div className="flex flex-col gap-1 [&_ul[role='listbox']]:!max-h-30">
                    <Label>{t('floorQC.columns.subTypeOfUse')}</Label>
                    <div onFocusCapture={() => {
                        if (formData.typeOfUseId) {
                            handleOpenDropdown('loadSubType', String(formData.typeOfUseId));
                        }
                    }}>
                        <SearchSelect
                            options={subTypes}
                            name="subTypeOfUse"
                            value={String(formData.subTypeOfUseId || '')}
                            onChange={(_, val) => handleFieldChange('subTypeOfUseId', val)}
                            disabled={isSubTypeDisabled}
                            placeholder={isLoadingSubTypes ? t('floorQC.form.loading') : t('floorQC.form.selectSubType')}
                            className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        />
                    </div>
                    {errors.subTypeOfUseId && <ValidationMessage message={t(errors.subTypeOfUseId)} />}
                </div>

                {/* Editable: No of Rooms */}
                <div className="flex flex-col gap-1">
                    <Label>{t('floorQC.columns.noOfRooms')}</Label>
                    <Input
                        type="number"
                        value={formData.noOfRooms || ''}
                        onChange={(e) => handleFieldChange('noOfRooms', e.target.value)}
                        placeholder={t('floorQC.form.roomsPlaceholder')}
                    />
                    {errors.noOfRooms && <ValidationMessage message={t(errors.noOfRooms)} />}
                </div>

                {/* Disabled: Area */}
                <div className="flex flex-col gap-1.5">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                        {t('floorQC.columns.area')} <span className="text-red-500">*</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {t('floorQC.form.autoCalculated')}
                        </span>
                    </Label>
                    <div
                        className="relative cursor-pointer hover:ring-2 hover:ring-blue-200 rounded-lg transition-all"
                        onClick={handleOpenRoomDrawer}
                    >
                        <Input
                            type="text"
                            value={formData.area || ''}
                            disabled
                            className="bg-gray-50 text-gray-800 opacity-100 pr-[85px] h-9 text-sm border-gray-200 rounded-lg cursor-pointer pointer-events-none"
                        />
                        <div className="absolute inset-0 z-0" />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center h-7 px-2 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 tracking-wider pointer-events-none">
                            {t('floorQC.form.sqFt')}
                            <div className="w-px h-3 bg-slate-300 mx-1.5" />
                            <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

           
            <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                    <CancelButton onClick={onCancel} disabled={isSaving}>
                        {t('drawer.cancel')}
                    </CancelButton>
                    <SaveButton 
                        onClick={handleSave} 
                        disabled={isSaving}
                        label={isEditMode ? t('drawer.update') : t('buttons.save')}
                    />
                </div>
            </div>

            {isRoomDrawerOpen && !isLoadingRooms && (
                <RoomWiseSubmission
                    isOpen={isRoomDrawerOpen}
                    onClose={handleCloseRoomDrawer}
                    onUpdate={(data) => {
                        handleFieldChange('area', String(data.totalAreaSqM));
                        handleFieldChange('noOfRooms', String(data.roomCount));
                    }}
                    displayMode="modal"
                    initialPropertyID={resolvedPropertyId}
                    initialFloorId={initialRow.pdnId ?? undefined}
                    floorNumber={String(initialRow.floorId || '')}
                    existingRooms={existingRooms}
                    selectedFloorRow={selectedFloorRow}
                    floorLookup={floors}
                    constructionLookup={conTypes}
                    useLookup={useTypes}
                    subTypeLookup={subTypes}
                    t={t}
                    externalAreaUnit={areaUnit}
                    onExternalToggleUnit={handleToggleUnit}
                    maxRooms={100}
                />
            )}
        </div>
    );
};
