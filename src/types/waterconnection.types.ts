export type ConnectionType = 'Domestic' | 'Commercial';
export type TapSizeValue = '15 Inch' | '20 Inch' | '25 Inch' | '32 Inch';
export type BillingCategory = 'Yearly' | 'Monthly';

export interface WaterConnection extends Record<string, unknown> {
  id: number;
  connectionNo: string;
  meterNo: string;
  type: ConnectionType;
  tapSize: TapSizeValue;
  applicableRate: number;
  category: BillingCategory;
  applicableCharges: number;
  installDate: string;
  activatedDate?: string;
  stoppedDate?: string;
  isActive: boolean;
  status?: boolean;
}

export interface PropertyInfo {
  id: number;
  propertyNo: string;
  ownerName: string;
  customerId: string;
  customerType: 'Individual' | 'Organization';
  contact: string;
  email: string;
  address: string;
  zone: string;
  ward: string;
  buildingType: string;
}

export interface WaterConnectionFormModel {
  id?: number;
  connectionNo: string;
  meterNo: string;
  type: ConnectionType;
  tapSize: TapSizeValue;
  applicableRate: number;
  installDate: string;
  isActive: boolean;
}

export interface WaterConnectionPageData {
  property: PropertyInfo;
  connections: WaterConnection[];
}

export const TAP_SIZE_RATES: Record<TapSizeValue, number> = {
  '15 Inch': 150,
  '20 Inch': 200,
  '25 Inch': 250,
  '32 Inch': 320,
};
