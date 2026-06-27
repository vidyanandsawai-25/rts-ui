// @ts-nocheck
import { ServiceFormConfig , createAddressFieldsWithCity, declarationField, createApplicantInformationFields } from "./formTypes";

export const birthDeathFormConfigs: Record<string, ServiceFormConfig> = {
  
  // 2. DEATH CERTIFICATE (7205) - OPTIMIZED
  // ------------------------------------------
  "7205": {
    serviceId: "7205",
    steps: [
      {
        id: "applicant-info",
        title: {
          en: "Applicant Information",
          hi: "आवेदक की जानकारी",
          mr: "अर्जदाराची माहिती",
        },
        fields: [
                    ...createApplicantInformationFields(),
                ],
      },
      
      {
        id: "deceased-details",
        title: {
          en: "Deceased Person Information",
          hi: "मृतक की जानकारी",
          mr: "मृत व्यक्तीची माहिती",
        },
        fields: [
          // SPLIT DECEASED NAME
          {
            id: "deceasedFirstName",
            type: "text",
            label: { en: "Deceased First Name", hi: "मृतक का पहला नाम", mr: "मृत व्यक्तीचे पहिले नाव" },
            required: true,
            colSpan: 1,
          },
          {
            id: "deceasedMiddleName",
            type: "text",
            label: { en: "Deceased Middle Name", hi: "मृतक का मध्य नाम", mr: "मृत व्यक्तीचे मधले नाव" },
            required: false,
            colSpan: 1,
          },
          {
            id: "deceasedLastName",
            type: "text",
            label: { en: "Deceased Last Name", hi: "मृतक का उपनाम", mr: "मृत व्यक्तीचे आडनाव" },
            required: true,
            colSpan: 1,
          },
          {
            id: "dateOfDeath",
            type: "date",
            label: {
              en: "Date of Death",
              hi: "मृत्यु तिथि",
              mr: "मृत्यू तारीख",
            },
            required: true,
            colSpan: 1,
          },
          {
            id: "timeOfDeath",
            type: "text",
            label: {
              en: "Time of Death",
              hi: "मृत्यु का समय",
              mr: "मृत्यू वेळ",
            },
            placeholder: {
              en: "HH:MM (24-hour format)",
              hi: "घं:मिनट (24-घंटे प्रारूप)",
              mr: "तास:मिनिटे (24-तास स्वरूप)",
            },
            required: true,
            colSpan: 1,
            validation: {
              pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
            },
          },
          {
            id: "age",
            type: "number",
            label: {
              en: "Age at Death",
              hi: "मृत्यु के समय आयु",
              mr: "मृत्यूच्या वेळी वय",
            },
            required: true,
            colSpan: 1,
            validation: { min: 0, max: 150 },
          },
          {
            id: "gender",
            type: "select",
            label: {
              en: "Gender",
              hi: "लिंग",
              mr: "लिंग",
            },
            required: true,
            colSpan: 1,
            options: [
              { value: "male", label: { en: "Male", hi: "पुरुष", mr: "पुरुष" } },
              { value: "female", label: { en: "Female", hi: "महिला", mr: "महिला" } },
              { value: "other", label: { en: "Other", hi: "अन्य", mr: "इतर" } },
            ],
          },
        ],
      },
      {
        id: "death-circumstance",
        title: {
          en: "Death Circumstance Details",
          hi: "मृत्यु परिस्थिति विवरण",
          mr: "मृत्यू परिस्थिती तपशील",
        },
        description: {
          en: "Provide details about the circumstances of death",
          hi: "मृत्यु की परिस्थितियों का विवरण प्रदान करें",
          mr: "मृत्यूच्या परिस्थितीचे तपशील द्या",
        },
        fields: [
          {
            id: "deathType",
            type: "select",
            label: {
              en: "Type of Death",
              hi: "मृत्यु का प्रकार",
              mr: "मृत्यूचा प्रकार",
            },
            required: true,
            colSpan: 1,
            options: [
              { value: "natural", label: { en: "Natural", hi: "प्राकृतिक", mr: "नैसर्गिक" } },
              { value: "accidental", label: { en: "Accidental/External Cause", hi: "दुर्घटना/बाह्य कारण", mr: "अपघात/बाह्य कारण" } },
            ],
          },
          {
            id: "deathNature",
            type: "select",
            label: {
              en: "Nature of Death (If Accidental)",
              hi: "मृत्यु की प्रकृति (यदि दुर्घटना)",
              mr: "मृत्यूचे स्वरूप (जर अपघात)",
            },
            required: false,
            colSpan: 1,
            options: [
              { value: "accident", label: { en: "Accidental", hi: "दुर्घटना", mr: "अपघाताने" } },
              { value: "suicide", label: { en: "Suicide", hi: "आत्महत्या", mr: "आत्महत्या" } },
              { value: "homicide", label: { en: "Homicide", hi: "हत्या", mr: "खून" } },
              { value: "other", label: { en: "Other", hi: "अन्य", mr: "इतर" } },
            ],
          },
          
          // Incident Address
          {
            id: "incidentPlaceHouseNo",
            type: "text",
            label: { en: "Incident House No.", hi: "घटना घर नंबर", mr: "घटना घर क्रमांक" },
            required: false,
            colSpan: 1,
          },
          {
            id: "incidentPlaceLocality",
            type: "textarea", // Textarea for detailed address
            label: { en: "Incident Locality/Area", hi: "घटना इलाका/क्षेत्र", mr: "घटना परिसर/क्षेत्र" },
            required: false,
            colSpan: 1,
          },
          {
            id: "incidentPlaceTown",
            type: "text",
            label: { en: "Town/City", hi: "शहर", mr: "शहर" },
            required: false,
            colSpan: 1,
          },
          {
            id: "incidentPlaceDistrict",
            type: "text",
            label: { en: "District", hi: "जिला", mr: "जिल्हा" },
            required: false,
            colSpan: 1,
          },
          {
            id: "incidentPlaceState",
            type: "text",
            label: { en: "State", hi: "राज्य", mr: "राज्य" },
            required: false,
            colSpan: 1,
          },
          {
            id: "incidentPlacePinCode",
            type: "text",
            label: { en: "PIN Code", hi: "पिन कोड", mr: "पिन कोड" },
            required: false,
            colSpan: 1,
            validation: { pattern: "^[0-9]{6}$", maxLength: 6 },
          },
          {
            id: "policeStation",
            type: "text",
            label: { en: "Police Station Name", hi: "पुलिस स्टेशन का नाम", mr: "पोलीस स्टेशन नाव" },
            required: false,
            colSpan: 1,
          },
          {
            id: "firCaseNumber",
            type: "text",
            label: { en: "FIR / Case Number", hi: "एफआईआर / केस नंबर", mr: "एफआयआर / केस क्रमांक" },
            required: false,
            colSpan: 1,
          },
          
          // Hospital Details
          {
            id: "firstTreatmentHospital",
            type: "text",
            label: {
              en: "First Medical Treatment Hospital Name",
              hi: "प्रथम चिकित्सा उपचार अस्पताल का नाम",
              mr: "प्रथम वैद्यकीय उपचार रुग्णालय नाव",
            },
            required: false,
            colSpan: 1, // Full width for hospital name
          },
          {
            id: "firstTreatmentAddress",
            type: "textarea", // Textarea for address
            label: {
              en: "First Treatment Hospital Address",
              hi: "प्रथम उपचार अस्पताल का पता",
              mr: "प्रथम उपचार रुग्णालय पत्ता",
            },
            required: false,
            colSpan: 1,
          },
          {
            id: "deathDeclaredHospital",
            type: "text",
            label: {
              en: "Death Declared Hospital Name",
              hi: "मृत्यु घोषित अस्पताल का नाम",
              mr: "मृत्यू घोषित रुग्णालय नाव",
            },
            required: false,
            colSpan: 1,
          },
          {
            id: "deathDeclaredAddress",
            type: "textarea", // Textarea for address
            label: {
              en: "Death Declared Hospital Address",
              hi: "मृत्यु घोषित अस्पताल का पता",
              mr: "मृत्यू घोषित रुग्णालय पत्ता",
            },
            required: false,
            colSpan: 1,
          },
        ],
      },
      {
        id: "death-place",
        title: {
          en: "Place of Death",
          hi: "मृत्यु स्थान",
          mr: "मृत्यू ठिकाण",
        },
        fields: [
          {
            id: "placeOfDeathType",
            type: "select",
            label: {
              en: "Place of Death",
              hi: "मृत्यु स्थान",
              mr: "मृत्यू ठिकाण",
            },
            required: true,
            colSpan: 1,
            options: [
              { value: "hospital", label: { en: "Hospital", hi: "अस्पताल", mr: "रुग्णालय" } },
              { value: "home", label: { en: "Home", hi: "घर", mr: "घर" } },
              { value: "road", label: { en: "Road/Public Place", hi: "सड़क/सार्वजनिक स्थान", mr: "रस्ता/सार्वजनिक ठिकाण" } },
            ],
          },
          {
            id: "hospitalName",
            type: "text",
            label: {
              en: "Hospital/Institution Name",
              hi: "अस्पताल/संस्था का नाम",
              mr: "रुग्णालय/संस्था नाव",
            },
            required: false,
            colSpan: 1,
          },
          
          // Death Address (Manual Textarea)
          {
            id: "deathAddress",
            type: "textarea",
            label: { en: "Complete Death Address", hi: "मृत्यु का पूरा पता", mr: "मृत्यूचा संपूर्ण पत्ता" },
            required: true,
            colSpan: 1,
          },
          {
            id: "deathPinCode",
            type: "text",
            label: { en: "PIN Code", hi: "पिन कोड", mr: "पिन कोड" },
            required: false,
            colSpan: 1,
            validation: { pattern: "^[0-9]{6}$", maxLength: 6 },
          },
        ],
      },
      {
        id: "digital-deactivation",
        title: {
          en: "Digital Identity Deactivation Matrix",
          hi: "डिजिटल पहचान निष्क्रियता मैट्रिक्स",
          mr: "डिजिटल ओळख निष्क्रियता मॅट्रिक्स",
        },
        description: {
          en: "Request deactivation of digital identities and accounts",
          hi: "डिजिटल पहचान और खातों के निष्क्रियता का अनुरोध करें",
          mr: "डिजिटल ओळख आणि खात्यांच्या निष्क्रियतेची विनंती करा",
        },
        fields: [
          {
            id: "deactivateAadhaar",
            type: "select",
            label: { en: "Aadhaar Deactivation", hi: "आधार निष्क्रियता", mr: "आधार निष्क्रियता" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }],
          },
          {
            id: "deactivatePAN",
            type: "select",
            label: { en: "PAN Deactivation", hi: "पैन निष्क्रियता", mr: "पॅन निष्क्रियता" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }],
          },
          {
            id: "cancelPassport",
            type: "select",
            label: { en: "Passport Cancellation", hi: "पासपोर्ट रद्दीकरण", mr: "पासपोर्ट रद्द करणे" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }, { value: "not-applicable", label: { en: "Not Applicable", hi: "लागू नहीं", mr: "लागू नाही" } }],
          },
          {
            id: "deleteVoterID",
            type: "select",
            label: { en: "Voter ID Deletion", hi: "मतदाता पहचान पत्र हटाना", mr: "मतदार ओळखपत्र हटवणे" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }],
          },
          {
            id: "terminatePension",
            type: "select",
            label: { en: "Pension Account Termination", hi: "पेंशन खाता समाप्ति", mr: "पेन्शन खाते बंद करणे" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }, { value: "not-applicable", label: { en: "Not Applicable", hi: "लागू नहीं", mr: "लागू नाही" } }],
          },
          {
            id: "freezeBankAccount",
            type: "select",
            label: { en: "Bank Account Freeze Notification", hi: "बैंक खाता फ्रीज सूचना", mr: "बँक खाते फ्रीझ सूचना" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }],
          },
          {
            id: "deactivateSIM",
            type: "select",
            label: { en: "SIM/Telecom Deactivation", hi: "सिम/टेलीकॉम निष्क्रियता", mr: "सिम/दूरसंचार निष्क्रियता" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }],
          },
          {
            id: "closeDigitalWallet",
            type: "select",
            label: { en: "UPI/Digital Wallet Closure", hi: "यूपीआई/डिजिटल वॉलेट बंद करना", mr: "यूपीआय/डिजिटल वॉलेट बंद करणे" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }],
          },
          {
            id: "notifyInsurance",
            type: "select",
            label: { en: "Insurance Company Notification", hi: "बीमा कंपनी सूचना", mr: "विमा कंपनी सूचना" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }, { value: "not-applicable", label: { en: "Not Applicable", hi: "लागू नहीं", mr: "लागू नाही" } }],
          },
          {
            id: "notifyLoanCredit",
            type: "select",
            label: { en: "Loan/Credit Liability Notification", hi: "ऋण/क्रेडिट देयता सूचना", mr: "कर्ज/क्रेडिट जबाबदारी सूचना" },
            required: true,
            colSpan: 1,
            options: [{ value: "yes", label: { en: "Yes", hi: "हां", mr: "होय" } }, { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } }, { value: "not-applicable", label: { en: "Not Applicable", hi: "लागू नहीं", mr: "लागू नाही" } }],
          },
          {
            id: "digitalDeactivationConsent",
            type: "select",
            label: { en: "Consent Declaration", hi: "सहमति घोषणा", mr: "संमती घोषणा" },
            required: true,
            colSpan: 1,
            options: [{ value: "agree", label: { en: "I give consent for government departments to deactivate all digital identities associated with the deceased as per law", hi: "मैं मृतक से जुड़ी सभी डिजिटल पहचानों को कानून के अनुसार निष्क्रिय करने के लिए सरकारी विभागों को सहमति देता/देती हूं", mr: "मी मृत व्यक्तीशी संबंधित सर्व डिजिटल ओळख कायद्यानुसार निष्क्रिय करण्यासाठी सरकारी विभागांना संमती देतो" } }],
          },
        ],
      },
      {
        id: "address-verification",
        title: {
          en: "Permanent Address Verification",
          hi: "स्थायी पता सत्यापन",
          mr: "कायमचा पत्ता पडताळणी",
        },
        description: {
          en: "Verify the permanent address of the deceased",
          hi: "मृतक के स्थायी पते को सत्यापित करें",
          mr: "मृत व्यक्तीचा कायमचा पत्ता पडताळा",
        },
        fields: [
          {
            id: "addressVerifiedUsing",
            type: "select",
            label: {
              en: "Permanent Address Verified Using",
              hi: "स्थायी पता का उपयोग करके सत्यापित",
              mr: "कायमचा पत्ता वापरून पडताळला",
            },
            required: true,
            colSpan: 1,
            options: [
              { value: "aadhaar", label: { en: "Aadhaar", hi: "आधार", mr: "आधार" } },
              { value: "passport", label: { en: "Passport", hi: "पासपोर्ट", mr: "पासपोर्ट" } },
              { value: "utility-bill", label: { en: "Utility Bill", hi: "उपयोगिता बिल", mr: "युटिलिटी बिल" } },
              { value: "ration-card", label: { en: "Ration Card", hi: "राशन कार्ड", mr: "रेशन कार्ड" } },
              { value: "tax-receipt", label: { en: "Municipal Tax Receipt", hi: "नगरपालिका कर रसीद", mr: "नगरपालिका कर पावती" } },
              { value: "other", label: { en: "Other", hi: "अन्य", mr: "इतर" } },
            ],
          },
          {
            id: "verifiedByRegistrar",
            type: "select",
            label: {
              en: "Verified by Registrar",
              hi: "रजिस्ट्रार द्वारा सत्यापित",
              mr: "रजिस्ट्रारद्वारे पडताळले",
            },
            required: false,
            colSpan: 1,
            options: [
              { value: "yes", label: { en: "Yes, Verified", hi: "हां, सत्यापित", mr: "होय, पडताळले" } },
              { value: "pending", label: { en: "Pending Verification", hi: "सत्यापन लंबित", mr: "पडताळणी प्रलंबित" } },
            ],
          },
        ],
      },
      {
      id: 'declaration',
      title: {
        en: 'Declaration',
        hi: 'घोषणा',
        mr: 'घोषणापत्र'
      },
      fields: [
        ...declarationField(),
      ]
    }
    ],
    documents: [
      {
        id: "deathCertificate",
        label: {
          en: "Hospital/Medical Death Certificate",
          hi: "अस्पताल/चिकित्सा मृत्यु प्रमाणपत्र",
          mr: "रुग्णालय/वैद्यकीय मृत्यू प्रमाणपत्र",
        },
        description: {
          en: "Death certificate issued by hospital/doctor",
          hi: "अस्पताल/डॉक्टर द्वारा जारी मृत्यु प्रमाणपत्र",
          mr: "रुग्णालय/डॉक्टर द्वारे जारी मृत्यू प्रमाणपत्र",
        },
        required: true,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
      {
        id: "idProofDeceased",
        label: {
          en: "ID Proof of Deceased",
          hi: "मृतक का पहचान प्रमाण",
          mr: "मृत व्यक्तीचा ओळख पुरावा",
        },
        description: {
          en: "Aadhaar/Voter ID/Any ID of deceased person",
          hi: "मृतक व्यक्ति का आधार/वोटर आईडी/कोई पहचान",
          mr: "मृत व्यक्तीचे आधार/मतदार ओळखपत्र/कोणतेही ओळखपत्र",
        },
        required: true,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
      {
        id: "applicantIdProof",
        label: {
          en: "Applicant ID Proof",
          hi: "आवेदक का पहचान प्रमाण",
          mr: "अर्जदाराचा ओळख पुरावा",
        },
        description: {
          en: "Aadhaar/PAN/Voter ID",
          hi: "आधार/पैन/वोटर आईडी",
          mr: "आधार/पॅन/मतदार ओळखपत्र",
        },
        required: true,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
      {
        id: "addressProof",
        label: {
          en: "Address Verification Document",
          hi: "पता सत्यापन दस्तावेज़",
          mr: "पत्ता पडताळणी कागदपत्र",
        },
        description: {
          en: "Document used for address verification",
          hi: "पते के सत्यापन के लिए उपयोग किया गया दस्तावेज़",
          mr: "पत्ता पडताळणीसाठी वापरलेले कागदपत्र",
        },
        required: true,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
    ],
  },

  // ------------------------------------------
  // 1. BIRTH CERTIFICATE (7175)
  // ------------------------------------------
  "7204": {
    serviceId: "7204",
    steps: [
      {
        id: "child-birth-registrar-details",
        title: {
          en: "Section 1 — Child, Birth & Registrar Details",
          hi: "खंड 1 — बच्चा, जन्म और रजिस्ट्रार विवरण",
          mr: "कलम 1 — मूल, जन्म आणि रजिस्ट्रार तपशील",
        },
        description: {
          en: "Complete details of the child, place of birth, and registration",
          hi: "बच्चे, जन्म स्थान और पंजीकरण का पूरा विवरण",
          mr: "बाळाचे, जन्म ठिकाण आणि नोंदणीचे संपूर्ण तपशील",
        },
        fields: [
          // --- SECTION 1: CHILD DETAILS ---
          {
            id: "dateOfBirth",
            type: "date",
            label: { en: "Date of Birth (DD-MM-YYYY)", hi: "जन्म तिथि", mr: "जन्म तारीख" },
            required: true,
            colSpan: 1, // Kept as 1
          },
          {
            id: "gender",
            type: "select",
            label: { en: "Sex", hi: "लिंग", mr: "लिंग" },
            required: true,
            colSpan: 1, // Kept as 1
            options: [
              { value: "Male", label: { en: "Male", hi: "पुरुष", mr: "पुरुष" } },
              { value: "Female", label: { en: "Female", hi: "महिला", mr: "महिला" } },
              { value: "Transgender Person", label: { en: "Transgender", hi: "ट्रांसजेंडर", mr: "ट्रान्सजेंडर" } },
            ],
          },
          {
            id: "childFirstName",
            type: "text",
            label: { en: "Child First Name", hi: "बच्चे का पहला नाम", mr: "मुलाचे पहिले नाव" },
            required: true,
            colSpan: 1, // Kept as 1
          },
          {
            id: "childMiddleName",
            type: "text",
            label: { en: "Child Middle Name", hi: "बच्चे का मध्य नाम", mr: "मुलाचे मधले नाव" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "childLastName",
            type: "text",
            label: { en: "Child Last Name", hi: "बच्चे का उपनाम", mr: "मुलाचे आडनाव" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "childAadhaar",
            type: "text",
            label: { en: "Aadhaar No. (Optional)", hi: "आधार नं.", mr: "आधार क्र." },
            placeholder: { en: "XXXX-XXXX-XXXX", hi: "XXXX-XXXX-XXXX", mr: "XXXX-XXXX-XXXX" },
            required: false,
            colSpan: 1, // Kept as 1
            validation: { pattern: "^[0-9]{12}$|^[0-9]{4}-[0-9]{4}-[0-9]{4}$", maxLength: 14 },
          },

          // --- SECTION 2: PLACE OF BIRTH ---
          {
            id: "placeOfBirthType",
            type: "select",
            label: { en: "Place of Birth Type", hi: "जन्म स्थान का प्रकार", mr: "जन्म ठिकाणाचा प्रकार" },
            required: true,
            colSpan: 1, // Kept as 1
            options: [
              { value: "hospital", label: { en: "Hospital / Institution", hi: "अस्पताल", mr: "रुग्णालय" } },
              { value: "house", label: { en: "House", hi: "घर", mr: "घर" } },
              { value: "other", label: { en: "Other Place", hi: "अन्य स्थान", mr: "इतर ठिकाण" } },
            ],
          },
          {
            id: "hospitalName",
            type: "text",
            label: { en: "Hospital / Institution Name", hi: "अस्पताल का नाम", mr: "रुग्णालय नाव" },
            placeholder: { en: "If applicable", hi: "यदि लागू", mr: "लागू असल्यास" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          
          // REPLACED individual address fields with TEXTAREA (colSpan: 2 for full width)
          {
            id: "birthPlaceAddress",
            type: "textarea",
            label: { en: "Complete Birth Address", hi: "पूर्ण जन्म पता", mr: "पूर्ण जन्म पत्ता" },
            placeholder: { en: "House No, Locality, Ward, Town/Village...", hi: "घर नं, इलाका...", mr: "घर क्र, परिसर..." },
            required: true,
            colSpan: 1, 
          },
          
          {
            id: "birthPlaceSubDistrict",
            type: "text",
            label: { en: "Sub-district", hi: "उप-जिला", mr: "उप-जिल्हा" },
            required: true,
            colSpan: 1, // Kept as 1
          },
          {
            id: "birthPlaceDistrict",
            type: "text",
            label: { en: "District", hi: "जिला", mr: "जिल्हा" },
            required: true,
            colSpan: 1, // Kept as 1
          },
          {
            id: "birthPlaceState",
            type: "text",
            label: { en: "State / UT", hi: "राज्य", mr: "राज्य" },
            required: true,
            colSpan: 1, // Kept as 1
          },
          {
            id: "birthPlacePinCode",
            type: "text",
            label: { en: "PIN Code", hi: "पिन कोड", mr: "पिन कोड" },
            required: true,
            colSpan: 1, // Kept as 1
            validation: { pattern: "^[0-9]{6}$", maxLength: 6 },
          },

          // --- SECTION 6: REGISTRAR USE ONLY ---
          {
            id: "_registrar_header",
            type: "text",
            label: { en: "--- Registrar Details ---", hi: "--- रजिस्ट्रार विवरण ---", mr: "--- रजिस्ट्रार तपशील ---" },
            required: false,
            colSpan: 1, // Full width header
            placeholder: {en: "", hi: "", mr: ""}
          },
          {
            id: "registrationNo",
            type: "text",
            label: { en: "Registration No.", hi: "पंजीकरण संख्या", mr: "नोंदणी क्रमांक" },
            placeholder: { en: "To be filled by registrar", hi: "रजिस्ट्रार द्वारा भरा जाएगा", mr: "रजिस्ट्रारद्वारे भरले जाईल" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrationDate",
            type: "date",
            label: { en: "Registration Date", hi: "पंजीकरण तिथि", mr: "नोंदणी तारीख" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrationUnit",
            type: "text",
            label: { en: "Registration Unit", hi: "पंजीकरण इकाई", mr: "नोंदणी युनिट" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrarTownVillage",
            type: "text",
            label: { en: "Town / Village", hi: "शहर / गांव", mr: "शहर / गाव" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrarDistrict",
            type: "text",
            label: { en: "District", hi: "जिला", mr: "जिल्हा" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrarSubDistrict",
            type: "text",
            label: { en: "Sub-district", hi: "उप-जिला", mr: "उप-जिल्हा" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrarName",
            type: "text",
            label: { en: "Registrar Name", hi: "रजिस्ट्रार का नाम", mr: "रजिस्ट्रारचे नाव" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrarSignatureDate",
            type: "date",
            label: { en: "Registrar Signature Date", hi: "रजिस्ट्रार हस्ताक्षर तिथि", mr: "रजिस्ट्रार स्वाक्षरी तारीख" },
            required: false,
            colSpan: 1, // Kept as 1
          },
          {
            id: "registrarRemarks",
            type: "textarea",
            label: { en: "Remarks", hi: "टिप्पणियाँ", mr: "शेरा" },
            required: false,
            colSpan: 1, // Kept as 1 (Note: Textareas usually look better with 2, but you asked to keep it)
          },
        ],
      },

      // --- OTHER SECTIONS REMAIN ---
      {
        id: "address-information",
        title: { en: "Section 2 — Address Information", hi: "खंड 2 — पता जानकारी", mr: "कलम 2 — पत्ता माहिती" },
        description: { en: "Permanent Address of Parents ", hi: "माता-पिता का स्थायी पता", mr: "पालकांचा कायमचा पत्ता" },
        fields: [
          { id: "permanentHouseNo", type: "text", label: { en: "House No.", hi: "घर नं.", mr: "घर क्र." }, required: true, colSpan: 1 },
          { id: "permanentLocality", type: "text", label: { en: "Locality", hi: "इलाका", mr: "परिसर" }, required: true, colSpan: 1 },
          { id: "permanentWard", type: "text", label: { en: "Ward No.", hi: "वार्ड नं.", mr: "प्रभाग क्र." }, required: false, colSpan: 1 },
          { id: "permanentTownVillage", type: "text", label: { en: "Town / Village", hi: "शहर / गांव", mr: "शहर / गाव" }, required: true, colSpan: 1 },
          { id: "permanentSubDistrict", type: "text", label: { en: "Sub-district", hi: "उप-जिला", mr: "उप-जिल्हा" }, required: true, colSpan: 1 },
          { id: "permanentDistrict", type: "text", label: { en: "District", hi: "जिला", mr: "जिल्हा" }, required: true, colSpan: 1 },
          { id: "permanentState", type: "text", label: { en: "State / UT", hi: "राज्य", mr: "राज्य" }, required: true, colSpan: 1 },
          { id: "permanentPinCode", type: "text", label: { en: "PIN Code", hi: "पिन कोड", mr: "पिन कोड" }, required: true, colSpan: 1, validation: { pattern: "^[0-9]{6}$", maxLength: 6 } },
          { id: "permanentAddressProofType", type: "select", label: { en: "Permanent Address Proof Type", hi: "स्थायी पता प्रमाण", mr: "कायमचा पत्ता पुरावा" }, required: true, colSpan: 1, options: [{ value: "aadhaar", label: { en: "Aadhaar Card", hi: "आधार", mr: "आधार" } }] },
          { id: "addressProofLast4Digits", type: "text", label: { en: "Last 4 Digits", hi: "अंतिम 4 अंक", mr: "शेवटचे 4 अंक" }, required: true, colSpan: 1, validation: { pattern: "^[0-9]{4}$", maxLength: 4 } },
        ]
      },
      {
        id: "mother-details",
        title: { en: "Section 3 — Mother's Information", hi: "खंड 3 — माता की जानकारी", mr: "कलम 3 — आईची माहिती" },
        fields: [
          { id: "motherFirstName", type: "text", label: { en: "Mother First Name", hi: "माता का पहला नाम", mr: "आईचे पहिले नाव" }, required: true, colSpan: 1 },
          { id: "motherMiddleName", type: "text", label: { en: "Mother Middle Name", hi: "माता का मध्य नाम", mr: "आईचे मधले नाव" }, required: false, colSpan: 1 },
          { id: "motherLastName", type: "text", label: { en: "Mother Last Name", hi: "माता का उपनाम", mr: "आईचे आडनाव" }, required: false, colSpan: 1 },
          { id: "motherAadhaar", type: "text", label: { en: "Mother Aadhaar No.", hi: "माता का आधार", mr: "आईचा आधार" }, required: false, colSpan: 1 },
          { id: "motherMobile", type: "tel", label: { en: "Mother Mobile No.", hi: "माता का मोबाइल", mr: "आईचा मोबाईल" }, required: true, colSpan: 1 },
          { id: "motherEmail", type: "email", label: { en: "Mother Email ID", hi: "माता का ईमेल", mr: "आईचा ईमेल" }, required: false, colSpan: 1 },
          { id: "motherAgeAtMarriage", type: "number", label: { en: "Age at First Marriage", hi: "पहली शादी में उम्र", mr: "पहिल्या विवाहाचे वय" }, required: true, colSpan: 1, validation: { min: 18, max: 100 } },
          { id: "motherAgeAtBirth", type: "number", label: { en: "Age at This Birth", hi: "इस जन्म के समय उम्र", mr: "या जन्माच्या वेळी वय" }, required: true, colSpan: 1, validation: { min: 15, max: 100 } },
          { id: "childrenBornAlive", type: "number", label: { en: "Children Born Alive", hi: "जीवित जन्मे बच्चे", mr: "जिवंत जन्मलेली मुले" }, required: true, colSpan: 1, validation: { min: 1, max: 30 } }
        ]
      },
      {
        id: "father-details",
        title: { en: "Section 4 — Father's Information", hi: "खंड 4 — पिता की जानकारी", mr: "कलम 4 — वडिलांची माहिती" },
        fields: [
          { id: "fatherFirstName", type: "text", label: { en: "Father First Name", hi: "पिता का पहला नाम", mr: "वडिलांचे पहिले नाव" }, required: true, colSpan: 1 },
          { id: "fatherMiddleName", type: "text", label: { en: "Father Middle Name", hi: "पिता का मध्य नाम", mr: "वडिलांचे मधले नाव" }, required: false, colSpan: 1 },
          { id: "fatherLastName", type: "text", label: { en: "Father Last Name", hi: "पिता का उपनाम", mr: "वडिलांचे आडनाव" }, required: false, colSpan: 1 },
          { id: "fatherAadhaar", type: "text", label: { en: "Father Aadhaar No.", hi: "पिता का आधार", mr: "वडिलांचा आधार" }, required: false, colSpan: 1 },
          { id: "fatherMobile", type: "tel", label: { en: "Father Mobile No.", hi: "पिता का मोबाइल", mr: "वडिलांचा मोबाईल" }, required: true, colSpan: 1 },
          { id: "fatherEmail", type: "email", label: { en: "Father Email ID", hi: "पिता का ईमेल", mr: "वडिलांचा ईमेल" }, required: false, colSpan: 1 }
        ]
      },
      {
        id: "informant-details",
        title: { en: "Section 5 — Informant Details", hi: "खंड 5 — सूचनाकर्ता विवरण", mr: "कलम 5 — माहिती देणाऱ्याचे तपशील" },
        fields: [
          { id: "informantFirstName", type: "text", label: { en: "Informant First Name", hi: "सूचनाकर्ता पहला नाम", mr: "माहिती देणाऱ्याचे पहिले नाव" }, required: true, colSpan: 1 },
          { id: "informantMiddleName", type: "text", label: { en: "Informant Middle Name", hi: "सूचनाकर्ता मध्य नाम", mr: "माहिती देणाऱ्याचे मधले नाव" }, required: false, colSpan: 1 },
          { id: "informantLastName", type: "text", label: { en: "Informant Last Name", hi: "सूचनाकर्ता उपनाम", mr: "माहिती देणाऱ्याचे आडनाव" }, required: false, colSpan: 1 },
          { id: "informantMobile", type: "tel", label: { en: "Informant Mobile", hi: "सूचनाकर्ता मोबाइल", mr: "माहिती देणाऱ्याचे मोबाईल" }, required: true, colSpan: 1 },
          { id: "informantAddress", type: "textarea", label: { en: "Informant Address", hi: "पता", mr: "पत्ता" }, required: true, colSpan: 1 }, // Textarea with colSpan 2
          { id: "declarationAccuracy", type: "select", label: { en: "I confirm info is accurate", hi: "मैं पुष्टि करता हूं", mr: "मी पुष्टी करतो" }, required: true, colSpan: 1, options: [{ value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } }] },
        ]
      },
      {
      id: 'declaration',
      title: {
        en: 'Declaration',
        hi: 'घोषणा',
        mr: 'घोषणापत्र'
      },
      fields: [
        ...declarationField(),
      ]
    }
    ],
    documents: [
      { id: "hospitalCertificate", label: { en: "Hospital Birth Certificate", hi: "अस्पताल जन्म प्रमाण पत्र", mr: "रुग्णालय जन्म दाखला" }, description: { en: "Original birth certificate", hi: "मूल जन्म प्रमाण पत्र", mr: "मूळ जन्म दाखला" }, required: true, acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"], maxSize: 5 },
      { id: "parentIdProof", label: { en: "Parent ID Proof", hi: "माता-पिता का पहचान प्रमाण", mr: "पालकांचा ओळख पुरावा" }, description: { en: "Aadhaar/PAN/Voter ID", hi: "आधार/पैन/वोटर आईडी", mr: "आधार/पॅन/मतदार ओळखपत्र" }, required: true, acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"], maxSize: 5 },
      { id: "addressProof", label: { en: "Address Proof", hi: "पता प्रमाण", mr: "पत्ता पुरावा" }, description: { en: "Electricity bill/Ration card", hi: "बिजली बिल/राशन कार्ड", mr: "वीज बिल/शिधापत्रिका" }, required: true, acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"], maxSize: 5 }
    ]
  },
};
