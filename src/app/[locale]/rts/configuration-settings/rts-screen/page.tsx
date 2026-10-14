import RtsScreenManagement from '@/components/modules/rts/configuration/rts-screen/RtsScreenManagement';
import { getRtsScreenMasterAction } from './actions';
import type { AccessSearchParams } from '@/types/rts/access-management.types';

export const dynamic = 'force-dynamic';
export default async function RtsScreenPage({
  searchParams,
}: {
  searchParams: Promise<AccessSearchParams>;
}) {
  const result = await getRtsScreenMasterAction(await searchParams);
  if (!result.success)
    return (
      <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        {result.error}
      </div>
    );
  return <RtsScreenManagement {...result.data} />;
}
