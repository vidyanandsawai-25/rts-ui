// @ts-nocheck


import {
  ServiceFormConfig,
  declarationField,
  createApplicantInformationFields,
  requiredIf,
} from "./formTypes";

export const treeFormConfigs: Record<string, ServiceFormConfig> = {
  // ----------------------------------------------------
  // TREE DEPARTMENT – MULTI APPLICATION (8276)
  // ----------------------------------------------------
  // "8276": {
  //   serviceId: "8276",

  //   steps: [
  //     // ---------------- STEP 1: Applicant ----------------
  //     {
  //       id: "applicant-information",
  //       title: {
  //         en: "Applicant Information",
  //         hi: "आवेदक की जानकारी",
  //         mr: "आवेदकाची माहिती",
  //       },
  //       fields: [
  //         ...createApplicantInformationFields(),

  //         // ✅ Application Type (MAIN SWITCH)
  //         {
  //           id: "applicationType",
  //           type: "select",
  //           label: {
  //             en: "Application Type",
  //             hi: "आवेदन का प्रकार",
  //             mr: "अर्जाचा प्रकार",
  //           },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             {
  //               value: "TRIM_BRANCHES",
  //               label: { en: "Trimming of branches", hi: "फांद्या छाटणे", mr: "फांद्या छाटणी" },
  //             },
  //             {
  //               value: "PROVISIONAL_NOC",
  //               label: {
  //                 en: "Provisional NOC (Construction)",
  //                 hi: "प्रोव्हिजनल NOC (बांधकाम)",
  //                 mr: "प्रोव्हिजनल NOC (बांधकाम)",
  //               },
  //             },
  //             {
  //               value: "TREE_REMOVAL_OR_RELOCATION",
  //               label: {
  //                 en: "Tree removal / relocation for construction",
  //                 hi: "बांधकामासाठी वृक्ष तोड / स्थलांतर",
  //                 mr: "बांधकामासाठी वृक्ष तोड / स्थलांतर",
  //               },
  //             },
  //             {
  //               value: "REFUND_DEPOSIT",
  //               label: { en: "Refund of deposit", hi: "ठेव परतावा", mr: "ठेव परतावा" },
  //             },
  //             {
  //               value: "COMPLETION_NOC",
  //               label: {
  //                 en: "Completion NOC",
  //                 hi: "पूर्णता NOC",
  //                 mr: "पूर्णता NOC",
  //               },
  //             },
  //             {
  //               value: "ADVERTISEMENT_BOARD_NOC",
  //               label: {
  //                 en: "Advertisement Board NOC",
  //                 hi: "जाहिरात फलक NOC",
  //                 mr: "जाहिरात फलक NOC",
  //               },
  //             },
  //           ],
  //         },
  //       ],
  //     },

  //     // ---------------- STEP 2: Location ----------------
  //     {
  //       id: "property-location",
  //       title: { en: "Location Details", hi: "स्थान विवरण", mr: "स्थान तपशील" },
  //       fields: [
  //         {
  //           id: "zoneId",
  //           type: "select",
  //           label: { en: "Zone", hi: "झोन", mr: "झोन" },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: "East", label: { en: "East Zone", hi: "पूर्व झोन", mr: "पूर्व झोन" } },
  //             { value: "West", label: { en: "West Zone", hi: "पश्चिम झोन", mr: "पश्चिम झोन" } },
  //             { value: "North", label: { en: "North Zone", hi: "उत्तर झोन", mr: "उत्तर झोन" } },
  //             { value: "South", label: { en: "South Zone", hi: "दक्षिण झोन", mr: "दक्षिण झोन" } },
  //           ],
  //         },
  //         {
  //           id: "citySurveyNo",
  //           type: "text",
  //           label: {
  //             en: "City Survey / Gat Number",
  //             hi: "सिटी सर्वे / गट नंबर",
  //             mr: "सिटी सर्व्हे / गट क्रमांक",
  //           },
  //           required: true,
  //           colSpan: 1,
  //         },
  //         {
  //           id: "plotFlatNo",
  //           type: "text",
  //           label: { en: "Plot/Flat No", hi: "प्लॉट/फ्लैट नंबर", mr: "प्लॉट/फ्लॅट क्रमांक" },
  //           required: true,
  //           colSpan: 1,
  //         },
  //         {
  //           id: "buildingName",
  //           type: "text",
  //           label: {
  //             en: "Building/Colony Name",
  //             hi: "इमारत/कॉलोनी का नाम",
  //             mr: "इमारत/वसाहत नाव",
  //           },
  //           required: true,
  //           colSpan: 1,
  //         },
  //         {
  //           id: "areaName",
  //           type: "text",
  //           label: { en: "Area Name", hi: "क्षेत्र का नाम", mr: "परिसराचे नाव" },
  //           required: true,
  //           colSpan: 1,
  //         },
  //         {
  //           id: "landmark",
  //           type: "text",
  //           label: { en: "Nearby Landmark", hi: "निकटतम लैंडमार्क", mr: "जवळील ओळखचिन्ह" },
  //           required: true,
  //           colSpan: 1,
  //         },
  //         {
  //           id: "city",
  //           type: "text",
  //           label: { en: "City", hi: "शहर", mr: "शहर" },
  //           required: true,
  //           colSpan: 1,
  //         },
  //         {
  //           id: "pincode",
  //           type: "text",
  //           label: { en: "Pin Code", hi: "पिन कोड", mr: "पिन कोड" },
  //           required: true,
  //           colSpan: 1,
  //           validation: { pattern: "^[0-9]{6}$", maxLength: 6 },
  //         },
  //       ],
  //     },

  //     // ---------------- STEP 3: Application Details ----------------
  //     {
  //       id: "application-details",
  //       title: { en: "Application Details", hi: "आवेदन विवरण", mr: "अर्ज तपशील" },
  //       fields: [
  //         // ---------- Common tree info for most cases ----------
  //         {
  //           id: "ownerType",
  //           type: "select",
  //           label: { en: "Type of Owner", hi: "मालिक का प्रकार", mr: "मालकाचा प्रकार" },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: "Private", label: { en: "Private", hi: "निजी", mr: "खाजगी" } },
  //             { value: "Government", label: { en: "Government", hi: "सरकारी", mr: "सरकारी" } },
  //           ],
  //           showIf: {
  //             field: "applicationType",
  //             doesNotEqual: "ADVERTISEMENT_BOARD_NOC",
  //           },
  //         },
  //         {
  //           id: "treeType",
  //           type: "text",
  //           label: { en: "Type / Name of Tree", hi: "पेड़ का प्रकार / नाम", mr: "वृक्षाचा प्रकार / नाव" },
  //           colSpan: 1,
  //           showIf: {
  //             field: "applicationType",
  //             doesNotEqual: "ADVERTISEMENT_BOARD_NOC",
  //           },
  //           customValidate: requiredIf(
  //             { field: "applicationType", doesNotEqual: "ADVERTISEMENT_BOARD_NOC" } as any,
  //             "Tree type is required"
  //           ),
  //         },

  //         // =====================================================================
  //         // 1) TRIM_BRANCHES
  //         // =====================================================================
  //         {
  //           id: "undertakingDangerousBranches",
  //           type: "checkbox",
  //           label: {
  //             en: "I undertake that I will trim only dangerous branches (no tree felling).",
  //             hi: "मैं यह वचन देता/देती हूँ कि केवल खतरनाक शाखाओं की ही छंटाई करूँगा/करूँगी (पेड़ नहीं काटूँगा/काटूँगी)।",
  //             mr: "मी हमी देतो/देते की फक्त धोकादायक फांद्यांचीच छाटणी करेन (झाड तोडणार नाही).",
  //           },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "TRIM_BRANCHES" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TRIM_BRANCHES" },
  //             "Undertaking is required for branch trimming"
  //           ),
  //         },
  //         {
  //           id: "reasonDanger",
  //           type: "textarea",
  //           label: {
  //             en: "Why are the branches dangerous?",
  //             hi: "शाखाएँ खतरनाक क्यों हैं?",
  //             mr: "फांद्या धोकादायक का आहेत?",
  //           },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "TRIM_BRANCHES" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TRIM_BRANCHES" },
  //             "Please enter reason (danger)"
  //           ),
  //         },
  //         {
  //           id: "branchesNear",
  //           type: "select",
  //           label: {
  //             en: "Branches are near",
  //             hi: "शाखाएँ किसके पास हैं",
  //             mr: "फांद्या कशाच्या जवळ आहेत",
  //           },
  //           colSpan: 1,
  //           required: false,
  //           showIf: { field: "applicationType", equals: "TRIM_BRANCHES" },
  //           options: [
  //             { value: "electricLine", label: { en: "Electric Line", hi: "बिजली लाइन", mr: "वीज लाईन" } },
  //             { value: "building", label: { en: "Building", hi: "इमारत", mr: "इमारत" } },
  //             { value: "road", label: { en: "Road", hi: "रस्ता", mr: "रस्ता" } },
  //             { value: "neighborProperty", label: { en: "Neighbor Property", hi: "पड़ोसी की संपत्ति", mr: "शेजाऱ्याची मालमत्ता" } },
  //             { value: "other", label: { en: "Other", hi: "अन्य", mr: "इतर" } },
  //           ],
  //         },
  //         {
  //           id: "isEmergency",
  //           type: "select",
  //           label: { en: "Is it an emergency?", hi: "क्या यह आपातकाल है?", mr: "हे तातडीचे आहे का?" },
  //           colSpan: 1,
  //           required: false,
  //           showIf: { field: "applicationType", equals: "TRIM_BRANCHES" },
  //           options: [
  //             { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
  //             { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } },
  //           ],
  //         },

  //         // =====================================================================
  //         // 2) PROVISIONAL_NOC
  //         // =====================================================================
  //         {
  //           id: "landOwnerName",
  //           type: "text",
  //           label: { en: "Land Owner Name", hi: "भूमि मालिक का नाम", mr: "जमिनीच्या मालकाचे नाव" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //             "Land Owner Name is required"
  //           ),
  //         },
  //         {
  //           id: "ownerConsent",
  //           type: "select",
  //           label: { en: "Owner Consent", hi: "मालिक की सहमति", mr: "मालकाची संमती" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //             "Owner consent is required"
  //           ),
  //           options: [
  //             { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
  //             { value: "no", label: { en: "No", hi: "नाही", mr: "नाही" } },
  //           ],
  //         },
  //         {
  //           id: "architectName",
  //           type: "text",
  //           label: { en: "Architect Name", hi: "आर्किटेक्ट का नाम", mr: "आर्किटेक्टचे नाव" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //             "Architect name is required"
  //           ),
  //         },
  //         {
  //           id: "architectRegNo",
  //           type: "text",
  //           label: { en: "Architect Registration No", hi: "आर्किटेक्ट रजिस्ट्रेशन नं", mr: "आर्किटेक्ट नोंदणी क्र." },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //             "Architect registration no is required"
  //           ),
  //         },
  //         {
  //           id: "treeCensusDone",
  //           type: "select",
  //           label: { en: "Tree Census Done?", hi: "वृक्ष गणना हुई है?", mr: "वृक्ष गणना झाली आहे का?" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //             "Please select tree census status"
  //           ),
  //           options: [
  //             { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
  //             { value: "no", label: { en: "No", hi: "नाही", mr: "नाही" } },
  //           ],
  //         },
  //         {
  //           id: "existingTreeCount",
  //           type: "number",
  //           label: { en: "Existing Tree Count", hi: "मौजूदा वृक्ष संख्या", mr: "सध्याची वृक्ष संख्या" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //             "Existing tree count is required"
  //           ),
  //         },
  //         {
  //           id: "proposedPlantationCount",
  //           type: "number",
  //           label: { en: "Proposed Plantation Count", hi: "प्रस्तावित वृक्षारोपण संख्या", mr: "प्रस्तावित वृक्षारोपण संख्या" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "PROVISIONAL_NOC" },
  //             "Proposed plantation count is required"
  //           ),
  //         },

  //         // =====================================================================
  //         // 3) TREE_REMOVAL_OR_RELOCATION
  //         // =====================================================================
  //         {
  //           id: "reasonForFelling",
  //           type: "select",
  //           label: { en: "Reason for tree felling / relocation", hi: "वृक्ष तोड/स्थलांतराचे कारण", mr: "वृक्ष तोड/स्थलांतराचे कारण" },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //             "Please select reason"
  //           ),
  //           options: [
  //             { value: "dangerous", label: { en: "Dangerous", hi: "धोकादायक", mr: "धोकादायक" } },
  //             { value: "obstructing", label: { en: "Obstructing", hi: "अडथळा", mr: "अडथळा" } },
  //             { value: "other", label: { en: "Other", hi: "इतर", mr: "इतर" } },
  //           ],
  //         },
  //         {
  //           id: "treeCountToCut",
  //           type: "number",
  //           label: { en: "No. of trees to be cut/relocated", hi: "काटे/स्थलांतरित केले जाणारे वृक्ष", mr: "तोडायचे/स्थलांतरित करायचे वृक्ष" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //             "Tree count is required"
  //           ),
  //         },
  //         {
  //           id: "estimatedTreeAge",
  //           type: "number",
  //           label: { en: "Estimated age of trees (years)", hi: "वृक्षांचे अंदाजित वय (वर्षे)", mr: "वृक्षांचे अंदाजित वय (वर्षे)" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //             "Estimated tree age is required"
  //           ),
  //         },
  //         {
  //           id: "replantTreeCount",
  //           type: "number",
  //           label: { en: "No. of replacement trees to be planted", hi: "पर्यायी वृक्षारोपण संख्या", mr: "पर्यायी वृक्षारोपण संख्या" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //             "Replacement plantation count is required"
  //           ),
  //         },
  //         {
  //           id: "remainingTreesCount",
  //           type: "number",
  //           label: { en: "No. of remaining trees in property", hi: "मालमत्तेतील उरलेले वृक्ष", mr: "मालमत्तेतील उरलेले वृक्ष" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //             "Remaining trees count is required"
  //           ),
  //         },
  //         {
  //           id: "availableSpaceForPlantation",
  //           type: "textarea",
  //           label: { en: "Space available for new plantation", hi: "नवीन वृक्षारोपणासाठी उपलब्ध जागा", mr: "नवीन वृक्षारोपणासाठी उपलब्ध जागा" },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "TREE_REMOVAL_OR_RELOCATION" },
  //             "Please describe space available for plantation"
  //           ),
  //         },

  //         // =====================================================================
  //         // 4) REFUND_DEPOSIT
  //         // =====================================================================
  //         {
  //           id: "refundReason",
  //           type: "textarea",
  //           label: { en: "Reason for refund", hi: "परताव्याचे कारण", mr: "परताव्याचे कारण" },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "REFUND_DEPOSIT" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "REFUND_DEPOSIT" }, "Refund reason is required"),
  //         },
  //         {
  //           id: "depositChallanNo",
  //           type: "text",
  //           label: { en: "Deposit Challan / Receipt No", hi: "ठेव चलन/रसीद क्रमांक", mr: "ठेव चलन/पावती क्रमांक" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "REFUND_DEPOSIT" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "REFUND_DEPOSIT" }, "Challan/receipt no is required"),
  //         },
  //         {
  //           id: "depositDate",
  //           type: "date",
  //           label: { en: "Deposit Date", hi: "ठेव दिनांक", mr: "ठेव दिनांक" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "REFUND_DEPOSIT" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "REFUND_DEPOSIT" }, "Deposit date is required"),
  //         },
  //         {
  //           id: "depositAmount",
  //           type: "number",
  //           label: { en: "Deposit Amount", hi: "ठेव रक्कम", mr: "ठेव रक्कम" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "REFUND_DEPOSIT" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "REFUND_DEPOSIT" }, "Deposit amount is required"),
  //         },

  //         // =====================================================================
  //         // 5) COMPLETION_NOC
  //         // =====================================================================
  //         {
  //           id: "provisionalNocNo",
  //           type: "text",
  //           label: { en: "Provisional NOC Number", hi: "प्रोव्हिजनल NOC क्रमांक", mr: "प्रोव्हिजनल NOC क्रमांक" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "COMPLETION_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "COMPLETION_NOC" }, "Provisional NOC No is required"),
  //         },
  //         {
  //           id: "commencementCertificateNo",
  //           type: "text",
  //           label: { en: "Commencement Certificate Number", hi: "कमन्समेंट प्रमाणपत्र क्रमांक", mr: "कमन्समेंट प्रमाणपत्र क्रमांक" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "COMPLETION_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "COMPLETION_NOC" }, "Commencement certificate no is required"),
  //         },
  //         {
  //           id: "previousFellingPermissionTaken",
  //           type: "select",
  //           label: { en: "Any previous tree felling permission taken?", hi: "पूर्वी वृक्षतोड परवानगी घेतली आहे का?", mr: "पूर्वी वृक्षतोड परवानगी घेतली आहे का?" },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "COMPLETION_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "COMPLETION_NOC" }, "Please select previous permission status"),
  //           options: [
  //             { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
  //             { value: "no", label: { en: "No", hi: "नाही", mr: "नाही" } },
  //           ],
  //         },
  //         {
  //           id: "liveTreesCount",
  //           type: "number",
  //           label: { en: "Live replanted trees", hi: "जिवंत पुनर्लागवड वृक्ष", mr: "जिवंत पुनर्लागवड वृक्ष" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "COMPLETION_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "COMPLETION_NOC" }, "Live trees count is required"),
  //         },
  //         {
  //           id: "deadTreesCount",
  //           type: "number",
  //           label: { en: "Dead replanted trees", hi: "मृत पुनर्लागवड वृक्ष", mr: "मृत पुनर्लागवड वृक्ष" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "COMPLETION_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "COMPLETION_NOC" }, "Dead trees count is required"),
  //         },
  //         {
  //           id: "replacementTreeDetails",
  //           type: "textarea",
  //           label: { en: "Replacement tree details (optional)", hi: "पर्यायी वृक्ष तपशील (ऐच्छिक)", mr: "पर्यायी वृक्ष तपशील (ऐच्छिक)" },
  //           required: false,
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "COMPLETION_NOC" },
  //         },

  //         // =====================================================================
  //         // 6) ADVERTISEMENT_BOARD_NOC
  //         // =====================================================================
  //         {
  //           id: "boardType",
  //           type: "text",
  //           label: { en: "Board Type", hi: "फलकाचा प्रकार", mr: "फलकाचा प्रकार" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" }, "Board type is required"),
  //         },
  //         {
  //           id: "boardSize",
  //           type: "text",
  //           label: { en: "Board Size", hi: "फलकाचा आकार", mr: "फलकाचा आकार" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" }, "Board size is required"),
  //         },
  //         {
  //           id: "locationDescription",
  //           type: "textarea",
  //           label: { en: "Location Description", hi: "ठिकाणाचे वर्णन", mr: "ठिकाणाचे वर्णन" },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" }, "Location description is required"),
  //         },
  //         {
  //           id: "ownerNoObjection",
  //           type: "select",
  //           label: { en: "Owner No Objection", hi: "मालकाची नाहरकत", mr: "मालकाची नाहरकत" },
  //           colSpan: 1,
  //           showIf: { field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" },
  //           customValidate: requiredIf({ field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" }, "Owner no objection is required"),
  //           options: [
  //             { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
  //             { value: "no", label: { en: "No", hi: "नाही", mr: "नाही" } },
  //           ],
  //         },
  //         {
  //           id: "harmToTreeUndertaking",
  //           type: "checkbox",
  //           label: {
  //             en: "I undertake that no harm will be caused to the tree(s).",
  //             hi: "मैं यह वचन देता/देती हूँ कि पेड़/पेड़ों को कोई नुकसान नहीं होगा।",
  //             mr: "मी हमी देतो/देते की झाडांना कोणतीही इजा होणार नाही.",
  //           },
  //           colSpan: 2,
  //           showIf: { field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" },
  //           customValidate: requiredIf(
  //             { field: "applicationType", equals: "ADVERTISEMENT_BOARD_NOC" },
  //             "Undertaking is required"
  //           ),
  //         },
  //       ],
  //     },

  //     // ---------------- STEP 4: Declaration ----------------
  //     {
  //       id: "declaration",
  //       title: { en: "Declaration", hi: "घोषणा", mr: "घोषणापत्र" },
  //       fields: [...declarationField()],
  //     },
  //   ],

  //   // ------------------------------------------------
  //   // DOCUMENTS (Shown/required based on applicationType in your UI)
  //   // Note: ServiceDocument does not support showIf/requiredIf in your types.
  //   // So keep required=false for conditional ones and enforce in validation layer.
  //   // ------------------------------------------------
  //   documents: [
  //     // Common / Optional base docs
  //     {
  //       id: "applicantIdProof",
  //       label: { en: "Applicant ID Proof", hi: "आवेदक पहचान प्रमाण", mr: "अर्जदार ओळख पुरावा" },
  //       description: { en: "Aadhaar / PAN / Voter ID", hi: "आधार / पॅन / मतदार ओळखपत्र", mr: "आधार / पॅन / मतदार ओळखपत्र" },
  //       required: true,
  //       acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
  //       maxSize: 5,
  //     },

  //     // ---------------- TRIM_BRANCHES docs ----------------
  //     {
  //       id: "treePhotoBranches",
  //       label: {
  //         en: "Photo of branches to be trimmed",
  //         hi: "छांटने के लिए चिन्हित शाखाओं का फोटो",
  //         mr: "छाटणीसाठी चिन्हांकित फांद्यांचा फोटो",
  //       },
  //       description: {
  //         en: "Clear photo of the branches proposed for trimming",
  //         hi: "छांटने हेतु प्रस्तावित शाखाओं का स्पष्ट फोटो",
  //         mr: "छाटणीसाठी प्रस्तावित फांद्यांचा स्पष्ट फोटो",
  //       },
  //       required: false,
  //       acceptedFormats: [".jpg", ".jpeg", ".png"],
  //       maxSize: 5,
  //     },
  //     {
  //       id: "undertakingFormatTrimDangerousBranches",
  //       label: {
  //         en: "Undertaking format (dangerous branches trimming only)",
  //         hi: "हमीपत्र (केवल खतरनाक शाखाओं की छंटाई)",
  //         mr: "हमीपत्र (फक्त धोकादायक फांद्यांची छाटणी)",
  //       },
  //       description: {
  //         en: "Signed undertaking for trimming only dangerous branches",
  //         hi: "केवल खतरनाक शाखाओं की छंटाई हेतु हस्ताक्षरित हमीपत्र",
  //         mr: "फक्त धोकादायक फांद्या छाटण्यासाठी स्वाक्षरी असलेले हमीपत्र",
  //       },
  //       required: false,
  //       acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
  //       maxSize: 5,
  //     },

  //     // ---------------- PROVISIONAL_NOC docs ----------------
  //     {
  //       id: "ownershipProofLand",
  //       label: { en: "Land Ownership Proof", hi: "भूमि स्वामित्व दस्तावेज", mr: "जमिनीचे मालकी हक्क कागदपत्र" },
  //       description: { en: "Land ownership documents", hi: "जमिनीचे मालकी हक्क दस्तावेज", mr: "जमिनीचे मालकी हक्क कागदपत्र" },
  //       required: false,
  //       acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "mapApprovedByBPD",
  //       label: { en: "Map approved by Building Permission Dept", hi: "बिल्डिंग परवानगी विभागाचा मंजूर नकाशा", mr: "बांधकाम परवानगी विभागाचा मंजूर नकाशा" },
  //       description: {
  //         en: "Map signed by architect; existing trees marked in green and proposed in blue",
  //         hi: "आर्किटेक्टच्या सहीसह नकाशा; विद्यमान झाडे हिरव्या व प्रस्तावित निळ्या रंगात",
  //         mr: "आर्किटेक्टच्या सहीसह नकाशा; विद्यमान झाडे हिरव्या व प्रस्तावित निळ्या रंगात",
  //       },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "photosEachTreeWithNameAndNo",
  //       label: { en: "Photos of each tree with name & number", hi: "प्रत्येक झाडाचा फोटो (नाव/क्रमांकासह)", mr: "प्रत्येक झाडाचा फोटो (नाव/क्रमांकासह)" },
  //       description: {
  //         en: "Separate clear photo of each existing tree with tree number and name",
  //         hi: "प्रत्येक विद्यमान झाडाचा क्रमांक व नावासह स्पष्ट फोटो",
  //         mr: "प्रत्येक विद्यमान झाडाचा क्रमांक व नावासह स्पष्ट फोटो",
  //       },
  //       required: false,
  //       acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
  //       maxSize: 20,
  //     },
  //     {
  //       id: "formA_treeCensus",
  //       label: { en: "Form A (Tree census)", hi: "फॉर्म A (वृक्ष गणना)", mr: "फॉर्म A (वृक्ष गणना)" },
  //       description: { en: "Form A with owner/occupier name and signature", hi: "मालक/भोगवटादाराच्या सहीसह फॉर्म A", mr: "मालक/भोगवटादाराच्या सहीसह फॉर्म A" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 5,
  //     },

  //     // ---------------- TREE_REMOVAL_OR_RELOCATION docs ----------------
  //     {
  //       id: "formC_section8_3",
  //       label: { en: "Form C (Section 8(3))", hi: "फॉर्म C (कलम 8(3))", mr: "फॉर्म C (कलम 8(3))" },
  //       description: { en: "Application Form C under Tree Act", hi: "वृक्ष कायद्यानुसार फॉर्म C", mr: "वृक्ष कायद्यानुसार फॉर्म C" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 5,
  //     },
  //     {
  //       id: "commencementCertificate",
  //       label: { en: "Commencement Certificate", hi: "कमन्समेंट प्रमाणपत्र", mr: "कमन्समेंट प्रमाणपत्र" },
  //       description: { en: "Commencement certificate copy", hi: "कमन्समेंट प्रमाणपत्र प्रत", mr: "कमन्समेंट प्रमाणपत्र प्रत" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 5,
  //     },
  //     {
  //       id: "provisionalNocCopy",
  //       label: { en: "Provisional NOC Copy", hi: "प्रोव्हिजनल NOC प्रत", mr: "प्रोव्हिजनल NOC प्रत" },
  //       description: { en: "Copy of provisional NOC", hi: "प्रोव्हिजनल NOC ची प्रत", mr: "प्रोव्हिजनल NOC ची प्रत" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 5,
  //     },
  //     {
  //       id: "corporationApprovedMapRedGreenBlueYellow",
  //       label: { en: "Corporation approved map (color markings)", hi: "महानगरपालिका मंजूर नकाशा (रंग चिन्हांकन)", mr: "महानगरपालिका मंजूर नकाशा (रंग चिन्हांकन)" },
  //       description: {
  //         en: "Trees to cut in red, remaining in green; new in blue; replanting in yellow",
  //         hi: "तोडायची झाडे लाल, उरलेली हिरवी; नवीन निळी; पुनर्लागवड पिवळी",
  //         mr: "तोडायची झाडे लाल, उरलेली हिरवी; नवीन निळी; पुनर्लागवड पिवळी",
  //       },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 15,
  //     },
  //     {
  //       id: "treePhotoToCut",
  //       label: { en: "Photo of tree(s) to be cut", hi: "तोडायच्या झाडांचा फोटो", mr: "तोडायच्या झाडांचा फोटो" },
  //       description: { en: "Clear photo of trees proposed for cutting", hi: "तोडायच्या झाडांचा स्पष्ट फोटो", mr: "तोडायच्या झाडांचा स्पष्ट फोटो" },
  //       required: false,
  //       acceptedFormats: [".jpg", ".jpeg", ".png"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "formD_section11_2_Guarantee",
  //       label: { en: "Form D (Section 11(2)) Guarantee", hi: "फॉर्म D (कलम 11(2)) हमी", mr: "फॉर्म D (कलम 11(2)) हमी" },
  //       description: { en: "Guarantee form under Tree Act", hi: "वृक्ष कायद्यानुसार हमीपत्र", mr: "वृक्ष कायद्यानुसार हमीपत्र" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 5,
  //     },
  //     {
  //       id: "previousComplianceReport",
  //       label: { en: "Previous compliance report (if any)", hi: "मागील अनुपालन अहवाल (असल्यास)", mr: "मागील अनुपालन अहवाल (असल्यास)" },
  //       description: { en: "If previous permission was issued, upload compliance report", hi: "पूर्वी परवानगी असल्यास अनुपालन अहवाल अपलोड करा", mr: "पूर्वी परवानगी असल्यास अनुपालन अहवाल अपलोड करा" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 10,
  //     },

  //     // ---------------- REFUND_DEPOSIT docs ----------------
  //     {
  //       id: "originalChallanReceipt",
  //       label: { en: "Original Challan/Receipt", hi: "मूळ चलन/पावती", mr: "मूळ चलन/पावती" },
  //       description: { en: "Upload original deposit challan/receipt", hi: "ठेव चलन/पावती अपलोड करा", mr: "ठेव चलन/पावती अपलोड करा" },
  //       required: false,
  //       acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "photosOfPlantedTrees",
  //       label: { en: "Photos of planted trees", hi: "लावलेल्या झाडांचे फोटो", mr: "लावलेल्या झाडांचे फोटो" },
  //       description: { en: "Clear photos of replanted trees", hi: "पुनर्लागवड झाडांचे स्पष्ट फोटो", mr: "पुनर्लागवड झाडांचे स्पष्ट फोटो" },
  //       required: false,
  //       acceptedFormats: [".jpg", ".jpeg", ".png"],
  //       maxSize: 15,
  //     },
  //     {
  //       id: "sanctionedMapWithPlantedTrees",
  //       label: { en: "Sanctioned map showing planted trees", hi: "झाडे दर्शवणारा मंजूर नकाशा", mr: "झाडे दर्शवणारा मंजूर नकाशा" },
  //       description: { en: "Blueprint showing planted tree locations", hi: "झाडांच्या ठिकाणांसह नकाशा", mr: "झाडांच्या ठिकाणांसह नकाशा" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 15,
  //     },
  //     {
  //       id: "permissionOrNocCopyForDeposit",
  //       label: { en: "Permission/NOC copy (for which deposit was paid)", hi: "परवानगी/NOC प्रत (ज्यासाठी ठेव भरली)", mr: "परवानगी/NOC प्रत (ज्यासाठी ठेव भरली)" },
  //       description: { en: "Upload permission/NOC copy related to deposit", hi: "ठेव संबंधित परवानगी/NOC प्रत अपलोड करा", mr: "ठेव संबंधित परवानगी/NOC प्रत अपलोड करा" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 10,
  //     },

  //     // ---------------- COMPLETION_NOC docs ----------------
  //     {
  //       id: "applicationOwnerOccupier",
  //       label: { en: "Application by owner/occupier", hi: "मालक/भोगवटादाराचा अर्ज", mr: "मालक/भोगवटादाराचा अर्ज" },
  //       description: { en: "Application letter from land owner/occupier", hi: "मालक/भोगवटादाराचा अर्ज", mr: "मालक/भोगवटादाराचा अर्ज" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 5,
  //     },
  //     {
  //       id: "approvedMapWithTreeTracingGreen",
  //       label: { en: "Approved map with trees traced in green", hi: "हिरव्या रंगात झाडे दर्शवलेला मंजूर नकाशा", mr: "हिरव्या रंगात झाडे दर्शवलेला मंजूर नकाशा" },
  //       description: { en: "Map showing tree positions and photographs", hi: "झाडांचे ठिकाण आणि फोटो दर्शवणारा नकाशा", mr: "झाडांचे ठिकाण आणि फोटो दर्शवणारा नकाशा" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 15,
  //     },
  //     {
  //       id: "previousPermissionAndCompletionReport",
  //       label: { en: "Previous permission & completion report (if any)", hi: "मागील परवानगी व पूर्णता अहवाल (असल्यास)", mr: "मागील परवानगी व पूर्णता अहवाल (असल्यास)" },
  //       description: { en: "Upload if previous felling/replant permission existed", hi: "पूर्वी परवानगी असल्यास अपलोड करा", mr: "पूर्वी परवानगी असल्यास अपलोड करा" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 15,
  //     },
  //     {
  //       id: "googleMapNewPlantationLocation",
  //       label: { en: "Google map of new plantation location", hi: "नवीन वृक्षारोपण ठिकाणाचा Google Map", mr: "नवीन वृक्षारोपण ठिकाणाचा Google Map" },
  //       description: { en: "Google map / geo-location proof of plantation", hi: "वृक्षारोपण ठिकाणाचा नकाशा/जिओ लोकेशन", mr: "वृक्षारोपण ठिकाणाचा नकाशा/जिओ लोकेशन" },
  //       required: false,
  //       acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "photoReplacementTreeWithGeoLocation",
  //       label: { en: "Photo of replacement tree with geo location", hi: "जिओ लोकेशनसह पर्यायी झाडाचा फोटो", mr: "जिओ लोकेशनसह पर्यायी झाडाचा फोटो" },
  //       description: { en: "Color photo including geo location", hi: "जिओ लोकेशनसह रंगीत फोटो", mr: "जिओ लोकेशनसह रंगीत फोटो" },
  //       required: false,
  //       acceptedFormats: [".jpg", ".jpeg", ".png"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "treeCountRecordedDoc",
  //       label: { en: "Tree count record (optional)", hi: "वृक्ष संख्या नोंद (ऐच्छिक)", mr: "वृक्ष संख्या नोंद (ऐच्छिक)" },
  //       description: { en: "Copy of record if available", hi: "असल्यास नोंदीची प्रत", mr: "असल्यास नोंदीची प्रत" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 5,
  //     },

  //     // ---------------- ADVERTISEMENT_BOARD_NOC docs ----------------
  //     {
  //       id: "locationPhoto",
  //       label: { en: "Color photo of location", hi: "ठिकाणाचा रंगीत फोटो", mr: "ठिकाणाचा रंगीत फोटो" },
  //       description: { en: "Clear photo of proposed board location", hi: "प्रस्तावित ठिकाणाचा स्पष्ट फोटो", mr: "प्रस्तावित ठिकाणाचा स्पष्ट फोटो" },
  //       required: false,
  //       acceptedFormats: [".jpg", ".jpeg", ".png"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "undertakingNoHarmAndOwnerNoc",
  //       label: { en: "Undertaking + Owner NOC", hi: "हमीपत्र + मालक NOC", mr: "हमीपत्र + मालक NOC" },
  //       description: { en: "Undertaking no harm to tree + owner no objection", hi: "झाडाला हानी नाही याबाबत हमीपत्र + मालकाची नाहरकत", mr: "झाडाला हानी नाही याबाबत हमीपत्र + मालकाची नाहरकत" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "stabilityCertificate",
  //       label: { en: "Stability Certificate", hi: "स्थिरता प्रमाणपत्र", mr: "स्थिरता प्रमाणपत्र" },
  //       description: { en: "Structure stability certificate", hi: "संरचनेचे स्थिरता प्रमाणपत्र", mr: "संरचनेचे स्थिरता प्रमाणपत्र" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "structureMap",
  //       label: { en: "Structure Map", hi: "संरचना नकाशा", mr: "संरचना नकाशा" },
  //       description: { en: "Map/drawing of the structure", hi: "संरचनेचा नकाशा/रेखाचित्र", mr: "संरचनेचा नकाशा/रेखाचित्र" },
  //       required: false,
  //       acceptedFormats: [".pdf"],
  //       maxSize: 10,
  //     },
  //     {
  //       id: "locationMap",
  //       label: { en: "Location Map", hi: "ठिकाणाचा नकाशा", mr: "ठिकाणाचा नकाशा" },
  //       description: { en: "Map showing exact location", hi: "अचूक ठिकाण दर्शवणारा नकाशा", mr: "अचूक ठिकाण दर्शवणारा नकाशा" },
  //       required: false,
  //       acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
  //       maxSize: 10,
  //     },
  //   ],
  // },

  '8276': {
  serviceId: '8276',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant Details
    // NOTE (Conditional UI Rules):
    // 1) applicantRelationship != 'owner' => authorizationProof doc should be REQUIRED in UI
    // 2) applicantType == 'society' => societyNocOrResolution doc can be asked (optional/required as per ULB)
    // ------------------------------------------------------
    {
      id: 'applicant-details',
      title: { en: 'Applicant Details', hi: 'आवेदक का विवरण', mr: 'अर्जदाराची माहिती' },
      fields: [
        {
          id: 'applicantType',
          type: 'select',
          label: { en: 'Applicant Type', hi: 'आवेदक प्रकार', mr: 'अर्जदाराचा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'individual', label: { en: 'Individual', hi: 'वैयक्तिक', mr: 'वैयक्तिक' } },
            { value: 'society', label: { en: 'Society', hi: 'सोसायटी', mr: 'सोसायटी' } },
            { value: 'company', label: { en: 'Company', hi: 'कंपनी', mr: 'कंपनी' } },
            { value: 'contractor', label: { en: 'Contractor', hi: 'कॉन्ट्रॅक्टर', mr: 'कॉन्ट्रॅक्टर' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'applicantFullName',
          type: 'text',
          label: { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
          placeholder: { en: 'Enter full name', hi: 'पूर्ण नाम लिखें', mr: 'पूर्ण नाव लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'mobileNo',
          type: 'text',
          label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
          placeholder: { en: '10-digit mobile', hi: '10 अंकों का मोबाइल', mr: '10 अंकी मोबाईल' },
          required: true,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        },
        {
          id: 'email',
          type: 'text',
          label: { en: 'Email (optional)', hi: 'ईमेल (वैकल्पिक)', mr: 'ईमेल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1
        },
        {
          id: 'applicantAddress',
          type: 'textarea',
          label: { en: 'Address (optional)', hi: 'पता (वैकल्पिक)', mr: 'पत्ता (ऐच्छिक)' },
          placeholder: { en: 'Optional address', hi: 'वैकल्पिक पत्ता', mr: 'ऐच्छिक पत्ता' },
          required: false,
          colSpan: 1
        },
        {
          id: 'idProofType',
          type: 'select',
          label: { en: 'ID Proof Type', hi: 'पहचान पत्र प्रकार', mr: 'ओळखपत्र प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'aadhaar', label: { en: 'Aadhaar', hi: 'आधार', mr: 'आधार' } },
            { value: 'voter', label: { en: 'Voter ID', hi: 'वोटर आईडी', mr: 'मतदार ओळखपत्र' } },
            { value: 'pan', label: { en: 'PAN', hi: 'पैन', mr: 'पॅन' } },
            { value: 'dl', label: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', mr: 'ड्रायव्हिंग लायसन्स' } }
          ]
        },
        {
          id: 'idProofNumber',
          type: 'text',
          label: { en: 'ID Proof Number', hi: 'पहचान पत्र क्रमांक', mr: 'ओळखपत्र क्रमांक' },
          placeholder: { en: 'Enter number', hi: 'क्रमांक लिखें', mr: 'क्रमांक लिहा' },
          required: true,
          colSpan: 1,
          validation: { maxLength: 20 }
        },
        {
          id: 'applicantRelationship',
          type: 'select',
          label: { en: 'Relationship to Property', hi: 'संपत्ति से संबंध', mr: 'मालमत्तेशी संबंध' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'owner', label: { en: 'Owner', hi: 'मालक', mr: 'मालक' } },
            { value: 'poa', label: { en: 'POA Holder', hi: 'POA धारक', mr: 'मुखत्यार (POA)' } },
            { value: 'tenant', label: { en: 'Tenant', hi: 'किरायेदार', mr: 'भाडेकरू' } },
            { value: 'society_authorized', label: { en: 'Society (Authorized)', hi: 'सोसायटी (अधिकृत)', mr: 'सोसायटी (अधिकृत)' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Location / Property Details
    // NOTE (Conditional UI Rules):
    // 1) isPropertyNoAvailable == 'yes' => propertyNo is REQUIRED and auto-fetch fields should fill (read-only)
    // 2) isPropertyNoAvailable == 'no'  => manual location fields (ward/zone/area/road/landmark) should be REQUIRED
    // ------------------------------------------------------
    {
      id: 'property-location',
      title: { en: 'Location / Property Details', hi: 'स्थान / संपत्ति विवरण', mr: 'लोकेशन / मालमत्ता तपशील' },
      fields: [
        {
          id: 'propertyNo',
          type: 'select',
          label: { en: 'Select Property No / UPIC', hi: 'प्रॉपर्टी नं / UPIC निवडा', mr: 'प्रॉपर्टी नं / UPIC निवडा' },
          required: false, // conditionally REQUIRED if isPropertyNoAvailable == 'yes'
          colSpan: 1,
          options: [] // populate dynamically from DB/API (searchable dropdown recommended)
        },
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward (Auto)', hi: 'वार्ड (ऑटो)', mr: 'वार्ड (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [],
          disabled: true
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone (Auto)', hi: 'झोन (ऑटो)', mr: 'झोन (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [],
          disabled: true
        },
        {
          id: 'fetchedOwnerName',
          type: 'text',
          label: { en: 'Owner Name (Auto)', hi: 'मालकाचे नाव (ऑटो)', mr: 'मालकाचे नाव (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        },
        {
          id: 'fetchedPropertyAddress',
          type: 'textarea',
          label: { en: 'Address (Auto)', hi: 'पता (ऑटो)', mr: 'पत्ता (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        },
        {
          id: 'areaName',
          type: 'text',
          label: { en: 'Area / Locality', hi: 'क्षेत्र / इलाका', mr: 'परिसर / भाग' },
          placeholder: { en: 'Enter area/locality', hi: 'क्षेत्र लिखें', mr: 'परिसर लिहा' },
          required: false, // conditionally REQUIRED if isPropertyNoAvailable == 'no'
          colSpan: 1
        },
        {
          id: 'roadStreetName',
          type: 'text',
          label: { en: 'Road / Street Name', hi: 'सड़क / गली का नाम', mr: 'रस्ता / गल्लीचे नाव' },
          placeholder: { en: 'Enter road/street name', hi: 'रस्त्याचे नाव लिहा', mr: 'रस्त्याचे नाव लिहा' },
          required: false, // conditionally REQUIRED if isPropertyNoAvailable == 'no'
          colSpan: 1
        },
        {
          id: 'landmark',
          type: 'text',
          label: { en: 'Landmark', hi: 'लँडमार्क', mr: 'लँडमार्क' },
          placeholder: { en: 'e.g. Near school/chowk', hi: 'उदा: शाळेजवळ/चौकाजवळ', mr: 'उदा: शाळेजवळ/चौकाजवळ' },
          required: false, // conditionally REQUIRED if isPropertyNoAvailable == 'no'
          colSpan: 1
        },
        {
          id: 'googleMapLink',
          type: 'text',
          label: { en: 'Google Map Link (optional)', hi: 'गूगल मैप लिंक (वैकल्पिक)', mr: 'गूगल मॅप लिंक (ऐच्छिक)' },
          placeholder: { en: 'Paste link (optional)', hi: 'लिंक पेस्ट करें', mr: 'लिंक पेस्ट करा' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: Tree Felling / Pruning Request Details
    // NOTE (Conditional UI Rules):
    // 1) actionRequested == 'felling' => treePhotos doc should be REQUIRED (already mandatory below)
    // 2) reasonCategory == 'construction' => buildingPermissionDoc can be asked (optional/required as per ULB)
    // 3) isImmediateDanger == 'yes' => dangerExplanation should be REQUIRED in UI
    // ------------------------------------------------------
    {
      id: 'tree-request-details',
      title: { en: 'Tree Request Details', hi: 'पेड़ विवरण', mr: 'झाडाचा तपशील' },
      fields: [
        {
          id: 'actionRequested',
          type: 'select',
          label: { en: 'What do you want to do?', hi: 'आप क्या करना चाहते हैं?', mr: 'काय करायचं आहे?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'felling', label: { en: 'Cut the tree (Felling)', hi: 'झाड तोडणे', mr: 'झाड तोडणे' } },
            { value: 'pruning', label: { en: 'Cut branches (Pruning)', hi: 'फांद्या छाटणे', mr: 'फांद्या छाटणे' } },
            { value: 'transplant', label: { en: 'Shift the tree (Transplant)', hi: 'झाड हलवणे', mr: 'झाड हलवणे (ट्रान्सप्लांट)' } }
          ]
        },
        {
          id: 'noOfTrees',
          type: 'number',
          label: { en: 'How many trees?', hi: 'कितने पेड़?', mr: 'किती झाडे आहेत?' },
          placeholder: { en: 'e.g. 1', hi: 'उदा: 1', mr: 'उदा: 1' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'treeLocationType',
          type: 'select',
          label: { en: 'Where is the tree located?', hi: 'पेड़ कहाँ है?', mr: 'झाड कुठे आहे?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'inside_property', label: { en: 'Inside my property', hi: 'मालमत्तेमध्ये', mr: 'माझ्या मालमत्तेमध्ये' } },
            { value: 'society_premises', label: { en: 'Society premises', hi: 'सोसायटीमध्ये', mr: 'सोसायटीमध्ये' } },
            { value: 'roadside_public', label: { en: 'Roadside / Public place', hi: 'रस्त्यालगत / सार्वजनिक', mr: 'रस्त्यालगत / सार्वजनिक' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'reasonCategory',
          type: 'select',
          label: { en: 'Reason', hi: 'कारण', mr: 'कारण' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'dangerous', label: { en: 'Dangerous (risk of falling)', hi: 'धोकादायक', mr: 'धोकादायक (पडण्याचा धोका)' } },
            { value: 'diseased', label: { en: 'Diseased / Dead', hi: 'रोगग्रस्त / सुकलेले', mr: 'रोगग्रस्त / सुकलेले' } },
            { value: 'obstruction', label: { en: 'Obstruction / nuisance', hi: 'अडथळा / त्रास', mr: 'अडथळा / त्रास' } },
            { value: 'construction', label: { en: 'Construction / development work', hi: 'बांधकाम/विकास काम', mr: 'बांधकाम/विकास काम' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'isImmediateDanger',
          type: 'select',
          label: { en: 'Is it an emergency danger?', hi: 'क्या तातडीचा धोका आहे?', mr: 'तातडीचा धोका आहे का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'dangerExplanation',
          type: 'textarea',
          label: { en: 'Explain the danger (if yes)', hi: 'धोका स्पष्ट करा (होय असल्यास)', mr: 'धोका कसा आहे ते लिहा (होय असल्यास)' },
          placeholder: { en: 'If yes, write 1-2 lines', hi: '1-2 ओळींमध्ये', mr: '1-2 ओळींमध्ये' },
          required: false, // conditionally REQUIRED if isImmediateDanger == 'yes'
          colSpan: 1
        },

        // If you don't have a repeatable table component, keep this as a single textarea.
        // If you DO have a repeatable/table UI, you can convert this into rows (species/girth/condition/location).
        {
          id: 'treeDetails',
          type: 'textarea',
          label: { en: 'Tree Details', hi: 'पेड़ का विवरण', mr: 'झाडाचा तपशील (प्रत्येक झाड)' },
          placeholder: {
            en: 'For each tree: species, approx girth, condition, exact spot',
            hi: 'प्रत्येक पेड़: प्रकार, घेर, स्थिति, स्थान',
            mr: 'प्रत्येक झाड: नाव/प्रकार, घेर (अंदाजे), स्थिती, नेमकं ठिकाण (उदा: गेटजवळ)'
          },
          required: true,
          colSpan: 1
        },
      ]
    },
    // ------------------------------------------------------
    // STEP 5: Declaration
    // ------------------------------------------------------
    {
      id: 'declaration',
      title: { en: 'Declaration', hi: 'घोषणा', mr: 'घोषणापत्र' },
      fields: [
        ...declarationField()
      ]
    }
  ],

  documents: [
    {
      id: 'identityProof',
      label: { en: 'ID Proof', hi: 'पहचान पत्र', mr: 'ओळखपत्र' },
      description: { en: 'Aadhaar/Voter/PAN etc.', hi: 'आधार/वोटर/पैन आदि', mr: 'आधार/मतदार/पॅन इ.' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
      id: 'ownershipProof',
      label: { en: 'Ownership Proof', hi: 'स्वामित्व प्रमाण', mr: 'मालकी पुरावा' },
      description: { en: 'Tax receipt / Property card / 7/12 / Sale deed etc.', hi: 'कर पावती / प्रॉपर्टी कार्ड / 7/12 / विक्रीखत', mr: 'कर पावती / मालमत्ता कार्ड / 7/12 / विक्रीखत' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'siteSketchPlan',
      label: { en: 'Site Plan / Sketch', hi: 'साईट प्लॅन / स्केच', mr: 'साईट प्लॅन / स्केच' },
      description: { en: 'Sketch showing tree location marked', hi: 'झाडाचे ठिकाण मार्क केलेला स्केच', mr: 'झाड कुठे आहे ते मार्क केलेला स्केच' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'treePhotos',
      label: { en: 'Tree Photos', hi: 'पेड़ के फोटो', mr: 'झाडाचे फोटो' },
      description: { en: 'Clear photos of the tree(s)', hi: 'झाड स्पष्ट दिसेल असे फोटो', mr: 'झाड स्पष्ट दिसेल असे फोटो' },
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxSize: 15
    },
    {
      id: 'authorizationProof',
      label: { en: 'Authorization / POA (if not owner)', hi: 'प्राधिकरण / POA (यदि मालिक नहीं)', mr: 'अधिकृत पत्र / POA (मालक नसल्यास)' },
      description: { en: 'Upload if applicant is not owner', hi: 'यदि आवेदक मालिक नहीं है', mr: 'अर्जदार मालक नसेल तर अपलोड करा' },
      required: false, // conditionally required in UI if applicantRelationship != 'owner'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'societyNocOrResolution',
      label: { en: 'Society NOC / Resolution (if applicable)', hi: 'सोसायटी NOC / ठराव (लागू असल्यास)', mr: 'सोसायटी NOC / ठराव (लागू असल्यास)' },
      description: { en: 'Upload if tree is in society premises', hi: 'यदि सोसायटीमध्ये असेल तर', mr: 'झाड सोसायटीमध्ये असल्यास अपलोड करा' },
      required: false, // conditionally required in UI if applicantType == 'society' or treeLocationType == 'society_premises'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'buildingPermissionDoc',
      label: { en: 'Building Permission / Approved Plan (if applicable)', hi: 'बिल्डिंग परमिशन / मंजूर प्लॅन (लागू असल्यास)', mr: 'बांधकाम परवानगी / मंजूर प्लॅन (लागू असल्यास)' },
      description: { en: 'Upload if reason is construction/development', hi: 'यदि कारण बांधकाम असेल तर', mr: 'कारण बांधकाम/विकास काम असेल तर अपलोड करा' },
      required: false, // conditionally required in UI if reasonCategory == 'construction'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    }
  ]
},

};
