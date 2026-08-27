import { RetrospectiveRuleLibrary } from '@/components/modules/property-tax/retrospective-rule-library';
import { getRetrospectiveRulesAction } from './action';

export const dynamic = 'force-dynamic';

export default async function RetrospectiveRuleLibraryPage() {
  const result = await getRetrospectiveRulesAction();

  return (
    <RetrospectiveRuleLibrary
      initialRules={result.data || []}
      initialStats={result.stats}
      fetchError={result.error}
    />
  );
}
