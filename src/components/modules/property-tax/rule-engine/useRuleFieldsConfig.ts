import React from 'react';
import { FieldConfig } from '@/types/rule-engine.types';

interface UseRuleFieldsConfigProps {
  ruleScopeId: number;
  initialFields: FieldConfig[];
  onFetchFields: (scopeId: number) => Promise<FieldConfig[]>;
}

export function useRuleFieldsConfig({
  ruleScopeId,
  initialFields,
  onFetchFields,
}: UseRuleFieldsConfigProps) {
  const [fields, setFields] = React.useState<FieldConfig[]>(initialFields);

  const initialScopeIdRef = React.useRef(ruleScopeId);
  const isFirstMountRef = React.useRef(true);

  // Use a ref so the effect only re-runs when ruleScopeId changes,
  // not when the parent re-creates the onFetchFields callback reference.
  const fetchRef = React.useRef(onFetchFields);
  
  React.useLayoutEffect(() => {
    fetchRef.current = onFetchFields;
  });

  React.useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      // If the current ruleScopeId is the same as initial and we already have fields, we don't need to re-fetch!
      if (ruleScopeId === initialScopeIdRef.current && fields && fields.length > 0) {
        return;
      }
    }

    if (!ruleScopeId) return;

    let active = true;
    fetchRef.current(ruleScopeId).then((list) => {
      if (active) setFields(list);
    }).catch(() => {
      // Scope fetch failed — keep existing fields
    });
    return () => { active = false; };
  }, [ruleScopeId, fields.length]); // ✅ stable dep — ref handles function identity

  return { fields, setFields };
}
