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

  // Use a ref so the effect only re-runs when ruleScopeId changes,
  // not when the parent re-creates the onFetchFields callback reference.
  const fetchRef = React.useRef(onFetchFields);
  
  React.useLayoutEffect(() => {
    fetchRef.current = onFetchFields;
  });

  React.useEffect(() => {
    let active = true;
    fetchRef.current(ruleScopeId).then((list) => {
      if (active) setFields(list);
    }).catch(() => {
      // Scope fetch failed — keep existing fields
    });
    return () => { active = false; };
  }, [ruleScopeId]); // ✅ stable dep — ref handles function identity

  return { fields, setFields };
}
