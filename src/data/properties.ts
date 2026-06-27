// src/data/properties.ts

export type SupportedLanguage = "en" | "hi" | "mr";
export type PropertyStatus = "paid" | "pending";

export type SelectOption = {
  value: string;
  label: { en: string; hi: string; mr: string };
  ownerId?: number
};

export type PropertyRecord = {
  propertyNo: string; // used as Property ID for dropdown
  upicNo: string;
  assessmentAccountNo?: string;
  propertyTaxPropertyId?: string;

  // existing
  zone: "zone-1" | "zone-2" | "zone-3";
  wardArea: "ward-a" | "ward-b" | "ward-c";
  address: { en: string; hi: string; mr: string };
  indexNumber: string;
  houseNo: string;

  // ✅ NEW (optional) fields to support 7176 auto-fill
  surveyNo?: string;
  buildingName?: string;
  flatNo?: string;
  pincode?: string;

  commencementCertNo?: string;
  commencementCertDate?: string; // yyyy-mm-dd (HTML date input format)

  occupancyCertNo?: string;
  occupancyCertDateType?: "OC Date" | "CC Date" | "Electricity Bill Date" | "Other";
  occupancyCertDate?: string; // yyyy-mm-dd

  // optional dashboard-only metadata
  type?: { en: string; hi: string; mr: string };
  area?: string;
  totalYears?: number;
  status?: PropertyStatus;
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  dueDate?: string;

  // ✅ NEW: Owner data for Retaxation (7177)
  ownerFirstName?: string;
  ownerMiddleName?: string;
  ownerLastName?: string;
  ownerMobile?: string;
  ownerEmail?: string;
  ownerAadhar?: string;

  // matches createAddressFieldsWithCity("Owner") => ownerCity / ownerState
  ownerCity?: string;
  ownerState?: string;
};

export const properties: PropertyRecord[] = [
  {
    propertyNo: "PTX-2024-001234",
    upicNo: "UPIC-1001",
    assessmentAccountNo: "ACC-2024-001234",
    zone: "zone-1",
    wardArea: "ward-a",
    address: {
      en: "Plot 123, Sector 15, Akola",
      hi: "प्लॉट 123, सेक्टर 15, अकोला",
      mr: "प्लॉट 123, सेक्टर 15, अकोला",
    },
    indexNumber: "IDX-001",
    houseNo: "H-123",

    // 7176 optional autofill values
    surveyNo: "Mouje A - CTS-101",
    buildingName: "Green Heights",
    flatNo: "A-101",
    pincode: "444001",
    commencementCertNo: "CC-001234",
    commencementCertDate: "2024-01-10",
    occupancyCertNo: "OC-001234",
    occupancyCertDateType: "OC Date",
    occupancyCertDate: "2024-05-01",

    type: { en: "Residential", hi: "आवासीय", mr: "निवासी" },
    area: "1,500 sq ft",
    totalYears: 4,
    status: "paid",
    totalAmount: 12500,
    paidAmount: 12500,
    pendingAmount: 0,
    dueDate: "31 Mar 2024",

    // ✅ 7177 owner autofill values
    ownerFirstName: "Rahul",
    ownerMiddleName: "",
    ownerLastName: "Sharma",
    ownerMobile: "9876543210",
    ownerEmail: "rahul@example.com",
    ownerAadhar: "123456789012",
    ownerCity: "Akola",
    ownerState: "Maharashtra",
  },
  {
    propertyNo: "PTX-2024-002456",
    upicNo: "UPIC-1002",
    assessmentAccountNo: "ACC-2024-002456",
    zone: "zone-2",
    wardArea: "ward-b",
    address: {
      en: "Shop 45, Market Road, Akola",
      hi: "दुकान 45, मार्केट रोड, अकोला",
      mr: "दुकान 45, मार्केट रोड, अकोला",
    },
    indexNumber: "IDX-002",
    houseNo: "S-45",

    surveyNo: "Mouje B - GAT-12",
    buildingName: "City Plaza",
    flatNo: "Shop-45",
    pincode: "444002",
    commencementCertNo: "CC-002456",
    commencementCertDate: "2023-11-15",
    occupancyCertNo: "OC-002456",
    occupancyCertDateType: "CC Date",
    occupancyCertDate: "2023-11-15",

    type: { en: "Commercial", hi: "व्यावसायिक", mr: "व्यावसायिक" },
    area: "800 sq ft",
    totalYears: 3,
    status: "paid",
    totalAmount: 8500,
    paidAmount: 8500,
    pendingAmount: 0,
    dueDate: "31 Mar 2024",

    // ✅ 7177 owner autofill values (add yours)
    ownerFirstName: "Amit",
    ownerMiddleName: "",
    ownerLastName: "Patil",
    ownerMobile: "9123456789",
    ownerEmail: "amit@example.com",
    ownerAadhar: "234567890123",
    ownerCity: "Akola",
    ownerState: "Maharashtra",
  },
  {
    propertyNo: "PTX-2024-003789",
    upicNo: "UPIC-1003",
    assessmentAccountNo: "ACC-2024-003789",
    zone: "zone-3",
    wardArea: "ward-c",
    address: {
      en: "Plot 456, Sector 22, Akola",
      hi: "प्लॉट 456, सेक्टर 22, अकोला",
      mr: "प्लॉट 456, सेक्टर 22, अकोला",
    },
    indexNumber: "IDX-003",
    houseNo: "H-456",

    surveyNo: "Mouje C - CTS-209",
    buildingName: "Silver Residency",
    flatNo: "B-204",
    pincode: "444003",
    commencementCertNo: "CC-003789",
    commencementCertDate: "2024-02-20",
    occupancyCertNo: "OC-003789",
    occupancyCertDateType: "Electricity Bill Date",
    occupancyCertDate: "2024-03-01",

    type: { en: "Residential", hi: "आवासीय", mr: "निवासी" },
    area: "2,000 sq ft",
    totalYears: 5,
    status: "pending",
    totalAmount: 15000,
    paidAmount: 5000,
    pendingAmount: 10000,
    dueDate: "31 Mar 2024",

    // ✅ 7177 owner autofill values (add yours)
    ownerFirstName: "Neha",
    ownerMiddleName: "",
    ownerLastName: "Deshmukh",
    ownerMobile: "9988776655",
    ownerEmail: "neha@example.com",
    ownerAadhar: "345678901234",
    ownerCity: "Akola",
    ownerState: "Maharashtra",
  },
];

