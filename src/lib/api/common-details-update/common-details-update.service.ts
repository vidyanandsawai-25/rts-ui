export {
  getBulkUpdateMenuServer,
  getBulkUpdateFieldConfigServer,
  getPropertiesForFilterServer,
  getWardsPagedServer,
  getWingsForWardServer,
  getDropdownOptionsServer,
  getPropertiesByWardServer,
  getAllWingsServer,
} from './common-details-update-queries.service';

export type { PropertyItem, WingItem } from './common-details-update-queries.service';

export { executeBulkUpdateServer } from './common-details-update-mutations.service';
