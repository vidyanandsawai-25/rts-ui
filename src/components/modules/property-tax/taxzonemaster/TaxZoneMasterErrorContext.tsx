"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface TaxZoneMasterErrorContextValue {
  hasError: boolean;
  setHasError: (hasError: boolean) => void;
}

const TaxZoneMasterErrorContext = createContext<TaxZoneMasterErrorContextValue | null>(null);

interface TaxZoneMasterErrorProviderProps {
  children: ReactNode;
}

export function TaxZoneMasterErrorProvider({ children }: TaxZoneMasterErrorProviderProps) {
  const [hasError, setHasErrorState] = useState(false);

  const setHasError = useCallback((value: boolean) => {
    setHasErrorState(value);
  }, []);

  return (
    <TaxZoneMasterErrorContext.Provider value={{ hasError, setHasError }}>
      {children}
    </TaxZoneMasterErrorContext.Provider>
  );
}

export function useTaxZoneMasterError(): TaxZoneMasterErrorContextValue {
  const context = useContext(TaxZoneMasterErrorContext);
  if (!context) {
    throw new Error(
      "useTaxZoneMasterError must be used within a TaxZoneMasterErrorProvider"
    );
  }
  return context;
}
