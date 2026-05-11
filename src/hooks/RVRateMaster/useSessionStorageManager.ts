import { useEffect } from "react";
import type { MatrixRow } from "./useMatrixState";

interface SessionStorageManagerProps {
  matrixStorageKey: string;
  matrixData: MatrixRow[];
}

/**
 * Hook to manage matrix data persistence in sessionStorage
 */
export function useSessionStorageManager({
  matrixStorageKey,
  matrixData,
}: SessionStorageManagerProps) {
  
  // Save matrix data to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && matrixData.length > 0) {
      sessionStorage.setItem(matrixStorageKey, JSON.stringify(matrixData));
    }
  }, [matrixData, matrixStorageKey]);

  // Clear sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(matrixStorageKey);
      }
    };
  }, [matrixStorageKey]);
}
