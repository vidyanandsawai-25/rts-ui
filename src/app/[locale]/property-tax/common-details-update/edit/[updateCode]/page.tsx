import CommonDetailsUpdatePage from "@/components/modules/property-tax/common-details-update/CommonDetailsUpdatePage";
import {
  getMenuItemsAction,
  getAllWardsAction,
  getAllWingsAction,
  setFieldRegistryStatusAction,
  getFieldConfigsAction,
  getFilteredPropertiesAction,
  getPreviewListByCategoryAction,
  getWingsAction,
  executeBulkUpdateAction,
  getPropertiesByWardAction,
  getPropertiesByCategoryAction,
  getScopeOptionsAction,
  getScopeCategoryOptionsAction,
  getAllZonesAction,
  getFieldRegistriesAction,
  addFieldRegistryAction,
  updateFieldRegistryAction,
  getFieldRegistryTablesAction,
  getFieldRegistryColumnsAction,
  exportExcelAction,
  getSourceTablesAction,
  getSourceTableFieldsAction,
  addBulkUpdateDefinitionAction,
  getUpdateHistoryAction,
  exportUpdateHistoryAction
} from "../../actions";
import {
  getFieldRegistriesServer,
  getFieldRegistrySchemasServer,
  getScopeOptionsServer,
  getBulkUpdateFieldConfigServer,
  getSourceTablesServer,
  getSourceTableFieldsServer,
  getUpdateHistoryServer
} from "@/lib/api/common-details-update/common-details-update.service";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{
    locale: string;
    updateCode: string;
  }>;
  searchParams: Promise<{
    tab?: string;
    field?: string;
    wardId?: string;
    wardNo?: string;
    fromProperty?: string;
    toProperty?: string;
    wing?: string;
    page?: string;
    pageNumber?: string;
    pageSize?: string;
    q?: string;
    propertyNo?: string;
    partitionNo?: string;
    scopeId?: string;
    zoneId?: string;
    sourceid?: string;
    sourceTable?: string;
    auditPage?: string;
    auditPageSize?: string;
    auditUser?: string;
    auditSearch?: string;
  }>;
}

