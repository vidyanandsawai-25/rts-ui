export interface InventoryUnitResponse {
  assetId: number;
  assetNo: string;
  assetName: string;
  unitNumber: number;
  serialNumber?: string;
  assetTag?: string;
  condition?: string;
  unitPurchaseValue?: number;
  unitCapitalValue?: number;
  depreciationRate?: number;
  conditionFactor?: number;
  cvFormula?: string;
  dynamicAttributes?: Record<string, string>;
}

export interface InventoryBatchDetail {
  batchId: number;
  parentAssetId: number;
  inventoryType: string;
  itemName: string;
  modelBrand?: string;
  specifications?: string;
  purchaseDate: string;
  condition?: string;
  quantity: number;
  unitValue: number;
  totalBatchValue: number;
  totalBatchCV: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceFileName?: string;
  owningDepartment?: string;
  photoFileName?: string;
  isRegistered: boolean;
  registeredDate?: string;
  createdDate: string;
  units: InventoryUnitResponse[];
}

export interface InventoryBatchListResponse {
  parentAssetId: number;
  parentAssetName: string;
  totalBatches: number;
  totalUnits: number;
  totalPurchaseValue: number;
  totalCapitalValue: number;
  batches: InventoryBatchDetail[];
}
