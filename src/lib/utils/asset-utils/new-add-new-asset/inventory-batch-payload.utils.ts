/* eslint-disable @typescript-eslint/no-explicit-any */

/** Resolves the numeric master-data IDs (category/item/model/condition/department)
 * for a form or row — shared by add/update/save-all, previously duplicated
 * verbatim in each. */
export function resolveInventoryIds(
  f: { category?: string; itemName?: string; modelName?: string; condition?: string; owningDepartment?: string },
  categories: any[],
  itemNames: any[],
  itemModels: any[],
  conditions: any[],
  departments: any[]
) {
  return {
    c: categories.find(c => String(c.typeName).toLowerCase() === String(f.category).toLowerCase())?.id || 0,
    n: itemNames.find(n => String(n.subTypeName).toLowerCase() === String(f.itemName).toLowerCase())?.id || 0,
    m: itemModels.find(m => String(m.modelName).toLowerCase() === String(f.modelName).toLowerCase())?.id || 0,
    cond: conditions.find(c => String(c.conditionName).toLowerCase() === String(f.condition).toLowerCase()),
    d: departments.find(d => String(d.value).toLowerCase() === String(f.owningDepartment).toLowerCase())?.id || 0
  };
}

/** Builds the {file, meta} pair list for a batch's photo + invoice files —
 * shared across add/update/save-all. */
export function buildInventoryDocumentFiles(photoFile: File | null | undefined, invoiceFile: File | null | undefined) {
  const documentFiles: File[] = [];
  const documentMetadata: any[] = [];
  let displayOrder = 1;

  if (photoFile) {
    documentFiles.push(new File([photoFile], `photo_${photoFile.name}`, { type: photoFile.type }));
    documentMetadata.push({ documentTypeId: 1, displayOrder: displayOrder++, remarks: "Inventory Photo", isEnabled: true });
  }
  if (invoiceFile) {
    documentFiles.push(new File([invoiceFile], `invoice_${invoiceFile.name}`, { type: invoiceFile.type }));
    documentMetadata.push({ documentTypeId: 2, displayOrder: displayOrder++, remarks: "Inventory Invoice", isEnabled: true });
  }

  return { documentFiles, documentMetadata };
}

/** Builds the createBatch API payload shape shared by handleAddRow,
 * handleUpdateRow's quantity-changed re-create path, and handleSaveToBackend. */
export function buildInventoryBatchApiPayload(
  parentAssetId: number,
  ids: { c: number; n: number; m: number; cond: any; d: number },
  source: {
    specifications?: string;
    purchaseDate?: string;
    quantity: number;
    unitValue: number;
    invoiceNumber?: string;
    invoiceDate?: string;
    invoiceFileName?: string;
    photoName?: string;
    unitDynamicAttributes?: Record<number, any>;
  }
): any {
  return {
    parentAssetId,
    inventoryItemCategoryId: ids.c, inventoryItemNameId: ids.n, inventoryItemModelId: ids.m,
    specifications: source.specifications?.trim() || "",
    purchaseDate: source.purchaseDate ? new Date(source.purchaseDate).toISOString() : new Date().toISOString(),
    inventoryItemConditionId: ids.cond?.id || 0,
    quantity: Number(source.quantity), unitValue: Number(source.unitValue),
    invoiceNumber: source.invoiceNumber || "",
    invoiceDate: source.invoiceDate ? new Date(source.invoiceDate).toISOString() : new Date().toISOString(),
    invoiceFileName: source.invoiceFileName || "",
    owningDepartmentId: Number(ids.d),
    photoFileName: source.photoName || "",
    units: Array.from({ length: Number(source.quantity) }, (_, i) => ({
      unitNumber: i + 1, serialNumber: "", assetTag: "",
      inventoryItemConditionId: ids.cond?.id || 0,
      dynamicAttributes: source.unitDynamicAttributes?.[i] || {},
      conditionFactor: ids.cond?.conditionFactor || 1
    }))
  };
}

/** Turns an inventory batch api payload + staged document files into the
 * multipart FormData saveSingleInventoryBatchAction expects. */
export function buildInventoryBatchFormData(
  apiPayload: any,
  documentFiles: File[],
  documentMetadata: any[]
): FormData {
  const formDataPayload = new FormData();
  Object.keys(apiPayload).forEach(key => {
    if (key !== 'units' && key !== 'documentFiles' && key !== 'documentMetadata') {
      if (apiPayload[key] !== null && apiPayload[key] !== undefined) {
        formDataPayload.append(key, String(apiPayload[key]));
      }
    }
  });
  formDataPayload.append('unitsJson', JSON.stringify(apiPayload.units));

  if (documentFiles.length > 0) {
    formDataPayload.append('documentMetadataJson', JSON.stringify(documentMetadata));
    formDataPayload.append('DocumentMetadataJson', JSON.stringify(documentMetadata));
    documentFiles.forEach(f => {
      formDataPayload.append('DocumentFiles', f);
    });
  }

  return formDataPayload;
}
