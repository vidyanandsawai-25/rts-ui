import React from 'react';
import { Calculator, Loader2, RotateCw, Maximize2 } from 'lucide-react';
import { SearchSelect } from '@/components/common';
import { AnimatedDigitInput } from '@/components/common/AnimatedDigitInput';
import { OpenPlotCategoryItem } from '@/lib/utils/floorSubmission/openplot-category';

export interface PlotAreaSingleRowLayoutProps {
  length: string;
  setLength: React.Dispatch<React.SetStateAction<string>>;
  width: string;
  setWidth: React.Dispatch<React.SetStateAction<string>>;
  lengthInputRef: React.RefObject<HTMLInputElement | null>;
  totalSqM: string;
  totalSqFt: string;
  isLoading?: boolean;
  isButtonDisabled: boolean;
  buttonText?: string;
  selectedFloorType?: 'Construction' | 'OpenPlot';
  onChangeFloorType?: (type: 'Construction' | 'OpenPlot') => void;
  selectedOpenPlotCategory?: OpenPlotCategoryItem | null;
  onChangeOpenPlotCategory?: (category: OpenPlotCategoryItem | null) => void;
  categoryList: OpenPlotCategoryItem[];
  openPlotCategoryOptions: Array<{ label: string; value: string }>;
  handleApply: () => void;
  handleInputChange: (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => void;
  getTranslation: (key: string, fallback: string) => string;
  menuPlacement?: 'top' | 'bottom';
  handleOpenPlotCategoryFocus?: () => void;
  isCategoryLoading?: boolean;
  handleOpenDropdown?: (key: 'loadFloor' | 'loadSubFloor' | 'loadConstruction' | 'loadUsage' | 'loadSubType' | 'loadOpenPlotCategory') => void;
  isPlotCategory?: boolean;
}

export const PlotAreaSingleRowLayout: React.FC<PlotAreaSingleRowLayoutProps> = ({
  length,
  setLength,
  width,
  setWidth,
  lengthInputRef,
  totalSqM,
  totalSqFt,
  isLoading = false,
  isButtonDisabled,
  buttonText,
  selectedFloorType,
  onChangeFloorType,
  selectedOpenPlotCategory,
  onChangeOpenPlotCategory,
  categoryList,
  openPlotCategoryOptions,
  handleApply,
  handleInputChange,
  getTranslation,
  menuPlacement,
  handleOpenPlotCategoryFocus,
  isCategoryLoading = false,
  handleOpenDropdown,
  isPlotCategory = false,
}) => {
  const categoryCode = getTranslation('floor.openPlotCategory', 'Category');

  const onOpenPlotCategoryFocusHandler = React.useCallback(() => {
    if (handleOpenDropdown) {
      handleOpenDropdown('loadOpenPlotCategory');
    }
    if (handleOpenPlotCategoryFocus) {
      handleOpenPlotCategoryFocus();
    }
  }, [handleOpenDropdown, handleOpenPlotCategoryFocus]);

  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-3 flex flex-row items-center justify-between gap-2 shadow-sm w-full relative z-20">
      {/* Left side: Icon & Title info */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-200/50">
          {isLoading ? (
            <Loader2 className="h-4.5 w-4.5 stroke-[2] animate-spin" />
          ) : (
            <Calculator className="h-4.5 w-4.5 stroke-[2]" />
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 tracking-wide uppercase leading-tight whitespace-nowrap">
            {getTranslation('floor.totalPlotArea', 'Total Plot Area')}
          </h4>
        </div>
      </div>

      {/* Right side: Input controls strictly in ONE single row */}
      <div className="flex flex-row items-center gap-2 shrink-0 flex-nowrap">
        {/* L Input */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            {getTranslation('floor.lengthShort', 'L (ft)')}
          </span>
          <AnimatedDigitInput
            id="plot-length"
            ref={lengthInputRef}
            placeholder="0.00"
            value={length}
            maxLength={7}
            allowedPattern={/^[0-9.]$/}
            disabled={isLoading}
            onChange={(val) => handleInputChange(val, setLength)}
            className="w-14 h-8 text-center text-xs font-semibold"
          />
        </div>

        {/* Multiplier sign */}
        <span className="text-slate-400 font-semibold text-xs self-end mb-2">×</span>

        {/* W Input */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            {getTranslation('floor.widthShort', 'W (ft)')}
          </span>
          <AnimatedDigitInput
            id="plot-width"
            placeholder="0.00"
            value={width}
            maxLength={7}
            allowedPattern={/^[0-9.]$/}
            disabled={isLoading}
            onChange={(val) => handleInputChange(val, setWidth)}
            className="w-14 h-8 text-center text-xs font-semibold"
          />
        </div>

        {/* Vertical Divider 1 */}
        <div className="h-7 w-[1px] bg-slate-200 mx-0.5 shrink-0 self-end mb-0.5" />

        {/* Calculated Area Box */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            {getTranslation('floor.area', 'Area')}
          </span>
          <div className="flex items-center gap-1 bg-[#f0f7ff] border border-blue-100 rounded-lg px-2 h-8 text-[11px] font-semibold shrink-0 whitespace-nowrap">
            <div className="p-0.5 text-blue-600 bg-white border border-blue-200 rounded">
              <Maximize2 className="h-3 w-3 stroke-[2.5]" />
            </div>
            <span className="text-emerald-600 font-bold">{totalSqM} {getTranslation('floor.sqM', 'm²')}</span>
            <span className="text-slate-300 font-light mx-1">/</span>
            <span className="text-blue-600 font-bold">{totalSqFt} {getTranslation('floor.sqFt', 'Sq Ft')}</span>
          </div>
        </div>

        {/* Vertical Divider 2 */}
        {selectedFloorType === 'OpenPlot' && (
          <div className="h-7 w-[1px] bg-slate-200 mx-0.5 shrink-0 self-end mb-0.5" />
        )}

        {/* Open Plot Category Dropdown */}
        <div className="flex flex-col gap-1" onFocusCapture={onOpenPlotCategoryFocusHandler}>
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            {categoryCode}
          </span>
          <SearchSelect
            id="open-plot-category-select"
            name="openPlotCategory"
            menuPlacement={menuPlacement}
            onInputFocus={onOpenPlotCategoryFocusHandler}
            isLoading={isCategoryLoading}
            options={[
              { label: getTranslation('floor.selectCategory', '- Select Category -'), value: '' },
              ...openPlotCategoryOptions,
            ]}
            value={selectedOpenPlotCategory ? String(selectedOpenPlotCategory.id || selectedOpenPlotCategory.typeOfUseId || '') : ''}
            onChange={(_name, val) => {
              const selected = categoryList.find(
                (c, idx) => String(c.id || c.typeOfUseId || `cat-${idx}`) === String(val)
              );
              if (selected) {
                onChangeOpenPlotCategory?.({
                  id: Number(selected.id || selected.typeOfUseId),
                  typeOfUseId: Number(selected.id || selected.typeOfUseId),
                  typeOfUseCode: String(selected.typeOfUseCode),
                  description: String(selected.description),
                  type: String(selected.type),
                  typeOfUseGroupId: Number(selected.typeOfUseGroupId),
                  typeOfUseCategoryId: Number(selected.typeOfUseCategoryId),
                  isActive: true,
                });
              } else {
                onChangeOpenPlotCategory?.(null);
              }
            }}
            className="h-8 text-xs font-bold text-slate-700 w-[150px]"
          />
        </div>

        {/* Vertical Divider 3 */}
        {selectedFloorType !== undefined && onChangeFloorType && (
          <div className="h-7 w-[1px] bg-slate-200 mx-0.5 shrink-0 self-end mb-0.5" />
        )}

        {/* Update Area Button */}
        <button
          type="button"
          onClick={handleApply}
          disabled={isButtonDisabled}
          className="h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shrink-0 active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap self-end"
        >
          <RotateCw className={isLoading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
          {buttonText || getTranslation('floor.applyArea', 'Update Area')}
        </button>

        {/* Used Plot Area Dropdown */}
        {selectedFloorType !== undefined && onChangeFloorType && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
              {getTranslation('floor.usedPlotArea', 'Used Plot Area')}
            </span>
            <SearchSelect
              id="separately-used-plot-area-select"
              name="separatelyUsedPlotArea"
              menuPlacement={menuPlacement}
              options={[
                { label: getTranslation('floor.construction', 'Construction'), value: 'Construction' },
                { label: getTranslation('floor.openPlot', 'Open Space'), value: 'OpenPlot' },
              ].filter(opt => !isPlotCategory || opt.value !== 'Construction')}
              value={selectedFloorType}
              onChange={(_name, val) => onChangeFloorType(val as 'Construction' | 'OpenPlot')}
              className="h-8 text-xs font-bold text-slate-700 w-[115px]"
              onKeyDown={(e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  const taxableInput = document.getElementById('floor-is-taxable');
                  if (taxableInput) {
                    taxableInput.focus();
                  }
                }
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
};
