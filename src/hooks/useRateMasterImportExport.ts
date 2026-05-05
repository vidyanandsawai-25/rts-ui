import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getRateMasterByFilters } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import type { IBackendRateMaster, ISelectOption, IZoneDescription, RateCategory} from "@/types/RVRateMaster";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  taxZoneId?: number;
  [key: string]: number | string | undefined;
};

interface UseRateMasterImportExportProps {
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  allZones: IZoneDescription[];
  zoneDescriptions: IZoneDescription[];
  rateCategories: RateCategory[];
  zoneOptions: ISelectOption[];
  useGroupOptions: ISelectOption[];
  assessmentYears: ISelectOption[];
  assessmentYearRanges?: Array<{
    label: string;
    value: string;
    fromYear: string | number;
    toYear: string | number;
  }>;
  matrixData: MatrixRow[];
  setMatrixData: (data: MatrixRow[]) => void;
  allZoneEdits: Record<string, Record<string, number>>;
  setAllZoneEdits: (edits: Record<string, Record<string, number>>) => void;
  setShowMatrix: (show: boolean) => void;
  showMatrix: boolean;
  showCopyRateSection?: boolean;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  multipliers: Record<string, number>;
  setMultipliers: (multipliers: Record<string, number>) => void;
}

export function useRateMasterImportExport({
  selectedZone,
  selectedUseGroup,
  assessmentYear,
  allZones,
  zoneDescriptions,
  rateCategories,
  zoneOptions,
  useGroupOptions,
  assessmentYears,
  assessmentYearRanges,
  matrixData,
  setMatrixData,
  allZoneEdits,
  setAllZoneEdits,
  setShowMatrix,
  showMatrix,
  showCopyRateSection,
  t,
  multipliers,
  // setMultipliers, // unused
}: UseRateMasterImportExportProps) {
  // State for Copy Rates from Another Use Group
  const [sourceUseGroup, setSourceUseGroup] = useState("");
  
  // State for Copy Rates from Another Rate Section
  const [sourceRateSection, setSourceRateSection] = useState("");
  const sourceRateSectionOptions = zoneOptions.filter(
    (opt) => !selectedZone || opt.value !== selectedZone
  );
  
  // State to toggle copy sections visibility
  const [copySectionsExpanded, setCopySectionsExpanded] = useState(showCopyRateSection ?? false);
  
  // State for active tab in copy rates section
  const [copyRatesActiveTab, setCopyRatesActiveTab] = useState<"useGroup" | "rateSection">("useGroup");

  // State for multipliers
  const [showMultipliersInline, setShowMultipliersInline] = useState(false);
  const [tempMultipliers, setTempMultipliers] = useState<Record<string, number>>(() => 
    useGroupOptions.reduce((acc, option) => {
      acc[option.value] = 1.0;
      return acc;
    }, {} as Record<string, number>)
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read URL params and open sections after hydration
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const showCopyRates = params.get('showCopyRates');
      const showMultipliers = params.get('showMultipliers');
      
      if (showCopyRates === 'true') {
        setCopySectionsExpanded(true);
      }
      if (showMultipliers === 'true') {
        setShowMultipliersInline(true);
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Initialize tempMultipliers when multipliers section opens
  useEffect(() => {
    if (showMultipliersInline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional state initialization from prop
      setTempMultipliers({ ...multipliers });
    }
  }, [showMultipliersInline, multipliers]);

  // Handler for copying rates from another rate section
  const handleCopyRatesFromRateSection = async () => {
    if (!selectedZone) {
      toast.error(t('messages.selectRateSection'));
      return;
    }
    if (!sourceRateSection) {
      toast.error(t('messages.validationSelectRateSectionToCopy'));
      return;
    }
    if (!selectedUseGroup) {
      toast.error(t('messages.selectUseGroup'));
      return;
    }
    if (!assessmentYear) {
      toast.error(t('messages.validationSelectAssessmentYear'));
      return;
    }
    
    try {
      const fetchedRates = await getRateMasterByFilters(
        sourceRateSection,
        selectedUseGroup,
        String(assessmentYear),         
      );
      
      if (!fetchedRates || fetchedRates.length === 0) {
        const sourceRateSectionLabel = zoneOptions.find(
          (opt) => opt.value === sourceRateSection
        )?.label || sourceRateSection;
        const useGroupLabel = useGroupOptions.find(
          (opt) => opt.value === selectedUseGroup
        )?.label || selectedUseGroup;
        const yearRangeLabel = assessmentYearRanges?.find(
          (ay) => String(ay.value) === String(assessmentYear)
        )?.label || assessmentYears?.find(
          (ay) => String(ay.value) === String(assessmentYear)
        )?.label || assessmentYear;
        toast.error(t('messages.validationNoRatesAvailable', { source: sourceRateSectionLabel, group: useGroupLabel, year: yearRangeLabel }));
        return;
      }

      // Group fetched rates by zone
      const ratesByZone = new Map<string, Map<string, number>>();
      fetchedRates.forEach((rate: IBackendRateMaster) => {
        // Read both camelCase and PascalCase fields for robustness
        const zoneId = rate.taxZoneId ?? rate.TaxZoneId;
        const constructionTypeId = rate.constructionTypeId ?? rate.ConstructionTypeId;

        if (!zoneId || !constructionTypeId) {
          return;
        }

        const zoneKey = String(zoneId);
        const constructionKey = String(constructionTypeId);

        if (!ratesByZone.has(zoneKey)) {
          ratesByZone.set(zoneKey, new Map());
        }
        const zoneRates = ratesByZone.get(zoneKey)!;
        const rateSqM = rate.rateSquareMeter ?? rate.RateSquareMeter;
        if (rateSqM !== undefined) {
          zoneRates.set(constructionKey, rateSqM);
        }
      });
      
      if (ratesByZone.size === 0) {
        const sourceRateSectionLabel = zoneOptions.find(
          (opt) => opt.value === sourceRateSection
        )?.label || sourceRateSection;
        const useGroupLabel = useGroupOptions.find(
          (opt) => opt.value === selectedUseGroup
        )?.label || selectedUseGroup;
        const yearRangeLabel = assessmentYearRanges?.find(
          (ay) => String(ay.value) === String(assessmentYear)
        )?.label || assessmentYears?.find(
          (ay) => String(ay.value) === String(assessmentYear)
        )?.label || assessmentYear;
        toast.error(t('messages.validationNoRatesAvailable', { source: sourceRateSectionLabel, group: useGroupLabel, year: yearRangeLabel }));
        return;
      }

      // Map taxZoneId to zoneNo
      const taxZoneIdToZoneNo = new Map<string, string>();
      zoneDescriptions.forEach(zd => {
        if (zd.taxZoneId && zd.zoneNo) {
          taxZoneIdToZoneNo.set(String(zd.taxZoneId), zd.zoneNo);
        }
      });
      
      // Update allZoneEdits for ALL zones
      const newEdits: Record<string, Record<string, number>> = { ...allZoneEdits };
      
      allZones.forEach((zone) => {
        const zoneNo = zone.zoneNo;
        
        let zoneRates = null;
        for (const [taxZoneIdKey, constructionRates] of ratesByZone.entries()) {
          if (taxZoneIdKey === String(zone.taxZoneId)) {
            zoneRates = constructionRates;
            break;
          }
        }
        
        if (zoneRates) {
          const zoneEdits: Record<string, number> = {};
          rateCategories.forEach((cat) => {
            const rateValue = zoneRates.get(cat.constructionId);
            if (rateValue !== undefined && rateValue > 0) {
              const key = cat.constructionCode || cat.constructionId;
              zoneEdits[key] = rateValue;
            }
          });
          if (Object.keys(zoneEdits).length > 0) {
            newEdits[zoneNo] = zoneEdits;
          }
        }
      });
      setAllZoneEdits(newEdits);
      
      // Update current page's matrixData
      const updatedMatrix = matrixData.map((row) => {
        const updatedRow = { ...row };
        
        let zoneRates = null;
        for (const [taxZoneIdKey, constructionRates] of ratesByZone.entries()) {
          const mappedZoneNo = taxZoneIdToZoneNo.get(taxZoneIdKey);
          if (mappedZoneNo === row.zoneNo) {
            zoneRates = constructionRates;
            break;
          }
        }
        
        if (zoneRates) {
          rateCategories.forEach((cat) => {
            const rateValue = zoneRates.get(cat.constructionId);
            if (rateValue !== undefined) {
              const key = cat.constructionCode || cat.constructionId;
              updatedRow[key] = rateValue;
            }
          });
        }
        
        return updatedRow;
      });
      setMatrixData(updatedMatrix);
      setShowMatrix(true);

      const sourceRateSectionLabel = zoneOptions.find(
        (opt) => opt.value === sourceRateSection
      )?.label || sourceRateSection;
      const useGroupLabel = useGroupOptions.find(
        (opt) => opt.value === selectedUseGroup
      )?.label || selectedUseGroup;
      const yearRangeLabel = assessmentYearRanges?.find(
        (ay) => String(ay.value) === String(assessmentYear)
      )?.label || assessmentYears?.find(
        (ay) => String(ay.value) === String(assessmentYear)
      )?.label || assessmentYear;
      toast.success(t('messages.ratesCopiedSuccess', { source: sourceRateSectionLabel, group: useGroupLabel, year: yearRangeLabel }));
    } catch (error) {
      console.error("Error copying rates from rate section:", error);
      toast.error(t('messages.validationCopyFailed'));
    }
  };

  // Handle copy rates from another use group
  const handleCopyRates = async () => {
    if (!sourceUseGroup) {
      toast.error(t('messages.selectUseGroupCopy'));
      return;
    }

    if (!selectedZone) {
      toast.error(t('messages.selectRateSection'));
      return;
    }

    if (!selectedUseGroup) {
      toast.error(t('messages.selectUseGroup'));
      return;
    }

    const yearRangeToUse = assessmentYear;
    if (!yearRangeToUse) {
      toast.error(t('messages.selectAssessmentYearRangeFull'));
      return;
    }

    try {
      const fetchedRates = await getRateMasterByFilters(
        selectedZone,
        sourceUseGroup,
        assessmentYear
      );
      
      if (!fetchedRates || fetchedRates.length === 0) {
        const sourceUseGroupLabel = useGroupOptions.find(opt => opt.value === sourceUseGroup)?.label || sourceUseGroup;
        const zoneLabel = zoneOptions.find(opt => opt.value === selectedZone)?.label || selectedZone;
        const yearRangeLabel = assessmentYearRanges?.find(ay => String(ay.value) === String(yearRangeToUse))?.label || 
                          assessmentYears?.find(ay => String(ay.value) === String(yearRangeToUse))?.label || yearRangeToUse;
        
        toast.error(t('messages.validationNoRatesAvailable', { source: sourceUseGroupLabel, group: zoneLabel, year: yearRangeLabel }));
        return;
      }

      // Group fetched rates by zone
      const ratesByZone = new Map<string, Map<string, number>>();
      fetchedRates.forEach((rate: IBackendRateMaster) => {
        const zoneId = rate.taxZoneId ?? (rate as { TaxZoneId?: number }).TaxZoneId;
        const constructionTypeId = rate.constructionTypeId ?? (rate as { ConstructionTypeId?: number }).ConstructionTypeId;
        const rateSqm = rate.rateSquareMeter ?? (rate as { RateSquareMeter?: number }).RateSquareMeter;
        
        if (zoneId === undefined || constructionTypeId === undefined) return;
        
        const zoneKey = String(zoneId);
        const constructionKey = String(constructionTypeId);
        
        if (!ratesByZone.has(zoneKey)) {
          ratesByZone.set(zoneKey, new Map());
        }
        if (rateSqm !== undefined) {
          ratesByZone.get(zoneKey)!.set(constructionKey, rateSqm);
        }
      });

      if (ratesByZone.size === 0) {
        toast.error(t('messages.validationNoRatesAvailable', { source: sourceUseGroup, group: selectedZone, year: yearRangeToUse }));
        return;
      }

      // Map taxZoneId to zoneNo
      const taxZoneIdToZoneNo = new Map<string, string>();
      zoneDescriptions.forEach(zd => {
        if (zd.taxZoneId && zd.zoneNo) {
          taxZoneIdToZoneNo.set(String(zd.taxZoneId), zd.zoneNo);
        }
      });
      
      // Update allZoneEdits for persistent state
      const newEdits: Record<string, Record<string, number>> = { ...allZoneEdits };
      
      allZones.forEach((zone) => {
        const zoneIdKey = String(zone.taxZoneId);
        const zoneRates = ratesByZone.get(zoneIdKey);
        
        if (zoneRates) {
          const zoneEdits: Record<string, number> = {};
          rateCategories.forEach((cat) => {
            const catId = String(cat.constructionId);
            const rateValue = zoneRates.get(catId);
            if (rateValue !== undefined && rateValue > 0) {
              const key = cat.constructionCode || cat.constructionId;
              zoneEdits[key] = rateValue;
            }
          });
          if (Object.keys(zoneEdits).length > 0) {
            newEdits[zone.zoneNo] = zoneEdits;
          }
        }
      });
      
      setAllZoneEdits(newEdits);
      
      // Update current page's matrixData
      const updatedMatrix = matrixData.map((row) => {
        const updatedRow = { ...row };
        
        const zd = zoneDescriptions.find(z => z.zoneNo === row.zoneNo);
        if (zd) {
          const zoneRates = ratesByZone.get(String(zd.taxZoneId));
          if (zoneRates) {
            rateCategories.forEach((cat) => {
              const catId = String(cat.constructionId);
              const rateValue = zoneRates.get(catId);
              if (rateValue !== undefined) {
                const key = cat.constructionCode || cat.constructionId;
                updatedRow[key] = rateValue;
              }
            });
          }
        }
        return updatedRow;
      });

      setMatrixData(updatedMatrix);
      setShowMatrix(true);
      
      const sourceUseGroupLabel = useGroupOptions.find(opt => opt.value === sourceUseGroup)?.label || sourceUseGroup;
      const zoneLabel = zoneOptions.find(opt => opt.value === selectedZone)?.label || selectedZone;
      toast.success(t('messages.ratesCopiedSuccess', { source: sourceUseGroupLabel, group: zoneLabel, year: yearRangeToUse }));
    } catch (error) {
      console.error("Error copying rates:", error);
      toast.error(t('messages.validationCopyFailed'));
    }
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    if (!assessmentYear) {
      toast.error(t('messages.selectAssessmentYearRange'));
      return;
    }
    
    if (!selectedZone) {
      toast.error(t('messages.selectRateSection'));
      return;
    }
    
    if (!selectedUseGroup) {
      toast.error(t('messages.selectUseGroup'));
      return;
    }
    
    try {
      const headers = ['Tax Zone No', ...rateCategories.map(cat => `${cat.constructionCode || cat.constructionId} (Rs./Sq.mtr)`)];
      if (!allZones || !Array.isArray(allZones)) {
        toast.error('Zones data not available for template.');
        return;
      }
      const rows = allZones.map(zone => [
        zone.zoneNo,
        ...rateCategories.map(() => '0')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rate-master-template-${selectedZone}-${selectedUseGroup}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  // Handle Excel Upload
  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only allow CSV files by MIME type or extension
    const validTypes = ['text/csv'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      toast.error(t('messages.csvOnly'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('File is empty or invalid');
          return;
        }

        const dataLines = lines.slice(1);
        const excelDataByZone = new Map<string, Record<string, number>>();
        let importedRateCount = 0;
        
        dataLines.forEach((line) => {
          const values = line.split(',').map(v => v.trim());
          // The first column is expected to be Tax Zone No
          const taxZoneNo = values[0];
          const zone = allZones.find(z => String(z.zoneNo) === taxZoneNo);
          if (!zone) return; // skip if zone not found
          const zoneEdits: Record<string, number> = {};

          rateCategories.forEach((cat, catIndex) => {
            const valueIndex = 1 + catIndex;
            if (valueIndex < values.length) {
              const parsedValue = parseFloat(values[valueIndex]);
              const finalValue = isNaN(parsedValue) ? 0 : parsedValue;
              if (finalValue > 0) {
                importedRateCount++;
                const key = cat.constructionCode || cat.constructionId;
                zoneEdits[key] = finalValue;
              }
            }
          });

          if (Object.keys(zoneEdits).length > 0) {
            excelDataByZone.set(zone.zoneNo, zoneEdits);
          }
        });
        
        // Update allZoneEdits with all imported data
        const newEdits: Record<string, Record<string, number>> = { ...allZoneEdits };
        excelDataByZone.forEach((zoneEdits, zoneNo) => {
          newEdits[zoneNo] = zoneEdits;
        });
        setAllZoneEdits(newEdits);

        // Update current page's matrix data
        const updatedMatrix = matrixData.map((row) => {
          const zoneNo = row.zoneNo as string;
          const zoneEdits = excelDataByZone.get(zoneNo) || {};
          if (Object.keys(zoneEdits).length > 0) {
            return { ...row, ...zoneEdits };
          }
          return row;
        });

        setMatrixData(updatedMatrix);
        toast.success(t('messages.importedRecordsSuccess', { count: importedRateCount }));
        
        if (!showMatrix) {
          setShowMatrix(true);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error(t('messages.validationParseFailed'));
      }
    };

    reader.onerror = () => {
      toast.error(t('messages.validationReadFileFailed'));
    };

    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    // Copy rates state
    sourceUseGroup,
    setSourceUseGroup,
    sourceRateSection,
    setSourceRateSection,
    sourceRateSectionOptions,
    copySectionsExpanded,
    setCopySectionsExpanded,
    copyRatesActiveTab,
    setCopyRatesActiveTab,
    // Multipliers state
    showMultipliersInline,
    setShowMultipliersInline,
    tempMultipliers,
    setTempMultipliers,
    // File input ref
    fileInputRef,
    // Handlers
    handleCopyRates,
    handleCopyRatesFromRateSection,
    handleDownloadTemplate,
    handleUploadExcel,
  };
}
