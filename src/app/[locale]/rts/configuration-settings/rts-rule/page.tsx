import RtsRuleMaster from '@/components/modules/rts/configuration/rts-rule/RtsRuleMaster';
import { getRuleMasterPageAction } from './actions';
import { parseRuleQuery } from './query';

export const dynamic = 'force-dynamic';

export default async function RtsRulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const result = await getRuleMasterPageAction(parseRuleQuery(await searchParams));
  if (!result.success) {
    return (
      <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        {result.error}
      </div>
    );
  }
  return (
    <RtsRuleMaster
      key={`${result.data.query.serviceId ?? 'none'}:${result.data.query.search}:${result.data.query.drawer ?? 'closed'}:${result.data.query.ruleId ?? 'new'}`}
      {...result.data}
    />
  );
}
