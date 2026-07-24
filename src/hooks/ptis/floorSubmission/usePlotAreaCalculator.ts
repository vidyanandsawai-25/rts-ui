/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { convertSqMToSqFt } from '@/lib/utils/RoomSubmission/conversions';
import {
  OpenPlotCategoryItem,
  filterOpenPlotCategories,
} from '@/lib/utils/floorSubmission/openplot-category';
import { getOpenPlotCategoryDataAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

export interface UsePlotAreaCalculatorParams {
  t: (key: string) => string;
  onApply?: (sqFt: string, sqM: string, len?: string, wid?: string) => void;
  onLoad?: (sqFt: string, sqM: string, len?: string, wid?: string) => void;
  initialPlotArea?: {
    length?: number | string | null;
    width?: number | string | null;
    totalPlotArea?: number | string | null;
  } | null;
  onChange?: (sqFt: string, sqM: string, len?: string, wid?: string) => void;
  isLoading?: boolean;
  selectedFloorType?: 'Construction' | 'OpenPlot';
  openPlotCategories?: OpenPlotCategoryItem[];
  selectedOpenPlotCategory?: OpenPlotCategoryItem | null;
}

export function usePlotAreaCalculator({
  t,
  onApply,
  onLoad,
  initialPlotArea,
  onChange,
  isLoading = false,
  selectedFloorType,
  openPlotCategories,
  selectedOpenPlotCategory,
}: UsePlotAreaCalculatorParams) {
  const [length, setLength] = React.useState<string>(() => {
    if (initialPlotArea?.length !== null && initialPlotArea?.length !== undefined) {
      return String(initialPlotArea.length);
    }
    return '';
  });

  const [width, setWidth] = React.useState<string>(() => {
    if (initialPlotArea?.width !== null && initialPlotArea?.width !== undefined) {
      return String(initialPlotArea.width);
    }
    return '';
  });

  const lengthInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const handleFocus = () => {
      if (lengthInputRef.current) {
        lengthInputRef.current.focus();
      }
    };
    handleFocus();
    window.addEventListener('floorSaved', handleFocus);
    return () => {
      window.removeEventListener('floorSaved', handleFocus);
    };
  }, []);

  const onLoadRef = React.useRef(onLoad);
  React.useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    if (initialPlotArea) {
      const lenVal = initialPlotArea.length;
      const widVal = initialPlotArea.width;
      const totalVal = initialPlotArea.totalPlotArea;

      const len = lenVal !== null && lenVal !== undefined ? String(lenVal) : '0';
      const wid = widVal !== null && widVal !== undefined ? String(widVal) : '0';
      const totalArea = totalVal !== null && totalVal !== undefined ? Number(totalVal) : 0;

      setLength(len);
      setWidth(wid);

      const sqFt = convertSqMToSqFt(totalArea);

      if (onLoadRef.current) {
        onLoadRef.current(
          sqFt > 0 ? sqFt.toFixed(2) : '0.00',
          totalArea > 0 ? totalArea.toFixed(2) : '0.00',
          len,
          wid
        );
      }
    }
  }, [initialPlotArea]);

  const { totalSqFt, totalSqM, numericSqM } = React.useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const sqM = l * w;
    const sqFt = convertSqMToSqFt(sqM);

    return {
      totalSqFt: sqFt > 0 ? sqFt.toFixed(2) : '0.00',
      totalSqM: sqM > 0 ? sqM.toFixed(2) : '0.00',
      numericSqM: sqM,
    };
  }, [length, width]);

  React.useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current(totalSqFt, totalSqM, length, width);
    }
  }, [totalSqFt, totalSqM, length, width]);

  const [categories, setCategories] = React.useState<OpenPlotCategoryItem[]>(
    () => openPlotCategories || []
  );
  const [isCategoryLoading, setIsCategoryLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (openPlotCategories && openPlotCategories.length > 0) {
      setCategories(openPlotCategories);
    }
  }, [openPlotCategories]);

  const handleOpenPlotCategoryFocus = React.useCallback(async () => {
    if (isCategoryLoading) return;
    setIsCategoryLoading(true);
    try {
      const data = await getOpenPlotCategoryDataAction();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = filterOpenPlotCategories(data);
        if (mapped.length > 0) {
          setCategories(mapped);
        }
      }
    } catch (_err) {
      // ignore
    } finally {
      setIsCategoryLoading(false);
    }
  }, [isCategoryLoading]);

  const categoryList = React.useMemo(
    () => (categories?.length ? categories : (openPlotCategories?.length ? openPlotCategories : [])),
    [categories, openPlotCategories]
  );

  const openPlotCategoryOptions = React.useMemo(() => {
    return categoryList.map((item, idx) => ({
      label: `${item.typeOfUseCode} - ${item.description}`,
      value: String(item.id || item.typeOfUseId || `cat-${idx}`),
    }));
  }, [categoryList]);

  const handleApply = React.useCallback(() => {
    if (selectedFloorType === 'OpenPlot' && !selectedOpenPlotCategory?.id) {
      return;
    }
    if (onApply && numericSqM > 0) {
      onApply(totalSqFt, totalSqM, length, width);
      if (lengthInputRef.current) {
        lengthInputRef.current.focus();
      }
    }
  }, [onApply, numericSqM, totalSqFt, totalSqM, length, width, selectedFloorType, selectedOpenPlotCategory]);

  const isButtonDisabled =
    !length ||
    !width ||
    parseFloat(length) <= 0 ||
    parseFloat(width) <= 0 ||
    isLoading ||
    (selectedFloorType === 'OpenPlot' && !selectedOpenPlotCategory?.id);

  const handleInputChange = React.useCallback(
    (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
      const cleaned = val.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');

      let beforeDecimal = parts[0] || '';
      if (beforeDecimal.length > 4) {
        beforeDecimal = beforeDecimal.slice(0, 4);
      }

      if (parts.length > 1) {
        const afterDecimal = parts.slice(1).join('').slice(0, 2);
        setter(`${beforeDecimal}.${afterDecimal}`);
      } else {
        setter(beforeDecimal);
      }
    },
    []
  );

  const getTranslation = React.useCallback(
    (key: string, fallback: string) => {
      if (!t) return fallback;
      try {
        if (typeof (t as any).has === 'function' && !(t as any).has(key)) {
          return fallback;
        }
        const res = t(key);
        if (!res || typeof res !== 'string' || res.startsWith('quickDataEntry.') || res === key) {
          return fallback;
        }
        return res;
      } catch {
        return fallback;
      }
    },
    [t]
  );

  return {
    length,
    setLength,
    width,
    setWidth,
    lengthInputRef,
    totalSqFt,
    totalSqM,
    categoryList,
    openPlotCategoryOptions,
    handleApply,
    isButtonDisabled,
    handleInputChange,
    getTranslation,
    isLoading,
    handleOpenPlotCategoryFocus,
    isCategoryLoading,
  };
}
