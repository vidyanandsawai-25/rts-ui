import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/common/PageContainer';
import AddTaxesConsole, { AddTaxesActions } from '@/components/modules/property-tax/add-taxes/AddTaxesConsole';
import TableHeader from '@/components/common/TableHeader';
import {
  initOperationsAction,
  getScopeOptionsAction,
  fetchAllZonesAction,
  fetchAllWardsAction,
  fetchAllPropertyTypesAction,
  searchPropertiesAction,
  searchPropertiesByCategoryAction,
  getEligibleCountAction,
  executeOperationAction,
  previewOperationAction,
  fetchAssessmentStatusesAction,
  getAuditListAction,
  getAuditDetailAction,
  getJobPropertiesAction,
  getImportTemplateAction
} from './actions';

export default async function AddTaxesPage() {
  const t = await getTranslations('addTaxes');

  // Fetch initial base data concurrently
  const [
    initResponse,
    scopeResponse,
  ] = await Promise.all([
    initOperationsAction(),
    getScopeOptionsAction(),
  ]);

  const initData = initResponse ? initResponse : null;
  const scopeOptions = scopeResponse ? scopeResponse.items : [];

  const clientActions = {
    initOperationsAction,
    getScopeOptionsAction,
    fetchAllZonesAction,
    fetchAllWardsAction,
    fetchAllPropertyTypesAction,
    searchPropertiesAction,
    searchPropertiesByCategoryAction,
    getEligibleCountAction,
    executeOperationAction,
    previewOperationAction,
    fetchAssessmentStatusesAction,
    getAuditListAction,
    getAuditDetailAction,
    getJobPropertiesAction,
    getImportTemplateAction
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <TableHeader
          title={t('title')}
          subtitle={t('subtitle')}
          icon="database"
          rightContent={<AddTaxesActions />}
        />
        <AddTaxesConsole
          initData={initData}
          scopeOptions={scopeOptions}
          actions={clientActions}
        />
      </div>
    </PageContainer>
  );
}
