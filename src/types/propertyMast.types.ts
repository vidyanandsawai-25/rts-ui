export type PropertyMastListItem = {
  ownerId: number;
  ownerName: string | null;
  mobileNo: string | null;
  propertyId: string;
  propertyNo: string | null;
};

export type PropertyMastDto = {
  ownerId: number;

  propertyId : string | null;
  propertyNo?: string | null;
  upicNo?: string | null;
  ownerName?: string | null;
  mobileNo?: string | null;
  ownerEmail?: string | null;
  ownerAadhar?: string | null;
  ownerCity?: string | null;
  ownerState?: string | null;

  zoneId?: number | null;
  wardNo?: number | null;

  moujeGaon?: string | null;
  surveyGatCtsNo?: string | null;

  propertyAddress?: string | null;
  buildingName?: string | null;
  wingFlatShopNo?: string | null;

  pincode?: string | null;

  ccNo?: string | null;
  ocNo?: string | null;

  dateType?: string | null;
  selectedDate?: string | null; // backend returns string/ISO

  latitude?: string | null;
  longitude?: string | null;

  createdOn?: string | null;
  updatedOn?: string | null;
};

export type ApiEnvelope<T> = {
  status: boolean;
  data: T;
  message?: string;
};

export type RegisteredPropertyDetails = {
  zoneId?: string | null;
  wardNo?: string | null;
  surveyNo?: string | null;

  propertyAddress?: string | null;
  buildingName?: string | null;
  flatNo?: string | null;
  pincode?: string | null;

  commencementCertNo?: string | null;
  commencementCertDate?: string | null;
  occupancyCertNo?: string | null;
  occupancyCertDateType?: string | null;
  occupancyCertDate?: string | null;

  propertyLatitude?: number | null;
  propertyLongitude?: number | null;

  propertyState?: string | null;
  propertyCity?: string | null;
};
