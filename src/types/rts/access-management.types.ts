export interface MasterRecord {
  id: number;
  isActive: boolean;
}
export interface AccessDepartment extends MasterRecord {
  departmentName: string;
}
export interface AccessModule extends MasterRecord {
  moduleName: string;
  departmentId: number;
}
export interface AccessRole extends MasterRecord {
  userRoleName: string;
  departmentId: number;
}
export interface AccessGroup extends MasterRecord {
  screenGroupCode: string;
  screenGroupName: string;
  screenGroupNameLocal?: string | null;
  screenGroupIcon?: string | null;
  displayOrder?: number | null;
}
export interface AccessScreen extends MasterRecord {
  screenGroupId: number;
  departmentId: number | null;
  moduleId: number | null;
  screenCode: string;
  screenName: string;
  screenNameLocal?: string | null;
  screenIcon?: string | null;
  routePath?: string | null;
  displayOrder?: number | null;
  isMenu: boolean;
  isAuthenticationRequired: boolean;
}
export interface DepartmentAllocation extends MasterRecord {
  departmentId: number;
}
export interface ModuleAllocation extends DepartmentAllocation {
  moduleId: number;
}
export interface RoleAllocation extends DepartmentAllocation {
  userRoleId: number;
}
export interface AccessUser extends MasterRecord {
  userName: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  userCode?: string | null;
  email?: string | null;
  mobileNo?: string | null;
  alternateMobileNo?: string | null;
  address?: string | null;
  remark?: string | null;
  language?: string | null;
  employeeTypeID?: number | null;
  departments?: DepartmentAllocation[] | null;
  moduleAccess?: ModuleAllocation[] | null;
  roleAllocations?: RoleAllocation[] | null;
}
export interface PermissionFlags {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  haveFullAccess: boolean;
  haveNoAccess: boolean;
}
export interface RolePermission extends MasterRecord, PermissionFlags {
  userRoleId: number;
  screenId: number;
  createdDate?: string | null;
  updatedDate?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
export interface AccessLookups {
  departments: AccessDepartment[];
  modules: AccessModule[];
  roles: AccessRole[];
}
export interface MasterPage<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
export interface AccessQuery {
  page: number;
  pageSize: number;
  search: string;
  tab: string;
  departmentId?: number;
  moduleId?: number;
  roleId?: number;
  groupId?: number;
  screenId?: number;
  permissionStatus?: 'active' | 'inactive';
  permissionType?: 'view' | 'edit' | 'delete' | 'full' | 'none';
}
export type AccessSearchParams = Record<string, string | string[] | undefined>;
export type AccessResult<T> = { success: true; data: T } | { success: false; error: string };
export interface EditorPermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
}
export interface UserDraft {
  userName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  userCode: string;
  email: string;
  mobileNo: string;
  alternateMobileNo: string;
  address: string;
  remark: string;
  language: string;
  employeeTypeID: number | null;
  departmentIds: number[];
  modules: { departmentId: number; moduleId: number }[];
  roles: { departmentId: number; userRoleId: number }[];
}
