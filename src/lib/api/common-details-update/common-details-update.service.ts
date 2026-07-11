export {
  getBulkUpdateMenuServer,
  getBulkUpdateFieldConfigServer,
  getPropertiesForFilterServer,
  getWardsPagedServer,
  getWingsForWardServer,
  getDropdownOptionsServer,
  getPropertiesByWardServer,
  getAllWingsServer,
  getFieldRegistrySchemasServer,
  getFieldRegistryTablesServer,
  getFieldRegistryColumnsServer,
  getScopeOptionsServer,
  getScopeCategoryOptionsServer,
  exportExcelServer,
} from './common-details-update-queries.service';

export type { PropertyItem, WingItem, ScopeOption } from './common-details-update-queries.service';

export { executeBulkUpdateServer, addFieldRegistryServer, importExcelServer } from './common-details-update-mutations.service';

