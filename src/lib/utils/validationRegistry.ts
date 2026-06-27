import type { CustomValidate, FieldValidation, InputMode } from "../../data/Dept/formTypes";

/**
 * Global, key-based validation registry.
 * - Put shared/common rules here (works across all departments).
 * - Each field should use: { validationKey: "SOME_KEY" }
 *
 * You can still override per-field with validation: {...} if needed,
 * but the recommended flow is key-only for consistency.
 */
export type ValidationRule = FieldValidation & {
  /** Shown when pattern fails (DynamicServiceFormClient uses it) */
  message?: string;
  /** Optional: override inputMode for UI (numeric/decimal/email/etc.) */
  inputMode?: InputMode;
};

const currentYear = () => new Date().getFullYear();
const THIS_YEAR = currentYear();

export const VALIDATION_RULES: Record<string, ValidationRule> = {
  // ---------------- Personal Identity ----------------
  NAME: {
    pattern: "^[A-Za-z\\p{L}\\p{M}\\s.]{2,50}$",
    message: "Only letters, spaces, and dots are allowed.",
    minLength: 2,
    maxLength: 50,
    allow: "^[A-Za-z\\p{L}\\p{M}\\s.]+$",
    inputMode: "text",
  },
  NAME_NO_SPACE: {
    pattern: "^[A-Za-z\\p{L}\\p{M}]{2,50}$",
    message: "Only letters are allowed (no spaces or dots).",
    minLength: 2,
    maxLength: 50,
    // Allow typing spaces/dots; pattern blocks them (validation error instead of stripping).
    allow: "^[A-Za-z\\p{L}\\p{M}\\s.]+$",
    inputMode: "text",
    
  },

  EMAIL: {
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    message: "Enter a valid email address.",
    allow: "[A-Za-z0-9@._%+-]",
    inputMode: "email",
    // Uses custom validator already present in DynamicServiceFormClient.tsx
    customValidate: "noTempEmail" as CustomValidate,
    
  },

  MOBILE: {
    pattern: "^[6-9][0-9]{9}$",
    message: "Enter a valid mobile number (starts with 6-9).",
    exactLength: 10,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
  },

  AADHAAR: {
    pattern: "^[2-9]{1}[0-9]{11}$",
    message: "Enter a valid Aadhaar number (starts with 2-9).",
    exactLength: 12,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
  },

  PAN_SIMPLE: {
    pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$",
    message: "PAN must be like ABCDE1234F (capital letters).",
    exactLength: 10,
    allow: "alphanumeric",
    normalize: ["trim", "removeSpaces", "uppercase"],
    inputMode: "text",
  },
  PAN_SIMPLE_PATTERN: {
    pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$",
    maxLength: 10,
    allow: "alphanumeric",
  },

  PAN_STRICT_TYPE: {
    // 4th character is PAN type (P,C,H,F,A,T,B,L,J,G)
    pattern: "^[A-Z]{3}[PCHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$",
    message: "Enter a valid PAN (e.g., ABCPZ1234K).",
    exactLength: 10,
    allow: "alphanumeric",
    normalize: ["trim", "removeSpaces", "uppercase"],
    inputMode: "text",
  },

  PASSPORT: {
    pattern: "^[A-Z0-9]{7,12}$",
    message: "Passport must use letters A-Z and numbers 0-9.",
    minLength: 7,
    maxLength: 12,
    allow: "alphanumeric",
    normalize: ["trim", "removeSpaces", "uppercase"],
    inputMode: "text",
  },

  LOCAL_CONTACT_NAME: {
    pattern: "^[\\p{L}\\p{M}\\s]{2,50}$",
    message: "Only letters and spaces are allowed.",
    minLength: 2,
    maxLength: 50,
    allow: "letters",
    
    inputMode: "text",
  },

  // ---------------- Property / Identifiers ----------------
  ASSESSMENT_ACCOUNT_NO: {
    pattern: "^[a-zA-Z0-9\\/\\-]{5,20}$",
    message: "Allowed: letters, numbers, -, and /.",
    minLength: 5,
    maxLength: 20,
    allow: "[A-Za-z0-9/\\-]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },

  INDEX_NUMBER: {
    pattern: `^\\d+\\/(?:19|20)\\d{2}$`,
    message: `Format must be like 11635/${THIS_YEAR}.`,
    allow: "[0-9/]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },

  PROPERTY_NO_UPIC: {
    pattern: "^[a-zA-Z0-9\\/\\-]{10,25}$",
    message: "Allowed: letters, numbers, -, and /.",
    minLength: 10,
    maxLength: 25,
    allow: "[A-Za-z0-9/\\-]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },

  WARD_ZONE: {
    pattern: "^[\\p{L}\\p{M}0-9\\s/\\-.]{1,10}$",
    message: "Allowed: letters, numbers, spaces, -, /, and .",
    maxLength: 10,
    allow: "[\\p{L}\\p{M}0-9\\s/\\-.]",
    
    inputMode: "text",
  },
  WARD_NO: {
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s\\-.]{1,20}$",
    maxLength: 20,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s\\-.]",
  },

  SURVEY_NO: {
    pattern: "^[\\p{L}\\p{M}0-9\\s/\\-.]{1,20}$",
    message: "Allowed: letters, numbers, spaces, -, /, and .",
    maxLength: 20,
    allow: "[\\p{L}\\p{M}0-9\\s/\\-.]",
    //
    inputMode: "text",
  },

  CITY_SURVEY_NO: {
    pattern: "^[\\p{L}\\p{M}0-9\\s/\\-.]{1,15}$",
    message: "Allowed: letters, numbers, spaces, -, /, and .",
    maxLength: 15,
    allow: "[\\p{L}\\p{M}0-9\\s/\\-.]",
    //
    inputMode: "text",
  },
  HOUSE_FLAT_NO: {
  pattern: "^[A-Za-z0-9\\s/\\-]{1,20}$",
  message: "Allowed: letters, numbers, spaces, -, and /.",
  maxLength: 20,
  allow: "[\\p{L}\\p{M}0-9\\s/\\-]",
  // 
  inputMode: "text",
},

  HOUSE_FLAT_NO_FLEX: {
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s,.'/#()&-]{1,20}$",
    maxLength: 20,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s,.'/#()&\\-]",
  },

  UNIT_NO_WITH_SPACE: {
    pattern: "^[a-zA-Z0-9\\s\\/\\-]{1,15}$",
    message: "Allowed: letters, numbers, spaces, -, and /.",
    maxLength: 15,
    allow: "[\\p{L}\\p{M}0-9\\s/\\-]",
    
    inputMode: "text",
  },

  BUILDING_NAME: {
    pattern: "^[\\p{L}\\p{M}\\s]{2,100}$",
    message: "Only letters and spaces are allowed.",
    minLength: 2,
    maxLength: 100,
    allow: "letters",
    //
    inputMode: "text",
  },

  BUILDING_SOCIETY_NAME: {
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s,.'/()&-]{1,100}$",
    message: "Use letters, digits, spaces, and ,.'/()&- only.",
    maxLength: 100,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s,.'/()&-]",
    //
    inputMode: "text",
  },

  ROAD_STREET_NAME: {
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s,.'/()&-]{1,100}$",
    message: "Use letters, digits, spaces, and ,.'/()&- only.",
    maxLength: 100,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s,.'/()&-]",
    // 
    inputMode: "text",
  },

  LANDMARK: {
    pattern: "^[\\p{L}\\p{M}\\s]{2,100}$",
    message: "Only letters and spaces are allowed.",
    minLength: 2,
    maxLength: 100,
    allow: "letters",
   // 
    inputMode: "text",
  },
  LANDMARK_FLEX: {
    pattern: "^$|^[A-Za-z0-9\\p{L}\\p{M}\\s,.'/()&-]{1,100}$",
    maxLength: 100,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s,.'()/&\\-]",
  },

  CITY_STATE: {
    pattern: "^[A-Za-z\\p{L}\\p{M}\\s.'-]{1,50}$",
    message: "Use letters, spaces, and .'- only.",
    maxLength: 50,
    allow: "[A-Za-z\\p{L}\\p{M}\\s.'-]",
    //
    inputMode: "text",
  },

  PROPERTY_ADDRESS: {
    pattern: "^[\\p{L}\\p{M}0-9\\s\\/\\-\\.,]{10,250}$",
    message: "Allowed: letters, numbers, spaces, /, -, ., and ,.",
    minLength: 10,
    maxLength: 250,
    allow: "[\\p{L}\\p{M}0-9\\s/\\-\\.,]",
    inputMode: "text",
    
  },

  PINCODE: {
    pattern: "^[1-9][0-9]{5}$",
    message: "Enter a valid pincode .",
    exactLength: 6,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
  },

  // ---------------- Certificates & Orders ----------------
  CERT_OR_ORDER_NO: {
    pattern: "^[a-zA-Z0-9\\/\\-\\(\\)\\s]{5,50}$",
    message: "Allowed: letters, numbers, spaces, /, -, and ().",
    minLength: 5,
    maxLength: 50,
    allow: "[A-Za-z0-9\\s/\\-()]",
    
    inputMode: "text",
  },

  // ---------------- Construction & Physical Details ----------------
  YEAR_OF_CONSTRUCTION: {
    pattern: "^\\d{4}$",
    message: "Enter a valid year.",
    exactLength: 4,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
    customValidate: ((value: any) => {
      const y = Number(String(value || "").trim());
      if (!Number.isInteger(y)) return "Year must be a whole number.";
      if (y < 1800 || y > THIS_YEAR) return `Year must be between 1800 and ${THIS_YEAR}.`;
      return null;
    }) as unknown as CustomValidate,
  },
  CONSTRUCTION_YEAR_1950_2050: {
    min: 1950,
    max: 2050,
    allow: "numeric",
  },

  FINANCIAL_YEAR: {
    pattern: "^\\d{4}-\\d{2}$",
    message: "Format must be like 2025-26.",
    exactLength: 7,
    allow: "[0-9\\-]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
    customValidate: ((value: any) => {
      const v = String(value || "").trim();
      const m = v.match(/^(\d{4})-(\d{2})$/);
      if (!m) return "Format must be like 2025-26.";
      const start = Number(m[1]);
      const end2 = Number(m[2]);
      const expected = (start + 1) % 100;
      if (end2 !== expected) return `End year should be ${(start + 1).toString().slice(-2)}.`;
      return null;
    }) as unknown as CustomValidate,
  },

  FLOORS: {
    pattern: "^[a-zA-Z0-9\\+\\-\\/]{1,10}$",
    message: "Allowed: letters, numbers, '+', '-', and '/'. Example: G+7",
    maxLength: 10,
    allow: "[A-Za-z0-9+\\/\\-]",
    normalize: ["trim", "removeSpaces", "uppercase"],
    inputMode: "text",
  },

  WHOLE_NUMBER: {
    pattern: "^\\d+$",
    message: "Only whole numbers allowed.",
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
  },
  MIN_1: {
    min: 1,
    allow: "decimal",
  },
  MIN_0: {
    min: 0,
    allow: "decimal",
  },

  DECIMAL_2: {
    pattern: "^\\d+(\\.\\d{1,2})?$",
    message: "Only numbers are allowed (decimals permitted).",
    allow: "decimal",
    normalize: ["trim", "removeSpaces"],
    inputMode: "decimal",
  },

  LENGTH_WIDTH: {
    pattern: "^\\d+(\\.\\d+)?\\s*[xX\\*]\\s*\\d+(\\.\\d+)?$",
    message: "Format must be like 10x20, 10 X 20, or 10*20 (decimals allowed).",
    allow: "[0-9xX*\\.\\s]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },

  // ---------------- Financial & Descriptions ----------------
  AMOUNT: {
    // commas will be removed during sanitize/normalize
    pattern: "^\\d+(\\.\\d{1,2})?$",
    message: "Enter a valid amount.",
    allow: "decimal",
    normalize: ["trim", "removeSpaces", "removeCommas"],
    inputMode: "decimal",
    customValidate: ((value: any) => {
      const raw = String(value ?? "");
      const cleaned = raw.replace(/,/g, "").trim();
      if (cleaned === "") return null;
      const n = Number(cleaned);
      if (!Number.isFinite(n)) return "Enter a valid amount.";
      if (n < 0) return "Value cannot be negative.";
      return null;
    }) as unknown as CustomValidate,
  },

  PURPOSE: {
    pattern: "^[\\p{L}\\p{M}\\s]{2,50}$",
    message: "Only letters and spaces are allowed.",
    minLength: 2,
    maxLength: 50,
    allow: "letters",
    
    inputMode: "text",
  },

  TEXTAREA_DESC: {
    message: "Please enter a description.",
    minLength: 10,
    maxLength: 500,
    
    inputMode: "text",
  },

  PLACE: {
    pattern: "^[\\p{L}\\p{M}0-9\\s\\/\\-]{2,50}$",
    message: "Allowed: letters, numbers, spaces, -, and /.",
    minLength: 2,
    maxLength: 50,
    allow: "[\\p{L}\\p{M}0-9\\s/\\-]",
   // 
    inputMode: "text",
  },


    // ---------------- Trade License ----------------

  TRADE_BUSINESS_NAME: {
    // Business/Firm/Shop name can include letters, digits and common symbols
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s&.,'()\\/-]{2,100}$",
    message:
      "Use letters, numbers, spaces and & . , ' ( ) / - only.",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s&.,'()/\\-]",
    inputMode: "text",
  },

  IFSC: {
    // Standard IFSC: 4 letters + 0 + 6 alphanumerics
    pattern: "^[A-Z]{4}0[A-Z0-9]{6}$",
    message: "Enter a valid IFSC code (e.g., HDFC0001234).",
    exactLength: 11,
    allow: "[A-Za-z0-9]",
    normalize: ["trim", "removeSpaces", "uppercase"],
    inputMode: "text",
  },

  BANK_ACCOUNT_NO: {
    // Most bank accounts are 9–18 digits (safe practical range)
    pattern: "^\\d{9,18}$",
    message: "Enter a valid account number.",
    minLength: 9,
    maxLength: 18,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
    customValidate: ((value: any) => {
      const v = String(value ?? "").replace(/\s+/g, "");
      if (v === "") return null;
      if (v.startsWith("0")) return "Account number should not start with 0.";
      return null;
    }) as unknown as CustomValidate,
  },

  BANK_NAME: {
    pattern: "^[A-Za-z\\p{L}\\p{M}\\s.'-]{2,100}$",
    message: "Bank name must use letters, spaces, . ' - only.",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z\\p{L}\\p{M}\\s.'\\-]",
    
    inputMode: "text",
  },

  BRANCH_NAME: {
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s.'()\\/-]{2,100}$",
    message: "Branch name must use letters, numbers, spaces, . ' ( ) / - only.",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s.'()/\\-]",
    
    inputMode: "text",
  },

  LICENSE_OR_PERMISSION_NO: {
    // More focused than CERT_OR_ORDER_NO (commonly used for old license/current permission no)
    pattern: "^[A-Za-z0-9\\s/\\-()]{1,30}$",
    message: "Allowed: letters, numbers, spaces, / - ( ) only.",
    maxLength: 30,
    allow: "[A-Za-z0-9\\s/\\-()]",
    
    inputMode: "text",
  },

//// water department
// ---------------- Identifiers ----------------
  WATER_CONSUMER_NO: {
    // Covers: consumerNumber, waterConnectionNo, waterConnectionNumber
    pattern: "^[A-Za-z0-9\\/\\-]{1,25}$",
    message: "Enter a valid Consumer/Connection Number (e.g., 12345/A).",
    maxLength: 25,
    allow: "[A-Za-z0-9/\\-]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },

  OLD_CONNECTION_ID: {
    // Covers: oldConnectionId
    pattern: "^[A-Za-z0-9\\/\\-]{1,30}$",
    message: "Enter a valid Old Connection ID.",
    maxLength: 30,
    allow: "[A-Za-z0-9/\\-]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },

  CITY_SERVE_NO: {
    // Covers: cityServeNumber
    pattern: "^[A-Za-z0-9\\/\\-]{1,25}$",
    message: "Enter a valid City Serve Number.",
    allow: "alphanumeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },

  // ---------------- Technical Specs & Measurements ----------------
  TAP_SIZE_INCH: {
    // Covers: tapSizeInch, connectionSizeInches
    // Allows decimals: 0.5, 0.75, 1, 1.5
    pattern: "^\\d+(\\.\\d{1,3})?$",
    message: "Enter valid size in inches (e.g., 0.5, 1.5).",
    maxLength: 10,
    allow: "decimal",
    normalize: ["trim", "removeSpaces"],
    inputMode: "decimal",
  },

  TAP_SIZE_MM: {
    // Covers: tapSizeMm
    // Allows integers: 15, 20, 25, 40
    pattern: "^\\d+$",
    message: "Enter valid size in MM (e.g., 15, 20).",
    maxLength: 5,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
  },

  PIPE_METER_SIZE_DESC: {
    // Covers: pipeSize, meterSize, tapSize (when text input)
    // Allows mixed format: "15mm PVC", "0.5 inch Iron"
    pattern: "^[A-Za-z0-9\\s\\.\\/\\-\\\"']{1,50}$",
    message: "Enter valid size description.",
    maxLength: 50,
    allow: "[A-Za-z0-9\\s./\\-\"']",
    
    inputMode: "text",
  },

  DISTANCE_FEET: {
    // Covers: distanceFromMainLine, distance, connectionSizeFeet
    pattern: "^\\d+(\\.\\d{1,2})?$",
    message: "Enter distance in feet.",
    allow: "decimal",
    normalize: ["trim", "removeSpaces"],
    inputMode: "decimal",
  },

  METER_READING: {
    // Covers: meterReading
    pattern: "^\\d+(\\.\\d{1,4})?$",
    message: "Enter valid meter reading.",
    allow: "decimal",
    normalize: ["trim", "removeSpaces"],
    inputMode: "decimal",
  },

  // ---------------- Counts (People & Connections) ----------------
  COUNT_INTEGER: {
    // Covers: totalPerson, requiredNoOfTapConnection, existingTapConnectionsNumber, 
    // totalTenants, septicLichpitCount, totalResidentialPeople, totalRenterCount
    pattern: "^\\d+$",
    message: "Enter a valid whole number.",
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
    customValidate: ((value: any) => {
      const n = Number(value);
      if (n < 0) return "Count cannot be negative.";
      return null;
    }) as any,
  },

  // ---------------- Plumber Details ----------------
  PLUMBER_NAME: {
    // Covers: plumberName
    pattern: "^[\\p{L}\\p{M}\\s\\.]{2,100}$",
    message: "Only letters, spaces and dots allowed.",
    minLength: 2,
    maxLength: 100,
    allow: "letters",
    
    inputMode: "text",
  },

  PLUMBER_LICENSE_NO: {
    // Covers: plumberLicenseNo
    pattern: "^[A-Za-z0-9\\/\\-]{1,25}$",
    message: "Enter valid License Number.",
    maxLength: 25,
    allow: "alphanumeric",
    normalize: ["trim", "removeSpaces", "uppercase"],
    inputMode: "text",
  },

  // ---------------- Financial ----------------
  WATER_TAX_AMOUNT: {
    // Covers: currentWaterTaxAmount
    pattern: "^\\d+(\\.\\d{1,2})?$",
    message: "Enter valid tax amount.",
    allow: "decimal",
    normalize: ["trim", "removeSpaces", "removeCommas"],
    inputMode: "decimal",
  },

  // ---------------- Property / Land Records (Water Specific) ----------------
  PLOT_OR_HISSA_NO: {
    // Covers: plotNumber
    pattern: "^[A-Za-z0-9\\/\\-\\s]{1,20}$",
    message: "Enter valid Plot/Hissa Number.",
    maxLength: 20,
    allow: "[A-Za-z0-9/\\-\\s]",
    
    inputMode: "text",
  },

  // ---------------- Complaints & Descriptions ----------------
  COMPLAINT_DETAILS: {
    // Covers: existingTapConnectionDetail, comment, unauthorizedPropertyFullAddress, applicantAreaDetails
    message: "Please provide specific details.",
    minLength: 5,
    maxLength: 500,
    allow: "[\\p{L}\\p{M}0-9\\s.,/\\-()@#&]", 
    
    inputMode: "text",
  },

  CONNECTION_DETAIL_LONG: {
    // Covers: newTapConnectionDetail
    message: "Please provide connection details (max 500 chars).",
    minLength: 5,
    maxLength: 500,
    allow: "[\\p{L}\\p{M}0-9\\s.,/\\-()@#&]", 
    
    inputMode: "text",
  },
  /// NOC |
  // ---------------- Organization & Entity Names ----------------
  MANDAL_ORG_NAME: {
    // Covers: mandalName, chairmanName (if organization)
    message: "Enter a valid Mandal or Organization name.",
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s&.,'()\\/-]{2,100}$",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s&.,'()/\\-]",
    
    inputMode: "text",
  },

  AGENCY_NAME: {
    // Covers: installerAgency, structuralEngineerName
    message: "Enter a valid Agency or Engineer name.",
    pattern: "^[A-Za-z\\p{L}\\p{M}\\s.'&-]{2,100}$",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z\\p{L}\\p{M}\\s.'&-]",
    
    inputMode: "text",
  },

  GOVT_STATION_NAME: {
    // Covers: policeStation, trafficPoliceStation, fireStation
    message: "Enter valid Station Name (e.g., Shivaji Nagar Police Station).",
    pattern: "^[A-Za-z\\p{L}\\p{M}\\s.'-]{2,100}$",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z\\p{L}\\p{M}\\s.'-]",
    
    inputMode: "text",
  },

  // ---------------- Licenses & Registration Numbers ----------------
  CHARITY_REG_NO: {
    // Covers: registrationNo (e.g., F-1234/PUNE)
    message: "Enter valid Registration No. (e.g., F-1234/DIST).",
    pattern: "^[A-Za-z0-9\\/\\-\\s]{1,25}$",
    maxLength: 25,
    allow: "[A-Za-z0-9/\\-\\s]",
    normalize: ["trim", "removeSpaces", "uppercase"],
    inputMode: "text",
  },

  FSSAI_LICENSE_NO: {
    // Covers: fssaiLicense
    message: "Enter a valid 14-digit FSSAI License number.",
    pattern: "^[0-9]{14}$",
    exactLength: 14,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
  },

  // ---------------- Technical & Safety Metrics ----------------
  ELECTRICAL_LOAD_KW: {
    // Covers: electricalLoad
    message: "Enter valid load in kW (e.g., 5.5).",
    pattern: "^\\d+(\\.\\d{1,3})?$",
    maxLength: 10,
    allow: "decimal",
    normalize: ["trim", "removeSpaces"],
    inputMode: "decimal",
  },

  STRUCTURAL_DIMENSION: {
    // Covers: mandapArea, mandapHeight, totalBuiltupArea
    message: "Enter valid dimension (numbers and decimals only).",
    pattern: "^\\d+(\\.\\d{1,2})?$",
    maxLength: 10,
    allow: "decimal",
    normalize: ["trim", "removeSpaces"],
    inputMode: "decimal",
  },

  FIRE_EQUIPMENT_COUNT: {
    // Covers: extinguisherCount, emergencyExits, extinguisherCountProposed
    message: "Enter a valid count (whole number).",
    pattern: "^\\d+$",
    maxLength: 5,
    allow: "numeric",
    normalize: ["trim", "removeSpaces"],
    inputMode: "numeric",
    customValidate: ((value: any) => {
      if (Number(value) < 0) return "Count cannot be negative.";
      return null;
    }) as any,
  },

  FIRE_SAFETY_DENSITY: {
    // Covers: extinguisherDensity
    message: "Enter density value (e.g. 2.5).",
    pattern: "^\\d+(\\.\\d{1,2})?$",
    maxLength: 6,
    allow: "decimal",
    normalize: ["trim", "removeSpaces"],
    inputMode: "decimal",
  },

  // ---------------- Descriptive Text Areas ----------------
  HAZARDOUS_MATERIAL_DESC: {
    // Covers: flammableGoodsDetail, flammableMaterialDetails, flammableMaterialDetailsProposed
    message: "Please specify details of hazardous materials (max 500 chars).",
    minLength: 2,
    maxLength: 500,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s.,;:%/\\-()@#&]", 
    
    inputMode: "text",
  },

  MUSTER_POINT_DESC: {
    // Covers: musterPoint, musterPointProposed
    message: "Describe the Assembly/Muster point location.",
    minLength: 5,
    maxLength: 300,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s.,/\\-()]",
    
    inputMode: "text",
  },
  
  MAP_DETAILS_TEXT: {
    // Covers: buildingDetailsAsMap
    message: "Provide details matching the approved map.",
    minLength: 10,
    maxLength: 1000, // Longer limit for detailed map descriptions
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s.,;:%/\\-()@#&]",
    
    inputMode: "text",
  },WORKING_HOURS: {
    // Covers: workingHours (e.g., "09:00 AM to 06:00 PM", "24 Hours")
    message: "Enter valid working hours (e.g., 9 AM - 6 PM).",
    pattern: "^[\\p{L}\\p{M}0-9\\s:\\-\\.]+$", 
    minLength: 3,
    maxLength: 50,
    allow: "[\\p{L}\\p{M}0-9\\s:\\-\\.]",
    
    inputMode: "text",
  },

  // ---------------- Materials & Structural Items ----------------
  MATERIAL_DESC: {
    // Covers: beamMaterial (e.g., "Wood, Iron & Steel")
    // The previous 'NAME' rule didn't allow commas or '&'
    message: "Enter material details (letters, numbers, comma, & allowed).",
    pattern: "^[\\p{L}\\p{M}0-9\\s,&\\-\\/]+$",
    minLength: 2,
    maxLength: 100,
    allow: "[\\p{L}\\p{M}0-9\\s,&\\-\\/]",
    
    inputMode: "text",
  },

  // ---------------- Generic Categories ----------------
  CATEGORY_TEXT: {
    // Covers: specialCategory
    // A bit more flexible than 'PURPOSE'
    message: "Enter the category name.",
    pattern: "^[\\p{L}\\p{M}0-9\\s\\(\\)\\-\\.,]+$",
    minLength: 2,
    maxLength: 100,
    allow: "[\\p{L}\\p{M}0-9\\s\\(\\)\\-\\.,]",
    
    inputMode: "text",
  },

  // ---------------- IDs & Reference Numbers ----------------
  GENERIC_ID_NO: {
    // Covers: propertyTaxReceiptNo (if different from assessment no)
    // Covers generic ref numbers that might have dots or underscores
    message: "Enter a valid reference number.",
    pattern: "^[A-Za-z0-9\\-\\.\\/]+$",
    minLength: 3,
    maxLength: 30,
    allow: "[A-Za-z0-9\\-\\.\\/]",
    normalize: ["trim", "removeSpaces"],
    inputMode: "text",
  },
  /// birth and death department
  // ---------------- Personal Identity (Names) ----------------
  PERSON_NAME: {
    // Covers: deceased, child, mother, father, informant names
    message: "Name must contain only letters, spaces, or dots.",
    pattern: "^[\\p{L}\\p{M}\\s\\.]{1,100}$",
    minLength: 1,
    maxLength: 100,
    allow: "letters",
    
    inputMode: "text",
  },

  // ---------------- Time & Age ----------------
  TIME_24H: {
    // Covers: timeOfDeath
    message: "Enter valid time in HH:MM (24-hour) format (e.g., 14:30).",
    pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
    exactLength: 5,
    allow: "[0-9:]",
    
    inputMode: "text",
  },

  AGE_HUMAN_LIFESPAN: {
    // Covers: age (Death certificate)
    message: "Age must be between 0 and 150.",
    min: 0,
    max: 150,
    allow: "numeric",
    inputMode: "numeric",
    customValidate: ((value: any) => {
       const n = Number(value);
       return n >= 0 && n <= 150 ? null : "Invalid age.";
    }) as any
  },

  AGE_MATERNAL_MARRIAGE: {
    // Covers: motherAgeAtMarriage
    message: "Age at marriage must be between 18 and 100.",
    min: 18,
    max: 100,
    allow: "numeric",
    inputMode: "numeric",
  },

  AGE_MATERNAL_BIRTH: {
    // Covers: motherAgeAtBirth
    message: "Age at birth must be between 15 and 100.",
    min: 15,
    max: 100,
    allow: "numeric",
    inputMode: "numeric",
  },

  CHILD_COUNT: {
    // Covers: childrenBornAlive
    message: "Number must be between 1 and 30.",
    min: 1,
    max: 30,
    allow: "numeric",
    inputMode: "numeric",
  },

  // ---------------- IDs & Verification ----------------
  AADHAAR_FLEX: {
    // Covers: childAadhaar (allows 12 digits OR XXXX-XXXX-XXXX)
    message: "Enter valid Aadhaar (12 digits or XXXX-XXXX-XXXX).",
    pattern: "^[0-9]{12}$|^[0-9]{4}-[0-9]{4}-[0-9]{4}$",
    maxLength: 14,
    allow: "[0-9\\-]",
    
    inputMode: "numeric",
  },

  LAST_4_DIGITS: {
    // Covers: addressProofLast4Digits
    message: "Enter exactly the last 4 digits.",
    pattern: "^[0-9]{4}$",
    exactLength: 4,
    allow: "numeric",
    inputMode: "numeric",
  },

  FIR_NUMBER: {
    // Covers: firCaseNumber
    message: "Allowed: Alphanumeric, /, -, space.",
    pattern: "^[A-Za-z0-9\\/\\-\\s]{1,30}$",
    maxLength: 30,
    allow: "[A-Za-z0-9/\\-\\s]",
    
    inputMode: "text",
  },

  REGISTRATION_NO_BD: {
    // Covers: registrationNo (Birth/Death)
    message: "Enter valid Registration Number.",
    pattern: "^[A-Za-z0-9\\/\\-\\.\\s]{1,50}$",
    maxLength: 50,
    allow: "[A-Za-z0-9/\\-\\.\\s]",
    
    inputMode: "text",
  },

  // ---------------- Institutional & Locations ----------------
  HOSPITAL_NAME: {
    // Covers: hospitalName, firstTreatmentHospital, deathDeclaredHospital
    message: "Enter valid Hospital/Institution name.",
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s\\.,'&\\-()]{2,100}$",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s.,'&\\-()]",
    
    inputMode: "text",
  },

  POLICE_STATION_NAME: {
    // Covers: policeStation
    message: "Enter valid Police Station name.",
    pattern: "^[A-Za-z\\p{L}\\p{M}\\s\\.\\-]{2,100}$",
    minLength: 2,
    maxLength: 100,
    allow: "[A-Za-z\\p{L}\\p{M}\\s.\\-]",
    
    inputMode: "text",
  },

  // ---------------- Address Components ----------------
  ADDRESS_TEXTAREA: {
    // Covers: incidentPlaceLocality, birthPlaceAddress, deathAddress, informantAddress
    message: "Address contains invalid characters.",
    pattern: "^[A-Za-z0-9\\p{L}\\p{M}\\s,./\\-()#:]+$",
    minLength: 5,
    maxLength: 250,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s,./\\-()#:]",
    
    inputMode: "text",
  },

  CITY_DISTRICT_STATE: {
    // Covers: incidentPlaceTown, incidentPlaceDistrict, birthPlaceState, etc.
    message: "Use letters, spaces, dots or hyphens only.",
    pattern: "^[A-Za-z\\p{L}\\p{M}\\s\\.\\-]{2,50}$",
    maxLength: 50,
    allow: "[A-Za-z\\p{L}\\p{M}\\s.\\-]",
    
    inputMode: "text",
  },

  PINCODE_6: {
    // Covers: incidentPlacePinCode, birthPlacePinCode, etc.
    message: "Enter a valid 6-digit Pincode.",
    pattern: "^[1-9][0-9]{5}$",
    exactLength: 6,
    allow: "numeric",
    inputMode: "numeric",
  },

  // ---------------- Miscellaneous ----------------
  REMARKS_TEXT: {
    // Covers: registrarRemarks
    message: "Remarks allows alphanumeric and punctuation.",
    maxLength: 500,
    allow: "[A-Za-z0-9\\p{L}\\p{M}\\s.,;:\\-()?!]",
    
    inputMode: "text",
  },

  REGISTRATION_UNIT: {
    // Covers: registrationUnit
    message: "Enter valid Registration Unit.",
    pattern: "^[A-Za-z0-9\\s\\-\\/\\(\\)]{1,50}$",
    maxLength: 50,
    allow: "[A-Za-z0-9\\s\\-/()]",
    inputMode: "text",
  },
  CC_NO: {
    pattern: "^[A-Za-z0-9/\\-]{5,50}$",
    message: "Enter a valid CC Number (e.g., PMRDA/2026/1573015).",
    allow: "[A-Za-z0-9/\\-]",
    inputMode: "text",
    // Custom validator to check format against 2026 municipal standards
    customValidate: "validateCCFormat" as CustomValidate,
  },
};