const MIN_PAGE = 1;
const MAX_PAGE = 10_000;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function sanitizeParams(raw: Awaited<EditPageProps["searchParams"]>) {
  const rawPage = parseInt(raw.pageNumber ?? raw.page ?? "", 10);
  const pageNumber = Number.isFinite(rawPage)
    ? Math.min(Math.max(rawPage, MIN_PAGE), MAX_PAGE)
    : MIN_PAGE;

  const rawPageSize = parseInt(raw.pageSize ?? "", 10);
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(Math.max(rawPageSize, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const searchTerm = raw.q?.trim() || "";
  const selectedField = raw.field?.trim() || "";
  const wardId = raw.wardId?.trim() || "";
  const wardNo = raw.wardNo?.trim() || "";
  
  const rawPropertyNo = raw.propertyNo?.trim() || "";
  const rawPartitionNo = raw.partitionNo?.trim() || "";
  const hasPartition = rawPartitionNo !== "" && rawPartitionNo !== "0";
  const propertyNoCombined = (rawPropertyNo && hasPartition) ? `${rawPropertyNo}-${rawPartitionNo}` : rawPropertyNo;

  const fromProperty = raw.fromProperty?.trim() || propertyNoCombined;
  const toProperty = raw.toProperty?.trim() || propertyNoCombined;
  const wing = raw.wing?.trim() || "";
  const scopeId = raw.scopeId?.trim() || "";
  const zoneId = raw.zoneId?.trim() || "";
  const tab = raw.tab?.trim() || "updateFields";
  const sourceid = raw.sourceid?.trim() || "";
  const sourceTable = raw.sourceTable?.trim() || "";
  const auditPage = Math.max(MIN_PAGE, Math.min(MAX_PAGE, Number(raw.auditPage) || 1));
  const auditPageSize = Math.max(MIN_PAGE, Math.min(MAX_PAGE_SIZE, Number(raw.auditPageSize) || 10));
  const auditUser = raw.auditUser?.trim() || "";
  const auditSearch = raw.auditSearch?.trim() || "";

  return { pageNumber, pageSize, searchTerm, selectedField, wardId, wardNo, fromProperty, toProperty, wing, tab, scopeId, zoneId, sourceid, sourceTable, auditPage, auditPageSize, auditUser, auditSearch };
}

export default async function EditPage(props: EditPageProps) {
  const { updateCode: rawUpdateCode } = await props.params;
  const updateCode = decodeURIComponent(rawUpdateCode);
  const { pageNumber, pageSize, searchTerm, selectedField, wardId, wardNo, fromProperty, toProperty, wing, tab, scopeId, zoneId, sourceid, sourceTable, auditPage, auditPageSize, auditUser, auditSearch } = sanitizeParams(await props.searchParams);

  const menuItems = await getMenuItemsAction();
  const defaultCode = selectedField || (menuItems[0]?.updateCode || "");

  const [wardsResult, wingsResult, initialFieldRegistries, initialSchemas, initialScopeOptions, initialFieldConfigs, editData, initialSourceTables, initialUpdateHistory] = await Promise.all([
    getAllWardsAction(),
    getAllWingsAction(),
    getFieldRegistriesServer(pageNumber, pageSize).catch(() => ({
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false
    })),
    getFieldRegistrySchemasServer().catch(() => []),
    getScopeOptionsServer().catch(() => []),
    defaultCode ? Promise.all(
      defaultCode.split(',').map(code =>
        getBulkUpdateFieldConfigServer(code.trim()).catch(() => [])
      )
    ).then(results => {
      const flat = results.flat();
      const unique = [];
      const seen = new Set<string>();
      for (const item of flat) {
        if (!seen.has(item.fieldName)) {
          seen.add(item.fieldName);
          unique.push(item);
        }
      }
      return unique;
    }) : Promise.resolve([]),
    getFieldRegistriesServer(undefined, undefined, updateCode).catch(() => null),
    getSourceTablesServer().catch(() => []),
    getUpdateHistoryServer({
      PageNumber: auditPage,
      PageSize: auditPageSize,
      DoneBy: auditUser,
      SearchTerm: auditSearch,
    }).catch(() => null),
  ]);

  const initialEditData = editData && "items" in editData ? (editData.items?.[0] || null) : (Array.isArray(editData) ? editData[0] : null);

  let actualSourceId = sourceid || sourceTable;
  if (!actualSourceId && initialEditData) {
    const referenceTableName = initialEditData.targetTable || initialEditData.referenceTableName;
    if (referenceTableName) {
      const parts = referenceTableName.split('.');
      const tableName = parts[parts.length - 1];
      
      const LEGACY_TABLE_MAPPING: Record<string, string> = {
        "PropertyMast": "Property Tax Property Information",
        "PropertyDetails": "Property Tax PropertyDetails",
      };
      const mappedTableName = LEGACY_TABLE_MAPPING[tableName] || tableName;

      const normalizedMapped = mappedTableName.toLowerCase().replace(/[\s_]/g, '');
      const normalizedTable = tableName.toLowerCase().replace(/[\s_]/g, '');

      const foundTable = (initialSourceTables || []).find((t: { id: number; tableName?: string }) => {
        if (!t.tableName) return false;
        const tName = t.tableName.toLowerCase().replace(/[\s_]/g, '');
        return tName === normalizedMapped || tName === normalizedTable || String(t.id) === tableName;
      });
      if (foundTable) {
        actualSourceId = String(foundTable.id);
      }
    }
  }

  const initialSourceTableFields = actualSourceId ? await getSourceTableFieldsServer(Number(actualSourceId)).catch(() => []) : [];

  const wardsData = wardsResult.success && wardsResult.data ? wardsResult.data : {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: -1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const wingsData = wingsResult.success && wingsResult.data ? wingsResult.data : {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: -1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const actions = {
    getFieldConfigsAction,
    getFilteredPropertiesAction,
    getPreviewListByCategoryAction,
    getWingsAction,
    executeBulkUpdateAction,
    getAllWardsAction,
    getPropertiesByWardAction,
    getPropertiesByCategoryAction,
    getAllWingsAction,
    getScopeOptionsAction,
    getScopeCategoryOptionsAction,
    getAllZonesAction,
    getFieldRegistriesAction,
    addFieldRegistryAction,
    updateFieldRegistryAction,
    getFieldRegistryTablesAction,
    getFieldRegistryColumnsAction,
    setFieldRegistryStatusAction,
    exportExcelAction,
    getSourceTablesAction,
    getSourceTableFieldsAction,
    addBulkUpdateDefinitionAction,
    getUpdateHistoryAction,
    exportUpdateHistoryAction
  };

  return (
    <CommonDetailsUpdatePage
      menuItems={menuItems}
      wardsData={wardsData}
      wingsData={wingsData}
      initialFieldRegistries={initialFieldRegistries}
      initialSchemas={initialSchemas}
      initialScopeOptions={initialScopeOptions}
      initialFieldConfigs={initialFieldConfigs}
      initialSourceTables={initialSourceTables}
      initialSourceTableFields={initialSourceTableFields}
      initialField={selectedField || updateCode}
      initialWardId={wardId}
      initialWardNo={wardNo}
      initialFromProperty={fromProperty}
      initialToProperty={toProperty}
      initialWing={wing}
      initialPage={pageNumber}
      initialPageSize={pageSize}
      initialSearchTerm={searchTerm}
      initialTab={tab || "fieldRegistry"}
      initialScopeId={scopeId}
      initialZoneId={zoneId}
      setFieldRegistryStatusAction={setFieldRegistryStatusAction}
      editUpdateCode={updateCode}
      initialEditData={initialEditData}
      initialUpdateHistory={initialUpdateHistory}
      actions={actions}
    />
  );
}
