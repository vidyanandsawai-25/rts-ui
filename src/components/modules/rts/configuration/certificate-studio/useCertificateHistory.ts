"use client";

import { useCallback, useRef, useState } from "react";
import type { CertificateDesignDocument } from "./schema";

function cloneDocument(document: CertificateDesignDocument): CertificateDesignDocument {
  return JSON.parse(JSON.stringify(document)) as CertificateDesignDocument;
}

export function useCertificateHistory(initialDocument: CertificateDesignDocument) {
  const history = useRef<CertificateDesignDocument[]>([cloneDocument(initialDocument)]);
  const index = useRef(0);
  const [document, setDocumentState] = useState(initialDocument);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const setDocument = useCallback((next: CertificateDesignDocument) => {
    const snapshot = cloneDocument(next);
    history.current = [...history.current.slice(0, index.current + 1), snapshot].slice(-50);
    index.current = history.current.length - 1;
    setDocumentState(snapshot);
    setCanUndo(index.current > 0);
    setCanRedo(false);
  }, []);

  const reset = useCallback((next: CertificateDesignDocument) => {
    const snapshot = cloneDocument(next);
    history.current = [snapshot];
    index.current = 0;
    setDocumentState(snapshot);
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (index.current <= 0) return;
    index.current -= 1;
    setDocumentState(cloneDocument(history.current[index.current]));
    setCanUndo(index.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (index.current >= history.current.length - 1) return;
    index.current += 1;
    setDocumentState(cloneDocument(history.current[index.current]));
    setCanUndo(true);
    setCanRedo(index.current < history.current.length - 1);
  }, []);

  return {
    document,
    setDocument,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
