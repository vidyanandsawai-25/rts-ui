import "server-only";

import path from "node:path";
import { promises as fs } from "node:fs";
import type {
  ServicesAndFormDataFile,
  StoredAdminServiceFormRecord,
} from "./types";

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "mock",
  "rts",
  "ServicesAndFormData.json"
);

const EMPTY_DATA: ServicesAndFormDataFile = { services: [] };

export async function readServicesAndFormDataFile(): Promise<ServicesAndFormDataFile> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as ServicesAndFormDataFile;

    if (!parsed || !Array.isArray(parsed.services)) {
      return EMPTY_DATA;
    }

    return parsed;
  } catch {
    return EMPTY_DATA;
  }
}

export async function writeServicesAndFormDataFile(data: ServicesAndFormDataFile): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readStoredAdminServiceForms(): Promise<StoredAdminServiceFormRecord[]> {
  const data = await readServicesAndFormDataFile();
  return data.services;
}

export async function readStoredAdminServiceFormByServiceId(
  serviceId: number | string
): Promise<StoredAdminServiceFormRecord | null> {
  const normalizedServiceId = String(serviceId).trim();
  if (!normalizedServiceId) {
    return null;
  }

  const forms = await readStoredAdminServiceForms();
  return (
    forms.find((record) => {
      const recordId = typeof record.id === "string" || typeof record.id === "number"
        ? String(record.id).trim()
        : "";

      return recordId === normalizedServiceId;
    }) ?? null
  );
}
