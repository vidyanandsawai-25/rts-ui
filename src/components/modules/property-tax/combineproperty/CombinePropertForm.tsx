'use client';

/* eslint-disable i18next/no-literal-string */
import { useCallback, useState, useTransition, useEffect, useMemo } from 'react';
import { Merge, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Drawer } from '@/components/common/Drawer';
import { SearchSelect, type SearchSelectOption } from '@/components/common/SearchSelect';
import { MultiSelectDropdown } from '@/components/common/Dropdown';
import { CancelButton, AddButton } from '@/components/common/ActionButtons';
import { MasterTable, Column } from '@/components/common/MasterTable';
import { CombinePropertyItem, PropertyCombineDetails } from '@/types/combine-property.types';
import { createCombinePropertyAction, fetchPropertyCombineDetailsAction } from '@/app/[locale]/property-tax/combineproperty/action';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface CombinePropertyFormProps {
  basePropertyList: CombinePropertyItem[];
  subPropertyList: CombinePropertyItem[];
  selectedBasePropertyId?: string;
  selectedWardId?: string;
  selectedPropertyNo?: string;
}

type SelectionMethod = 'range' | 'individual';

type PropertyRow = PropertyCombineDetails & Record<string, unknown>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toSelectOption(item: CombinePropertyItem): SearchSelectOption {
  const label = `${item.fromProperty}${item.toProperty && item.toProperty !== item.fromProperty ? ' – ' + item.toProperty : ''}`;
  return { label, value: item.fromProperty };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function CombinePropertyForm({
  basePropertyList,
  subPropertyList,
  selectedBasePropertyId,
  selectedWardId,
  selectedPropertyNo,
}: CombinePropertyFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ---- Local state for review table ---- */
  const [reviewData, setReviewData] = useState<PropertyCombineDetails[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---- Table Columns (Memoized to access reviewData state) ---- */
  const columns = useMemo<Column<PropertyRow>[]>(() => [
    {
      key: 'propertyId',
      label: 'SR. NO.',
      align: 'center',
      width: '60px',
      render: (_val, _row, idx) => (
        <span className="text-gray-600 font-semibold text-[12px]">{idx + 1}</span>
      ),
    },
    {
      key: 'wardNo',
      label: 'WARD',
      align: 'center',
      width: '90px',
      render: (val) => (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
          {String(val ?? '-')}
        </span>
      ),
    },
    {
      key: 'propertyNo',
      label: 'PROPERTY NO.',
      align: 'center',
      width: '100px',
      render: (val) => (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-blue-400 text-blue-600 text-[11px] font-bold">
          {String(val ?? '-')}
        </span>
      ),
    },
    {
      key: 'partitionNo',
      label: 'PARTITION NO.',
      align: 'center',
      width: '100px',
      render: (val) => (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-bold">
          {String(val ?? '-')}
        </span>
      ),
    },
    {
      key: 'oldPropertyNo',
      label: 'OLD PROPERTY NO.',
      align: 'center',
      width: '110px',
    },
    {
      key: 'ownerName',
      label: 'OWNER NAME',
      align: 'left',
      render: (val, _row, idx) => {
        // Highlight only if NOT same as first row
        const firstOwner = reviewData[0]?.ownerName;
        const isMismatch = idx > 0 && val !== firstOwner;
        return (
          <span className={isMismatch ? 'text-red-500 font-semibold' : 'text-gray-800 font-medium'}>
            {String(val ?? '-')}
          </span>
        );
      },
    },
    {
      key: 'occupierName',
      label: 'OCCUPIER NAME',
      align: 'left',
      render: (val) => (
        <span className="text-gray-700">{String(val ?? '') || '—'}</span>
      ),
    },
    {
      key: 'taxAmount',
      label: 'CURRENT TAX',
      align: 'right',
      width: '110px',
      render: (val) => (
        <span className="font-semibold text-gray-800">
          ₹{Number(val ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'pendingAmount',
      label: 'PENDING TAX',
      align: 'right',
      width: '110px',
      render: (val) => (
        <span className="font-semibold text-gray-800">
          ₹{Number(val ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
  ], [reviewData]);

  /* ---- Local state for selections (to ensure immediate UI feedback and fix race conditions with onBlur) ---- */
  const [rangeFrom, setRangeFrom] = useState(searchParams.get('from') ?? '');
  const [rangeTo, setRangeTo] = useState(searchParams.get('to') ?? '');
  const [selectedProperties, setSelectedProperties] = useState<string[]>(
    searchParams.get('individual')?.split(',').filter(Boolean) ?? []
  );

  /* ---- Sync local state with URL params (e.g. when navigated back or cleared) ---- */
  useEffect(() => {
    setRangeFrom(searchParams.get('from') ?? '');
    setRangeTo(searchParams.get('to') ?? '');
    setSelectedProperties(searchParams.get('individual')?.split(',').filter(Boolean) ?? []);
  }, [searchParams]);

  /* ---- derive selection method from URL ---- */
  const selectionMethod = (searchParams.get('method') as SelectionMethod) ?? 'range';

  /* ---- build URL helper ---- */
  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([k, v]) => {
        if (v === undefined || v === '') next.delete(k);
        else next.set(k, v);
      });
      return `${pathname}?${next.toString()}`;
    },
    [pathname, searchParams]
  );

  const calculatePartitionNo = useCallback((method: SelectionMethod, from: string, to: string, individual: string[]) => {
    if (method === 'range' && from && to) {
      const fromIdx = subPropertyList.findIndex((i) => i.fromProperty === from);
      const toIdx = subPropertyList.findIndex((i) => i.fromProperty === to);
      if (fromIdx === -1 || toIdx === -1) return '';
      const start = Math.min(fromIdx, toIdx);
      const end = Math.max(fromIdx, toIdx);
      const slice = subPropertyList.slice(start, end + 1);
      return slice.map((i) => i.fromProperty).join(',');
    } else if (method === 'individual' && individual.length > 0) {
      return individual.join(',');
    }
    return '';
  }, [subPropertyList]);

  /* ---- Options ---- */
  const BASE_PROPERTY_OPTIONS = useMemo<SearchSelectOption[]>(() => {
    return (basePropertyList || []).map((item) => ({
      label: `${item.wardNo || ''} / ${item.propertyNo || ''} / ${item.fromProperty || ''}`,
      value: String(item.id || ''),
      meta: { wardId: item.wardId, wardNo: item.wardNo, propertyNo: item.propertyNo },
    }));
  }, [basePropertyList]);

  const SUB_PROPERTY_OPTIONS = useMemo<SearchSelectOption[]>(() => {
    return (subPropertyList || []).map(toSelectOption);
  }, [subPropertyList]);

  /* ---- Handlers ---- */

  const handleBasePropertyChange = (_name: string, value: string) => {
    const selected = basePropertyList.find((item) => String(item.id) === value);
    if (!selected) return;
    setReviewData([]);
    setIsReviewing(false);
    router.push(
      buildUrl({
        basePropertyId: String(selected.id),
        wardId: String(selected.wardId),
        propertyNo: selected.propertyNo,
        from: undefined,
        to: undefined,
        individual: undefined,
      })
    );
  };

  const handleMethodChange = (method: SelectionMethod) => {
    setReviewData([]);
    setIsReviewing(false);
    router.push(buildUrl({ method, from: undefined, to: undefined, individual: undefined }));
  };

  /** Range: from */
  const handleRangeFromChange = (_name: string, value: string) => {
    setRangeFrom(value);
    const pNo = calculatePartitionNo('range', value, rangeTo, []);
    router.replace(buildUrl({ from: value, partitionNo: pNo }), { scroll: false });
  };

  /** Range: to */
  const handleRangeToChange = (_name: string, value: string) => {
    setRangeTo(value);
    const pNo = calculatePartitionNo('range', rangeFrom, value, []);
    router.replace(buildUrl({ to: value, partitionNo: pNo }), { scroll: false });
  };

  /** Individual multi-select */
  const handleIndividualChange = (values: string[]) => {
    setSelectedProperties(values);
    const pNo = calculatePartitionNo('individual', '', '', values);
    router.replace(buildUrl({ individual: values.join(','), partitionNo: pNo }), { scroll: false });
  };

  /** Clear all selections */
  const handleClear = () => {
    setReviewData([]);
    setIsReviewing(false);
    router.push(
      buildUrl({
        basePropertyId: undefined,
        wardId: undefined,
        propertyNo: undefined,
        from: undefined,
        to: undefined,
        individual: undefined,
        rangeFromPartition: undefined,
        rangeToPartition: undefined,
      })
    );
  };

  /** Proceed — call fetchPropertyCombineDetailsAction with selected partitions */
  const handleProceed = () => {
    if (!selectedWardId || !selectedPropertyNo) {
      toast.error('Base property selection incomplete');
      return;
    }
    const partitionNo = searchParams.get('partitionNo') || '';
    if (!partitionNo) {
      toast.error('Please select at least one property to combine');
      return;
    }

    startTransition(async () => {
      setIsReviewing(true);
      try {
        const data = await fetchPropertyCombineDetailsAction({
          wardId: Number(selectedWardId),
          propertyNo: selectedPropertyNo,
          partitionNo,
        });
        setReviewData(data);
      } catch (error) {
        console.error("Error fetching combine details:", error);
        setReviewData([]);
      }
    });
  };

  /** Final Submit: Combine Properties */
  const handleCombine = async () => {
    if (!selectedBasePropertyId || reviewData.length === 0) return;

    if (hasDifferentOwners) {
      toast.warning('Cannot combine properties with different owner names');
      return;
    }

    setIsSubmitting(true);

    try {
      const combinePropertyIds = reviewData.map((r) => r.propertyId).join(',');

      const response = await createCombinePropertyAction({
        mainPropertyId: Number(selectedBasePropertyId),
        combinePropertyIds,
        remark: 'Combined from UI',
        createdBy: 1, // Replace with actual user ID when available
      });

      if (response.success) {
        toast.success('Properties combined successfully!');
        // Optionally clear after short delay
        setTimeout(() => {
          handleClear();
          router.refresh();
        }, 2000);
      } else {
        toast.error(response.message || 'Combination failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- derived ---- */
  const selectedCount =
    selectionMethod === 'individual'
      ? selectedProperties.length
      : rangeFrom && rangeTo
        ? 2
        : 0;

  const canProceed =
    !!selectedBasePropertyId &&
    (selectionMethod === 'range'
      ? !!(rangeFrom && rangeTo)
      : selectedProperties.length > 0);

  const selectedBase = basePropertyList.find((item) => String(item.id) === selectedBasePropertyId);
  const displayWardNo = selectedBase?.wardNo ?? selectedWardId ?? '';

  /* ---- Owner warning ---- */
  const uniqueOwners = [...new Set(reviewData.map((r) => r.ownerName).filter(Boolean))];
  const hasDifferentOwners = uniqueOwners.length > 1;
  const differentOwnerProps = reviewData
    .filter((r, i) => i > 0 && r.ownerName !== reviewData[0]?.ownerName)
    .map((r) => `Ward No.: ${r.wardNo} Property No.: ${r.propertyNo}`)
    .join(', ');

  /* ============================================================
     DRAWER HEADER
  ============================================================ */
  const DrawerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0 shadow-sm">
        <Merge className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h2 id="drawer-title" className="text-sm font-bold text-gray-900 leading-tight">
            Combine Property
          </h2>
          {selectedPropertyNo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700">
              {selectedPropertyNo}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 leading-tight">
          Select properties to merge and review before combining
        </p>
      </div>
    </div>
  );

  /* ============================================================
     DRAWER FOOTER
  ============================================================ */
  const DrawerFooter = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {/* Status messages handled by toast */}
      </div>
      <div className="flex items-center gap-2">
        <CancelButton label="← Clear" onClick={handleClear} size="sm" />
        {isReviewing && reviewData.length > 0 && (
          <AddButton
            label={isSubmitting ? 'Combining...' : 'Combine'}
            size="sm"
            disabled={hasDifferentOwners || isSubmitting}
            onClick={handleCombine}
          />
        )}
      </div>
    </div>
  );

  /* ============================================================
     EMPTY STATE
  ============================================================ */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[380px] text-center gap-4 select-none">
      <div className="w-[72px] h-[72px] rounded-full bg-blue-50 flex items-center justify-center">
        <FileText className="w-9 h-9 text-blue-200" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-gray-700">No Properties Selected</p>
        <p className="text-sm text-gray-400 mt-1.5 max-w-[320px] leading-relaxed">
          Select a base property and choose properties to combine using Range or Individual
          selection method, then click &ldquo;Proceed&rdquo; to review.
        </p>
      </div>
    </div>
  );

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <Drawer
      open={true}
      onClose={() => router.back()}
      title={DrawerTitle}
      width="lg"
      footer={DrawerFooter}
    >
      {/* ===================================================
          FILTER BAR
      =================================================== */}
      <div className="flex items-end gap-2 px-3 py-2 bg-[#EFF4FF] border-b border-blue-100">

        {/* ---- Base Property ---- */}
        <div className="flex flex-col gap-0.5 w-[160px] shrink-0">
          <label className="text-[10px] font-semibold text-gray-600 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-600 text-white text-[8px] font-bold rounded-[3px]">B</span>
            Base Property <span className="text-red-500">*</span>
          </label>
          <SearchSelect
            id="baseProperty"
            name="baseProperty"
            options={BASE_PROPERTY_OPTIONS}
            value={selectedBasePropertyId ?? ''}
            onChange={handleBasePropertyChange}
            placeholder="Select"
            required
            className="text-[11px] h-[28px]"
          />
        </div>

   

        {/* ---- Divider ---- */}
        <div className="h-5 w-px bg-blue-200 self-center shrink-0" />

        {/* ---- Selection Method pill toggle ---- */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <label className="text-[10px] font-semibold text-gray-600">Selection Method</label>
          <div className="flex h-[28px] bg-white border border-blue-200 p-0.5 rounded-md gap-px">
            {(['range', 'individual'] as SelectionMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => handleMethodChange(method)}
                className={`px-2.5 text-[11px] font-semibold rounded h-full transition-all duration-150 capitalize ${
                  selectionMethod === method
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {method === 'range' ? 'Range' : 'Individual'}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Conditional: Range fields ---- */}
        {selectionMethod === 'range' && (
          <>
            <div className="flex flex-col gap-0.5 w-[120px] shrink-0">
              <label className="text-[10px] font-semibold text-gray-600">
                From <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                id="rangeFrom"
                name="rangeFrom"
                options={SUB_PROPERTY_OPTIONS}
                value={rangeFrom}
                onChange={handleRangeFromChange}
                placeholder="Select start"
                required
                className="text-[11px] h-[28px]"
              />
            </div>
            <div className="flex flex-col gap-0.5 w-[120px] shrink-0">
              <label className="text-[10px] font-semibold text-gray-600">
                To <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                id="rangeTo"
                name="rangeTo"
                options={SUB_PROPERTY_OPTIONS}
                value={rangeTo}
                onChange={handleRangeToChange}
                placeholder="Select end"
                required
                className="text-[11px] h-[28px]"
              />
            </div>
          </>
        )}

        {/* ---- Conditional: Individual multi-select ---- */}
        {selectionMethod === 'individual' && (
          <div className="flex flex-col gap-0.5 w-[200px] shrink-0">
            <label className="text-[10px] font-semibold text-gray-600">
              Select Properties <span className="text-red-500">*</span>
            </label>
            <MultiSelectDropdown
              options={SUB_PROPERTY_OPTIONS}
              value={selectedProperties}
              onChange={handleIndividualChange}
              placeholder="Select properties"
              className="text-[11px] text-gray-500"
            />
          </div>
        )}

        {/* ---- Action buttons ---- */}
        <div className="flex items-end gap-2 shrink-0 ml-auto">
          <CancelButton label="Clear" onClick={handleClear} size="sm" />
          <AddButton
            label={isPending ? 'Loading…' : `Proceed (${selectedCount})`}
            size="sm"
            disabled={!canProceed || isPending}
            onClick={handleProceed}
          />
        </div>
      </div>

      {/* ===================================================
          BODY
      =================================================== */}
      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Empty state */}
        {!isReviewing && !selectedBasePropertyId && <EmptyState />}

        {/* Review header + warning */}
        {isReviewing && reviewData.length > 0 && (
          <>
            {/* Review combination banner */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">Review Combination</p>
                <p className="text-[12px] text-blue-600 mt-0.5">
                  Primary Property:{' '}
                  <span className="font-bold">{selectedPropertyNo}</span> will be combined with{' '}
                  <span className="font-bold text-blue-700">{reviewData.length} properties</span>
                </p>
              </div>
            </div>

            {/* Owner mismatch warning */}
            {hasDifferentOwners && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border-l-4 border-red-400">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-red-700">Warning: Different Owner Names Detected</p>
                  {differentOwnerProps && (
                    <p className="text-[11px] text-red-600 mt-0.5">• {differentOwnerProps}</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Review table */}
        {isReviewing && (
          <MasterTable<PropertyRow>
            columns={columns}
            data={reviewData as PropertyRow[]}
            loading={isPending}
            paginationConfig={{ enabled: false }}
            height="md"
            getRowKey={(row, i) => `row-${row.propertyId || 0}-${i}`}
            emptyText="No property details found."
          />
        )}
      </div>
    </Drawer>
  );
}