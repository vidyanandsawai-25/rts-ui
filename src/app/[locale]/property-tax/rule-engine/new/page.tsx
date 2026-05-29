import RuleBuilder from '@/components/modules/property-tax/rule-engine/RuleBuilder';
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
  }>;
}

export default async function NewRulePage(props: PageProps) {
  const { locale } = await props.params;

  const [scopes, initialFields, corporations, effectTypes, effectTypeConfigs, rateSections, ruleCategoryOptions] = await Promise.all([
    fetchScopesAction(),
    fetchFieldsForScopeAction(1),
    fetchCorporationsAction(),
    fetchEffectTypesAction(),
    fetchEffectTypeConfigsAction(),
    fetchRateSectionsAction(),
    fetchRuleCategoriesAction(),
  ]);

  return (
    <RuleBuilder
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
