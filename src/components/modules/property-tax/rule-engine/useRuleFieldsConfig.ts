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
  // Track fields length via ref so we can read it in the effect without
  // adding `fields` as a reactive dependency (avoids exhaustive-deps warning).
  const fieldsLengthRef = React.useRef(initialFields.length);

  // Use a ref so the effect only re-runs when ruleScopeId changes,
  // not when the parent re-creates the onFetchFields callback reference.
  const fetchRef = React.useRef(onFetchFields);

  React.useLayoutEffect(() => {
    fetchRef.current = onFetchFields;
    // Keep fieldsLengthRef in sync after every render (outside of render, so no lint issue).
    fieldsLengthRef.current = fields.length;
  });

  React.useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      // If the current ruleScopeId is the same as initial and we already have
      // fields, skip the fetch — server already provided them.
      if (ruleScopeId === initialScopeIdRef.current && fieldsLengthRef.current > 0) {
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
  }, [ruleScopeId]); // ✅ stable dep — refs handle function identity and fields length

  return { fields, setFields };
}
