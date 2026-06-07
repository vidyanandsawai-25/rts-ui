import { notFound } from 'next/navigation';
import RuleBuilder from '@/components/modules/property-tax/rule-engine/RuleBuilder';
import { getRuleById } from '@/lib/api/rule-engine/rule.service';
import {
  fetchScopesAction,
  fetchFieldsForScopeAction,
  saveRuleAction,
  fetchCorporationsAction,
  fetchEffectTypesAction,
  fetchEffectTypeConfigsAction,
  fetchRateSectionsAction,
  fetchRuleCategoriesAction,
} from '../actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

interface ConditionGroup {
  conditions?: { fieldId: string }[];
  groups?: ConditionGroup[];
}

function findFirstFieldId(g: ConditionGroup): string {
  if (g.conditions && g.conditions.length > 0) return g.conditions[0].fieldId;
  for (const sub of g.groups ?? []) {
    const f = findFirstFieldId(sub);
    if (f) return f;
  }
  return '';
}

export default async function EditRulePage(props: PageProps) {
  const { locale, id } = await props.params;

  const [scopes, rule, corporations, effectTypes, effectTypeConfigs, rateSections, ruleCategoryOptions] = await Promise.all([
    fetchScopesAction(),
    getRuleById(id),
    fetchCorporationsAction(),
    fetchEffectTypesAction(),
    fetchEffectTypeConfigsAction(),
    fetchRateSectionsAction(),
    fetchRuleCategoriesAction(),
  ]);

  if (!rule) {
    notFound();
  }

  // Auto-infer ruleScopeId if missing or 0 in backend response
  let scopeId = rule.ruleScopeId;
  if (!scopeId || scopeId === 0) {
    try {
      const parsed = JSON.parse(rule.conditionsJson);
      let firstFieldId = '';

      if (Array.isArray(parsed)) {
        for (const r of parsed) {
          if (r.conditions) {
            firstFieldId = findFirstFieldId(r.conditions);
            if (firstFieldId) break;
          }
        }
      } else {
        firstFieldId = findFirstFieldId(parsed);
      }

      if (firstFieldId) {
        for (const s of scopes) {
          const fields = await fetchFieldsForScopeAction(s.id);
          if (fields.some((f) => f.fieldId === firstFieldId)) {
            scopeId = s.id;
            rule.ruleScopeId = s.id;
            break;
          }
        }
      }
    } catch (e) {
      console.error('Failed to infer ruleScopeId:', e);
    }
  }

  // Fallback to first scope if still 0/invalid
  if (!rule.ruleScopeId || rule.ruleScopeId === 0) {
    rule.ruleScopeId = scopes[0]?.id || 1;
  }

  const initialFields = await fetchFieldsForScopeAction(rule.ruleScopeId);

  return (
    <RuleBuilder
      initialRule={rule}
      scopes={scopes}
      initialFields={initialFields}
      locale={locale}
      onFetchFields={fetchFieldsForScopeAction}
      onSaveRule={saveRuleAction}
      corporations={corporations}
      effectTypes={effectTypes}
      categoryOptions={rateSections}
      ruleCategoryOptions={ruleCategoryOptions}
      effectTypeConfigs={effectTypeConfigs}
    />
  );
}
