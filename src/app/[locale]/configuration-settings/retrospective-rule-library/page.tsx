import { RetrospectiveRuleLibrary } from '@/components/modules/configuration-settings/retrospective-rule-library';
import { getRetrospectiveRulesAction } from './action';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Retrospective Rule Library | NTIS',
  description: 'Review, compare and configure corporation-specific rules for retrospective property tax calculation.',
};

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