// ---------------------------
// Options for form selects
// ---------------------------
export const propertyNoOptions: SelectOption[] = properties.map((p) => ({
  value: p.propertyNo,
  label: { en: p.propertyNo, hi: p.propertyNo, mr: p.propertyNo },
  
}));

// ✅ Property ID options (alias)
export const propertyIdOptions: SelectOption[] = propertyNoOptions;

const unique = <T,>(arr: T[]) => Array.from(new Set(arr));

export const upicNoOptions: SelectOption[] = unique(properties.map((p) => p.upicNo)).map((u) => ({
  value: u,
  label: { en: u, hi: u, mr: u },
}));

export const zoneOptions: SelectOption[] = [
  { value: "zone-1", label: { en: "Zone 1", hi: "झोन 1", mr: "झोन १" } },
  { value: "zone-2", label: { en: "Zone 2", hi: "झोन 2", mr: "झोन २" } },
  { value: "zone-3", label: { en: "Zone 3", hi: "झोन 3", mr: "झोन ३" } },
];

export const wardAreaOptions: SelectOption[] = [
  { value: "ward-a", label: { en: "Ward A", hi: "प्रभाग अ", mr: "प्रभाग अ" } },
  { value: "ward-b", label: { en: "Ward B", hi: "प्रभाग ब", mr: "प्रभाग ब" } },
  { value: "ward-c", label: { en: "Ward C", hi: "प्रभाग क", mr: "प्रभाग क" } },
];

// ---------------------------
// Helpers
// ---------------------------
export const getPropertyByNo = (propertyNo: string) =>
  properties.find((p) => p.propertyNo === propertyNo);

export const getPropertyByUpic = (upicNo: string) =>
  properties.find((p) => p.upicNo === upicNo);

export const getPropertyText = (
  text: Partial<Record<SupportedLanguage, string>> | undefined,
  language: SupportedLanguage
) => text?.[language] ?? text?.en ?? "";

// Backward compatibility
export const propertyRecords = properties;
export const getPropertyById = getPropertyByNo;
