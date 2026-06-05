import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { IBackendRateMaster } from "@/types/RVRateMaster";

interface UseRateMasterFiltersProps {
  mode: "add" | "edit" | "delete";
  backendRates?: IBackendRateMaster[];
  filterValues?: {
    zone?: string;
    useGroup?: string;
    year?: string;
  };
  useGroupOptions: Array<{ label: string; value: string }>;
  // Policy-configured rate frequency (from PolicyConfiguration table)
  rateFrequencyPolicy?: {
    value: 'Monthly' | 'Yearly';
    isConfigured: boolean;
  };
  // Policy-configured rate unit (from PolicyConfiguration table)
  rateUnitPolicy?: {
    value: 'SqMeter' | 'SqFeet';
    isConfigured: boolean;
  };
}

export function useRateMasterFilters({
  mode: _mode, // Kept for interface compatibility
  backendRates = [],
  filterValues,
  useGroupOptions,
  rateFrequencyPolicy,
  rateUnitPolicy,
}: UseRateMasterFiltersProps) {
  const router = useRouter();

  // Filter states - store both value and label
  const [selectedZone, setSelectedZone] = useState<string>(filterValues?.zone || "");
  const [selectedZoneLabel, setSelectedZoneLabel] = useState<string>("");
  const [selectedUseGroup, setSelectedUseGroup] = useState(filterValues?.useGroup || "");
  const [selectedUseGroupLabel, setSelectedUseGroupLabel] = useState<string>("");
  const [assessmentYear, setAssessmentYear] = useState(filterValues?.year || "");
  const [assessmentYearLabel, setAssessmentYearLabel] = useState<string>("");
  
  // Data states - backendRates are passed from server component
  const [fetchedBackendRates, setFetchedBackendRates] = useState<IBackendRateMaster[]>(backendRates || []);
  
  // Rate frequency state - use policy value if configured, else default to "Yearly"
  const [rateFrequency, setRateFrequency] = useState<"Monthly" | "Yearly">(
    rateFrequencyPolicy?.isConfigured ? rateFrequencyPolicy.value : "Yearly"
  );

  // Rate unit state - use policy value if configured, else default to "SqMeter"
  const [rateUnit, setRateUnit] = useState<"SqMeter" | "SqFeet">(
    rateUnitPolicy?.isConfigured ? rateUnitPolicy.value : "SqMeter"
  );

  // Multipliers state
  const [multipliers, setMultipliers] = useState<Record<string, number>>(() => 
    useGroupOptions.reduce((acc, option) => {
      acc[option.value] = 1.0;
      return acc;
    }, {} as Record<string, number>)
  );

  // Set rateFrequency from backendRates
  useEffect(() => {
    if (backendRates && Array.isArray(backendRates) && backendRates.length > 0) {
      const hasMonthly = backendRates.some(r => r.rateRemark === "MonthWise Rate");
      const hasYearWise = backendRates.some(r => r.rateRemark === "YearWise Rate");
      const newFrequency = (hasMonthly && !hasYearWise) ? "Monthly" : "Yearly";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional prop-to-state sync for rate frequency
      setRateFrequency(prev => prev === newFrequency ? prev : newFrequency);
    }
  }, [backendRates]);

  // Sync fetchedBackendRates with backendRates prop whenever it changes
  // Use JSON comparison to detect actual data changes (needed for filter changes in edit/delete mode)
  useEffect(() => {
    if (backendRates && Array.isArray(backendRates)) {
      const newRatesJson = JSON.stringify(backendRates);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional prop-to-state sync with deep comparison
      setFetchedBackendRates(prev => {
        const prevJson = JSON.stringify(prev);
        // Always update if the data actually changed
        if (prevJson !== newRatesJson) {
          return backendRates;
        }
        return prev;
      });
    }
  }, [backendRates]);

  // Handler for dropdown changes - uses URL navigation to trigger server re-render (SSR)
  const handleDropdownChange = useCallback((field: 'zone' | 'useGroup' | 'assessmentYear', value: string, label?: string) => {
    // Update local state for immediate UI feedback
    if (field === 'zone') {
      setSelectedZone(value);
      if (label) setSelectedZoneLabel(label);
    } else if (field === 'useGroup') {
      setSelectedUseGroup(value);
      if (label) setSelectedUseGroupLabel(label);
    } else if (field === 'assessmentYear') {
      setAssessmentYear(value);
      if (label) setAssessmentYearLabel(label);
    }
    
    // Use URL navigation to trigger server re-render (SSR pattern)
    // Server component will fetch fresh data based on new URL params
    const params = new URLSearchParams(window.location.search);
    
    if (field === 'zone') {
      params.set('zone', value);
    } else if (field === 'useGroup') {
      params.set('useGroup', value);
    } else if (field === 'assessmentYear') {
      params.set('assessmentYear', value);
      params.set('year', value);
    }
    
    const pathname = window.location.pathname;
    const newUrl = `${pathname}?${params.toString()}`;
    
    // Use router.push followed by router.refresh to force server re-fetch
    // This ensures the server component re-runs and fetches fresh data
    router.push(newUrl);
    router.refresh();
  }, [router]);

  return {
    // Filter states
    selectedZone,
    selectedZoneLabel,
    selectedUseGroup,
    selectedUseGroupLabel,
    assessmentYear,
    assessmentYearLabel,
    setSelectedZone,
    setSelectedUseGroup,
    setAssessmentYear,
    
    // Data states - passed from server component
    fetchedBackendRates,
    
    // Rate frequency
    rateFrequency,
    setRateFrequency,
    
    // Rate unit
    rateUnit,
    setRateUnit,
    
    // Multipliers
    multipliers,
    setMultipliers,
    
    // Handlers
    handleDropdownChange,
  };
}
