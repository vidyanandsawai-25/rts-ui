import { setRequestLocale, getTranslations } from 'next-intl/server';
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
  getImportTemplateAction,
  getServerTimeAction
} from './actions';

interface AddTaxesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AddTaxesPage({ params }: AddTaxesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'addTaxes' });

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
    getImportTemplateAction,
    getServerTimeAction
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
