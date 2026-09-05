import "server-only";

import type {
  ServicesAndFormDataFile,
  StoredAdminServiceFormRecord,
} from "./types";

const EMPTY_DATA: ServicesAndFormDataFile = { services: [] };

export async function readServicesAndFormDataFile(): Promise<ServicesAndFormDataFile> {
  return EMPTY_DATA;
}

export async function writeServicesAndFormDataFile(_data: ServicesAndFormDataFile): Promise<void> {
  // No-op: live data is stored in the database
}

export async function readStoredAdminServiceForms(): Promise<StoredAdminServiceFormRecord[]> {
  return [];
}

export async function readStoredAdminServiceFormByServiceId(
  _serviceId: number | string
): Promise<StoredAdminServiceFormRecord | null> {
  return null;
}
