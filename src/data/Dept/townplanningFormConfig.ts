// @ts-nocheck
//Townplanning


import { ServiceFormConfig , createAddressFieldsWithCity , declarationField, createApplicantInformationFields } from "./formTypes";
export const townplanningFormConfigs: Record<string, ServiceFormConfig> = {

// '7207': {
//   serviceId: '7207',

//   steps: [
//     // ------------------------------------------------------
//     // STEP 1 — APPLICANT DETAILS (MINIMUM + SENIOR FRIENDLY)
//     // ------------------------------------------------------
//     {
//       id: 'applicant-details',
//       title: {
//         en: 'Applicant Details',
//         hi: 'आवेदक का विवरण',
//         mr: 'अर्जदाराची माहिती',
//       },
//       fields: [
//         {
//           id: 'applicantFullName',
//           type: 'text',
//           label: { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
//           placeholder: { en: 'Enter full name', hi: 'पूर्ण नाम लिखें', mr: 'पूर्ण नाव लिहा' },
//           helperText: {
//             en: 'Certificate will be issued in this name.',
//             hi: 'प्रमाणपत्र इसी नाम पर जारी होगा।',
//             mr: 'प्रमाणपत्र या नावावर जारी होईल.',
//           },
//           required: true,
//           colSpan: 1,
//         },
//         {
//           id: 'mobileNo',
//           type: 'text',
//           label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
//           placeholder: { en: '10-digit mobile', hi: '10 अंकों का मोबाइल', mr: '10 अंकी मोबाईल' },
//           helperText: {
//             en: 'Used for OTP and application updates.',
//             hi: 'OTP और अपडेट के लिए।',
//             mr: 'OTP व अर्ज अपडेटसाठी.',
//           },
//           required: true,
//           colSpan: 1,
//           validation: { minLength: 10, maxLength: 10 },
//         },
//         {
//           id: 'alternateMobileNo',
//           type: 'text',
//           label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
//           placeholder: { en: 'Family member / caretaker', hi: 'परिजन/देखभालकर्ता', mr: 'नातेवाईक/केअरटेकर' },
//           helperText: {
//             en: 'Helpful for senior citizens.',
//             hi: 'वरिष्ठ नागरिकों के लिए उपयोगी।',
//             mr: 'ज्येष्ठ नागरिकांसाठी उपयुक्त.',
//           },
//           required: false,
//           colSpan: 1,
//           validation: { minLength: 10, maxLength: 10 },
//         },
//         {
//           id: 'dateOfBirth',
//           type: 'date',
//           label: { en: 'Date of Birth', hi: 'जन्म तिथि', mr: 'जन्मतारीख' },
//           helperText: {
//             en: 'For senior-citizen verification (if applicable).',
//             hi: 'वरिष्ठ नागरिक सत्यापन हेतु (लागू हो तो)।',
//             mr: 'ज्येष्ठ नागरिक सत्यापनासाठी (लागू असल्यास).',
//           },
//           required: true,
//           colSpan: 1,
//         },
//         {
//           id: 'applicantAddress',
//           type: 'textarea',
//           label: { en: 'Residential Address', hi: 'आवासीय पता', mr: 'राहण्याचा पत्ता' },
//           placeholder: { en: 'House no, area, city, PIN', hi: 'घर नं, क्षेत्र, शहर, पिन', mr: 'घर क्र, परिसर, शहर, पिन' },
//           helperText: {
//             en: 'Used for record and communication.',
//             hi: 'रिकॉर्ड व संप्रेषण हेतु।',
//             mr: 'नोंद व संपर्कासाठी.',
//           },
//           required: true,
//           colSpan: 1,
//         },
//         {
//           id: 'idProofType',
//           type: 'select',
//           label: { en: 'ID Proof Type', hi: 'पहचान पत्र प्रकार', mr: 'ओळखपत्र प्रकार' },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'aadhaar', label: { en: 'Aadhaar', hi: 'आधार', mr: 'आधार' } },
//             { value: 'voter', label: { en: 'Voter ID', hi: 'वोटर आईडी', mr: 'मतदार ओळखपत्र' } },
//             { value: 'pan', label: { en: 'PAN', hi: 'पैन', mr: 'पॅन' } },
//             { value: 'dl', label: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', mr: 'ड्रायव्हिंग लायसन्स' } },
//             { value: 'passport', label: { en: 'Passport', hi: 'पासपोर्ट', mr: 'पासपोर्ट' } },
//           ],
//         },
//         {
//           id: 'idProofNumber',
//           type: 'text',
//           label: { en: 'ID Proof Number', hi: 'पहचान पत्र क्रमांक', mr: 'ओळखपत्र क्रमांक' },
//           placeholder: { en: 'Enter number', hi: 'क्रमांक लिखें', mr: 'क्रमांक लिहा' },
//           helperText: {
//             en: 'For identity verification and audit.',
//             hi: 'सत्यापन व ऑडिट हेतु।',
//             mr: 'सत्यापन व ऑडिटसाठी.',
//           },
//           required: true,
//           colSpan: 1,
//           validation: { maxLength: 20 },
//         },
//       ],
//     },

//     // ------------------------------------------------------
//     // STEP 2 — PROPERTY IDENTIFICATION (MINIMUM, MAP SEARCH READY)
//     // ------------------------------------------------------
//     {
//       id: 'property-identification',
//       title: {
//         en: 'Property / Land Identification',
//         hi: 'संपत्ति / भूमि पहचान',
//         mr: 'मालमत्ता / जमीन ओळख',
//       },
//       description: {
//         en: 'These details help Town Planning locate the exact land on DP/RP map.',
//         hi: 'इन विवरणों से टाउन प्लानिंग डीपी/आरपी नकाशे पर सही भूमि ढूंढती है।',
//         mr: 'या तपशीलांमुळे टाउन प्लॅनिंग डीपी/आरपी नकाशावर नेमकी जमीन शोधते.',
//       },
//       fields: [
//         {
//           id: 'districtName',
//           type: 'text',
//           label: { en: 'District', hi: 'जिला', mr: 'जिल्हा' },
//           required: true,
//           colSpan: 1,
//         },
//         {
//           id: 'talukaName',
//           type: 'text',
//           label: { en: 'Taluka / Tehsil', hi: 'तालुका / तहसील', mr: 'तालुका' },
//           required: true,
//           colSpan: 1,
//         },
//         {
//           id: 'villageOrLocality',
//           type: 'text',
//           label: { en: 'Village / Locality', hi: 'गांव / क्षेत्र', mr: 'गाव / परिसर' },
//           required: true,
//           colSpan: 1,
//         },

//         // Instead of multiple confusing numbers, keep ONE required identifier:
//         {
//           id: 'propertyIdType',
//           type: 'select',
//           label: { en: 'Property Identifier Type', hi: 'पहचान प्रकार', mr: 'ओळख प्रकार' },
//           helperText: {
//             en: 'Select the number you have (CTS/Survey/Gat etc.).',
//             hi: 'आपके पास जो नंबर है वह चुनें (CTS/Survey/Gat आदि)।',
//             mr: 'तुमच्याकडे जो नंबर आहे तो निवडा (CTS/Survey/Gat इ.).',
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'cts', label: { en: 'CTS / City Survey No.', hi: 'CTS / सिटी सर्वे', mr: 'CTS / सिटी सर्व्हे' } },
//             { value: 'survey', label: { en: 'Survey No.', hi: 'सर्वे नंबर', mr: 'सर्व्हे नंबर' } },
//             { value: 'gat', label: { en: 'Gat No.', hi: 'गट नंबर', mr: 'गट नंबर' } },
//             { value: 'finalPlot', label: { en: 'Final Plot No. (if TPS)', hi: 'फाइनल प्लॉट (TPS)', mr: 'फायनल प्लॉट (TPS)' } },
//             { value: 'propertyCard', label: { en: 'Property Card No.', hi: 'प्रॉपर्टी कार्ड', mr: 'मालमत्ता कार्ड' } },
//           ],
//         },
//         {
//           id: 'propertyIdNumber',
//           type: 'text',
//           label: { en: 'Identifier Number', hi: 'पहचान क्रमांक', mr: 'ओळख क्रमांक' },
//           placeholder: { en: 'Enter number', hi: 'क्रमांक लिखें', mr: 'क्रमांक लिहा' },
//           helperText: {
//             en: 'This is the main number used to locate your land on the map.',
//             hi: 'यही मुख्य नंबर नकाशे पर जमीन ढूंढने हेतु उपयोग होता है।',
//             mr: 'हा मुख्य नंबर नकाशावर जमीन शोधण्यासाठी वापरला जातो.',
//           },
//           required: true,
//           colSpan: 1,
//           validation: { maxLength: 50 },
//         },

//         {
//           id: 'plotAddressLandmark',
//           type: 'textarea',
//           label: { en: 'Plot Address / Landmark (recommended)', hi: 'प्लॉट पता / लैंडमार्क (अनुशंसित)', mr: 'प्लॉट पत्ता / लँडमार्क (शिफारस)' },
//           placeholder: { en: 'Road name, near school/temple, etc.', hi: 'रोड नाम, स्कूल/मंदिर के पास', mr: 'रस्ता नाव, शाळा/मंदिर जवळ' },
//           helperText: {
//             en: 'Helps confirm the correct plot if numbers are unclear.',
//             hi: 'नंबर अस्पष्ट हो तो सही प्लॉट पुष्टि में मदद करता है।',
//             mr: 'नंबर अस्पष्ट असल्यास योग्य प्लॉट निश्चित करण्यास मदत.',
//           },
//           required: false,
//           colSpan: 1,
//         },
//       ],
//     },

//     // ------------------------------------------------------
//     // STEP 3 — REQUEST DETAILS
//     // ------------------------------------------------------
//     {
//       id: 'request-details',
//       title: {
//         en: 'Request Details',
//         hi: 'विनंती तपशील',
//         mr: 'विनंती तपशील',
//       },
//       fields: [
//         {
//           id: 'purpose',
//           type: 'select',
//           label: { en: 'Purpose of Zone Certificate', hi: 'जोन प्रमाणपत्र का उद्देश्य', mr: 'झोन प्रमाणपत्र कशासाठी?' },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'sale', label: { en: 'Sale / Registry', hi: 'विक्री / नोंदणी', mr: 'विक्री / नोंदणी' } },
//             { value: 'loan', label: { en: 'Bank Loan', hi: 'बँक कर्ज', mr: 'बँक कर्ज' } },
//             { value: 'na', label: { en: 'NA / Land Conversion', hi: 'एनए / रूपांतरण', mr: 'NA / रूपांतरण' } },
//             { value: 'buildingPermission', label: { en: 'Building Permission', hi: 'बांधकाम परवानगी', mr: 'बांधकाम परवानगी' } },
//             { value: 'court', label: { en: 'Court / Legal', hi: 'न्यायालय / कायदेशीर', mr: 'न्यायालय / कायदेशीर' } },
//             { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } },
//           ],
//         },
//         {
//           id: 'applicantRelationship',
//           type: 'select',
//           label: { en: 'Applicant Relationship to Property', hi: 'मालमत्तेसोबत अर्जदाराचा संबंध', mr: 'मालमत्तेशी अर्जदाराचा संबंध' },
//           helperText: {
//             en: 'If not owner, authorization may be needed.',
//             hi: 'यदि मालिक नहीं हैं तो अधिकृत पत्र आवश्यक हो सकता है।',
//             mr: 'मालक नसल्यास अधिकृत पत्र आवश्यक असू शकते.',
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'owner', label: { en: 'Owner', hi: 'मालक', mr: 'मालक' } },
//             { value: 'coOwner', label: { en: 'Co-owner', hi: 'सह-मालक', mr: 'सह-मालक' } },
//             { value: 'poa', label: { en: 'POA Holder', hi: 'पावर ऑफ अटर्नी', mr: 'पॉवर ऑफ अटर्नी' } },
//             { value: 'relative', label: { en: 'Relative', hi: 'नातेवाईक', mr: 'नातेवाईक' } },
//             { value: 'purchaser', label: { en: 'Purchaser', hi: 'खरेदीदार', mr: 'खरेदीदार' } },
//             { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } },
//           ],
//         },
//       ],
//     },

//     // ------------------------------------------------------
//     // STEP 4 — DECLARATION
//     // ------------------------------------------------------
//     {
//       id: 'declaration',
//       title: {
//         en: 'Declaration',
//         hi: 'घोषणा',
//         mr: 'घोषणापत्र',
//       },
//       fields: [
//         ...declarationField(),
//       ],
//     },
//   ],

//   documents: [
//     {
//       id: 'identityProof',
//       label: {
//         en: 'Identity Proof of Applicant',
//         hi: 'आवेदक का पहचान पत्र',
//         mr: 'अर्जदाराचे ओळखपत्र',
//       },
//       description: {
//         en: 'Aadhaar / Voter ID / PAN / Driving License / Passport',
//         hi: 'आधार / वोटर आईडी / पैन / ड्राइविंग लाइसेंस / पासपोर्ट',
//         mr: 'आधार / मतदार ओळखपत्र / पॅन / ड्रायव्हिंग लायसन्स / पासपोर्ट',
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 5,
//     },
//     {
//       id: 'ownershipProof',
//       label: {
//         en: 'Ownership / Land Record Proof',
//         hi: 'स्वामित्व / भूमि रिकॉर्ड',
//         mr: 'मालकी / जमीन नोंद पुरावा',
//       },
//       description: {
//         en: 'Any one: 7/12 Extract / Property Card / Mutation / Sale deed index / Tax receipt (as applicable)',
//         hi: 'कोई एक: 7/12 / प्रॉपर्टी कार्ड / फेरफार / बिक्री दस्तावेज़ इंडेक्स / कर पावती',
//         mr: 'कोणताही एक: 7/12 / मालमत्ता कार्ड / फेरफार / विक्री दस्तऐवज इंडेक्स / कर पावती',
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10,
//     },
//     {
//       id: 'locationMap',
//       label: {
//         en: 'Location Map / Site Sketch',
//         hi: 'लोकेशन नकाशा / साइट स्केच',
//         mr: 'लोकेशन नकाशा / साइट स्केच',
//       },
//       description: {
//         en: 'Simple map showing plot location with nearby road/landmark',
//         hi: 'प्लॉट लोकेशन के साथ पास का रोड/लैंडमार्क दिखाने वाला सरल नकाशा',
//         mr: 'प्लॉट लोकेशन व आजूबाजूचा रस्ता/लँडमार्क दाखवणारा साधा नकाशा',
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10,
//     },
//     {
//       id: 'authorizationProof',
//       label: {
//         en: 'Authorization / POA (if applicant is not owner)',
//         hi: 'अधिकृत पत्र / POA (यदि आवेदक मालिक नहीं है)',
//         mr: 'अधिकृत पत्र / POA (अर्जदार मालक नसल्यास)',
//       },
//       description: {
//         en: 'Upload if relationship is POA/Relative/Purchaser/Other',
//         hi: 'यदि संबंध POA/Relative/Purchaser/Other है तो अपलोड करें',
//         mr: 'संबंध POA/नातेवाईक/खरेदीदार/इतर असल्यास अपलोड करा',
//       },
//       required: false,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10,
//     },
//   ],
// },

  // 7209 - Issuance of Occupancy Certificate
  
// '7207': {
//   serviceId: '7207',

//   steps: [
//     // ------------------------------------------------------
//     // STEP 1: Applicant Details (Removed Senior Citizen fields)
//     // ------------------------------------------------------
//     {
//       id: 'applicant-details',
//       title: { en: 'Applicant Details', hi: 'आवेदक का विवरण', mr: 'अर्जदाराची माहिती' },
//       fields: [
//         {
//           id: 'applicantFullName',
//           type: 'text',
//           label: { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
//           placeholder: { en: 'Enter full name', hi: 'पूर्ण नाम लिखें', mr: 'पूर्ण नाव लिहा' },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'mobileNo',
//           type: 'text',
//           label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
//           placeholder: { en: '10-digit mobile', hi: '10 अंकों का मोबाइल', mr: '10 अंकी मोबाईल' },
//           required: true,
//           colSpan: 1,
//           validation: { minLength: 10, maxLength: 10 }
//         },
//         {
//           id: 'alternateMobileNo',
//           type: 'text',
//           label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
//           placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
//           required: false,
//           colSpan: 1,
//           validation: { minLength: 10, maxLength: 10 }
//         },
//         {
//           id: 'applicantAddress',
//           type: 'textarea',
//           label: { en: 'Residential Address', hi: 'आवासीय पता', mr: 'राहण्याचा पत्ता' },
//           placeholder: { en: 'House no, area, city, PIN', hi: 'घर नं, क्षेत्र, शहर, पिन', mr: 'घर क्र, परिसर, शहर, पिन' },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'idProofType',
//           type: 'select',
//           label: { en: 'ID Proof Type', hi: 'पहचान पत्र प्रकार', mr: 'ओळखपत्र प्रकार' },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'aadhaar', label: { en: 'Aadhaar', hi: 'आधार', mr: 'आधार' } },
//             { value: 'voter', label: { en: 'Voter ID', hi: 'वोटर आईडी', mr: 'मतदार ओळखपत्र' } },
//             { value: 'pan', label: { en: 'PAN', hi: 'पैन', mr: 'पॅन' } },
//             { value: 'dl', label: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', mr: 'ड्रायव्हिंग लायसन्स' } },
//             { value: 'passport', label: { en: 'Passport', hi: 'पासपोर्ट', mr: 'पासपोर्ट' } }
//           ]
//         },
//         {
//           id: 'idProofNumber',
//           type: 'text',
//           label: { en: 'ID Proof Number', hi: 'पहचान पत्र क्रमांक', mr: 'ओळखपत्र क्रमांक' },
//           placeholder: { en: 'Enter number', hi: 'क्रमांक लिखें', mr: 'क्रमांक लिहा' },
//           required: true,
//           colSpan: 1,
//           validation: { maxLength: 20 }
//         }
//       ]
//     },

//     // ------------------------------------------------------
//     // STEP 2: Ward / Zone & Property Details
//     // ------------------------------------------------------
//     {
//       id: 'property-search',
//       title: { en: 'Ward / Zone & Property Details', hi: 'वार्ड / ज़ोन व संपत्ति विवरण', mr: 'वार्ड / झोन व मालमत्ता तपशील' },
//       description: {
//         en: 'Enter Property No and fetch property details to reduce typing.',
//         hi: 'प्रॉपर्टी नंबर डालें और जानकारी ऑटो-फेच करें।',
//         mr: 'प्रॉपर्टी नंबर टाका आणि माहिती ऑटो-फेच करा.'
//       },
//       fields: [
//         {
//           id: 'wardId',
//           type: 'select',
//           label: { en: 'Ward', hi: 'वार्ड', mr: 'वार्ड' },
//           required: true,
//           colSpan: 1,
//           options: [] // ward master
//         },
//         {
//           id: 'zoneId',
//           type: 'select',
//           label: { en: 'Zone', hi: 'ज़ोन', mr: 'झोन' },
//           required: true,
//           colSpan: 1,
//           options: [] // zone master (filtered by ward)
//         },
//         {
//           id: 'propertyIdType',
//           type: 'select',
//           label: { en: 'Property Identifier Type', hi: 'पहचान प्रकार', mr: 'ओळख प्रकार' },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'upic', label: { en: 'UPIC / Unique Property ID', hi: 'यूनिक प्रॉपर्टी आईडी', mr: 'UPIC / युनिक प्रॉपर्टी आयडी' } },
//             { value: 'propertyTaxNo', label: { en: 'Property Tax Account No', hi: 'संपत्ति कर खाता नं', mr: 'मालमत्ता कर खाते क्र.' } },
//             { value: 'propertyNo', label: { en: 'Municipal Property No', hi: 'नगरपालिका प्रॉपर्टी नं', mr: 'पालिका प्रॉपर्टी क्र.' } },
//             { value: 'cts', label: { en: 'CTS / City Survey No', hi: 'CTS / सिटी सर्वे', mr: 'CTS / सिटी सर्व्हे' } }
//           ]
//         },
//         {
//           id: 'propertyIdNo',
//           type: 'text',
//           label: { en: 'Property Identifier Number', hi: 'पहचान क्रमांक', mr: 'ओळख क्रमांक' },
//           required: true,
//           colSpan: 1,
//           validation: { maxLength: 50 }
//         },
//         {
//           id: 'fetchedOwnerName',
//           type: 'text',
//           label: { en: 'Owner Name (Auto)', hi: 'मालकाचे नाव (ऑटो)', mr: 'मालकाचे नाव (ऑटो)' },
//           required: false,
//           colSpan: 1,
//           disabled: true
//         },
//         {
//           id: 'fetchedPropertyAddress',
//           type: 'textarea',
//           label: { en: 'Property Address (Auto)', hi: 'संपत्ति पता (ऑटो)', mr: 'मालमत्ता पत्ता (ऑटो)' },
//           required: false,
//           colSpan: 1,
//           disabled: true
//         }
//       ]
//     },

//     // ------------------------------------------------------
//     // STEP 3: Request Details (Keep Certificate Language)
//     // ------------------------------------------------------
//     {
//       id: 'request-details',
//       title: { en: 'Request Details', hi: 'विनंती तपशील', mr: 'विनंती तपशील' },
//       fields: [
//         {
//           id: 'purpose',
//           type: 'select',
//           label: { en: 'Purpose', hi: 'उद्देश्य', mr: 'कशासाठी?' },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'sale', label: { en: 'Sale / Registry', hi: 'विक्री / नोंदणी', mr: 'विक्री / नोंदणी' } },
//             { value: 'loan', label: { en: 'Bank Loan', hi: 'बँक कर्ज', mr: 'बँक कर्ज' } },
//             { value: 'buildingPermission', label: { en: 'Building Permission', hi: 'बांधकाम परवानगी', mr: 'बांधकाम परवानगी' } },
//             { value: 'court', label: { en: 'Court / Legal', hi: 'न्यायालय / कायदेशीर', mr: 'न्यायालय / कायदेशीर' } },
//             { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
//           ]
//         },
     
//         {
//           id: 'applicantRelationship',
//           type: 'select',
//           label: { en: 'Relationship to Property', hi: 'मालमत्तेसोबत संबंध', mr: 'मालमत्तेशी संबंध' },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'owner', label: { en: 'Owner', hi: 'मालक', mr: 'मालक' } },
//             { value: 'poa', label: { en: 'POA Holder', hi: 'POA धारक', mr: 'मुखत्यार (POA)' } },
//             { value: 'relative', label: { en: 'Relative', hi: 'नातेवाईक', mr: 'नातेवाईक' } },
//             { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
//           ]
//         }
//       ]
//     },

//     // ------------------------------------------------------
//     // STEP 4: Declaration
//     // ------------------------------------------------------
//     {
//       id: 'declaration',
//       title: { en: 'Declaration', hi: 'घोषणा', mr: 'घोषणापत्र' },
//       fields: [
//         ...declarationField()
//       ]
//     }
//   ],

//   documents: [
//     {
//       id: 'identityProof',
//       label: { en: 'ID Proof', hi: 'पहचान पत्र', mr: 'ओळखपत्र' },
//       description: { en: 'Aadhaar/Voter/PAN etc.', hi: 'आधार/वोटर/पैन आदि', mr: 'आधार/मतदार/पॅन इ.' },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 5
//     },
//     {
//       id: 'ownershipProof',
//       label: { en: 'Ownership Proof', hi: 'स्वामित्व प्रमाण', mr: 'मालकी पुरावा' },
//       description: { en: 'Any one: Tax receipt / Property Card / 7/12 etc.', hi: 'कोई एक: कर पावती / प्रॉपर्टी कार्ड / 7/12', mr: 'कोणताही एक: कर पावती / मालमत्ता कार्ड / 7/12' },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10
//     },
//     {
//       id: 'locationMap',
//       label: { en: 'Location Map / Site Sketch', hi: 'लोकेशन नकाशा / स्केच', mr: 'लोकेशन नकाशा / स्केच' },
//       description: { en: 'Simple map with landmark/road', hi: 'सरल नकाशा', mr: 'साधा नकाशा' },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10
//     },
//     {
//       id: 'authorizationProof',
//       label: { en: 'Authorization/POA (if not owner)', hi: 'प्राधिकरण/POA (यदि मालिक नहीं)', mr: 'अधिकृत पत्र/POA (मालक नसल्यास)' },
//       description: { en: 'Upload if applicant is not owner', hi: 'यदि आवेदक मालिक नहीं है', mr: 'अर्जदार मालक नसेल तर' },
//       required: false,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10
//     }
//   ]
// },
'7207': {
  serviceId: '7207',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant Details
    // ------------------------------------------------------
    {
      id: 'applicant-details',
      title: { en: 'Applicant Details', hi: 'आवेदक का विवरण', mr: 'अर्जदाराची माहिती' },
      fields: [
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
          id: 'alternateMobileNo',
          type: 'text',
          label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        },
        {
          id: 'applicantAddress',
          type: 'textarea',
          label: { en: 'Residential Address', hi: 'आवासीय पता', mr: 'राहण्याचा पत्ता' },
          placeholder: { en: 'House no, area, city, PIN', hi: 'घर नं, क्षेत्र, शहर, पिन', mr: 'घर क्र, परिसर, शहर, पिन' },
          required: true,
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
            { value: 'dl', label: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', mr: 'ड्रायव्हिंग लायसन्स' } },
            { value: 'passport', label: { en: 'Passport', hi: 'पासपोर्ट', mr: 'पासपोर्ट' } }
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
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Property No (Auto-Fetch Ward/Zone/Owner/Address)
    // NOTE: Property No/UPIC select केल्यावर Ward/Zone/Owner/Address auto-fill (read-only)
    // ------------------------------------------------------
    {
      id: 'property-details',
      title: { en: 'Ward / Zone & Property Details', hi: 'वार्ड / ज़ोन व संपत्ति विवरण', mr: 'वार्ड / झोन व मालमत्ता तपशील' },
      description: {
        en: 'Select Property No/UPIC to auto-fetch property details.',
        hi: 'Property No/UPIC चुनकर जानकारी ऑटो-फेच करें।',
        mr: 'Property No/UPIC निवडून माहिती ऑटो-फेच करा.'
      },
      fields: [
        {
          id: 'propertyNo',
          type: 'select',
          label: { en: 'Select Property No / UPIC', hi: 'प्रॉपर्टी नं / UPIC निवडा', mr: 'प्रॉपर्टी नं / UPIC निवडा' },
          required: true,
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
          label: { en: 'Zone (Auto)', hi: 'ज़ोन (ऑटो)', mr: 'झोन (ऑटो)' },
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
          label: { en: 'Property Address (Auto)', hi: 'संपत्ति पता (ऑटो)', mr: 'मालमत्ता पत्ता (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: Request Details
    // NOTE: applicantRelationship != 'owner' => authorizationProof document should be required in UI
    // ------------------------------------------------------
    {
      id: 'request-details',
      title: { en: 'Request Details', hi: 'विनंती तपशील', mr: 'विनंती तपशील' },
      fields: [
        {
          id: 'purpose',
          type: 'select',
          label: { en: 'Purpose', hi: 'उद्देश्य', mr: 'कशासाठी?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'sale', label: { en: 'Sale / Registry', hi: 'विक्री / नोंदणी', mr: 'विक्री / नोंदणी' } },
            { value: 'loan', label: { en: 'Bank Loan', hi: 'बँक कर्ज', mr: 'बँक कर्ज' } },
            { value: 'buildingPermission', label: { en: 'Building Permission', hi: 'बांधकाम परवानगी', mr: 'बांधकाम परवानगी' } },
            { value: 'court', label: { en: 'Court / Legal', hi: 'न्यायालय / कायदेशीर', mr: 'न्यायालय / कायदेशीर' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
      
        {
          id: 'applicantRelationship',
          type: 'select',
          label: { en: 'Relationship to Property', hi: 'मालमत्तेसोबत संबंध', mr: 'मालमत्तेशी संबंध' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'owner', label: { en: 'Owner', hi: 'मालक', mr: 'मालक' } },
            { value: 'poa', label: { en: 'POA Holder', hi: 'POA धारक', mr: 'मुखत्यार (POA)' } },
            { value: 'relative', label: { en: 'Relative', hi: 'नातेवाईक', mr: 'नातेवाईक' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Declaration
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
      description: {
        en: 'Any one: Tax receipt / Property Card / 7/12 etc.',
        hi: 'कोई एक: कर पावती / प्रॉपर्टी कार्ड / 7/12',
        mr: 'कोणताही एक: कर पावती / मालमत्ता कार्ड / 7/12'
      },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'locationMap',
      label: { en: 'Location Map / Site Sketch (optional)', hi: 'लोकेशन नकाशा / स्केच (वैकल्पिक)', mr: 'लोकेशन नकाशा / स्केच (ऐच्छिक)' },
      description: {
        en: 'Upload if location is not clear from property details.',
        hi: 'यदि लोकेशन स्पष्ट न हो तो अपलोड करें।',
        mr: 'प्रॉपर्टी माहितीवरून लोकेशन स्पष्ट नसेल तर अपलोड करा.'
      },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'authorizationProof',
      label: { en: 'Authorization/POA (if not owner)', hi: 'प्राधिकरण/POA (यदि मालिक नहीं)', mr: 'अधिकृत पत्र/POA (मालक नसल्यास)' },
      description: { en: 'Upload if applicant is not owner', hi: 'यदि आवेदक मालिक नहीं है', mr: 'अर्जदार मालक नसेल तर' },
      required: false, // conditionally required in UI if applicantRelationship != 'owner'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ]
},


  // '7209': {
  //   serviceId: '7209',
  //   steps: [
  //     {
  //       id: "applicant-information",
  //       title: {
  //         en: "Applicant Information",
  //         hi: "आवेदक की जानकारी",
  //         mr: "आवेदकाची माहिती",
  //       },
  //       fields: createApplicantInformationFields(),
  //     },
  //     {
  //       id: 'architect-info',
  //       title: { en: 'Architect Information', hi: 'वास्तुकार की जानकारी', mr: 'वास्तुविशारदाची माहिती' },
  //       fields: [
  //         {
  //           id: 'architectName',
  //           type: 'text',
  //           label: { en: 'Architect Name', hi: 'वास्तुकार का नाम', mr: 'वास्तुविशारदाचे नाव' },
  //           required: true,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'architectLicenseNo',
  //           type: 'text',
  //           label: { en: 'Architect License No.', hi: 'वास्तुकार लाइसेंस नंबर', mr: 'वास्तुविशारद परवाना क्र.' },
  //           required: true,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'architectMobile',
  //           type: 'tel',
  //           label: { en: 'Architect Mobile', hi: 'वास्तुकार मोबाइल', mr: 'वास्तुविशारद मोबाईल' },
  //           required: true,
  //           validation: { pattern: '^[0-9]{10}$', maxLength: 10 },
  //           colSpan: 1
  //         }
  //       ]
  //     },
  //     {
  //       id: 'property-details',
  //       title: { en: 'Property & Construction Details', hi: 'संपत्ति और निर्माण विवरण', mr: 'मालमत्ता आणि बांधकाम तपशील' },
  //       fields: [
  //         {
  //           id: 'plotNo',
  //           type: 'text',
  //           label: { en: 'Plot/Survey No.', hi: 'प्लॉट/सर्वे नंबर', mr: 'प्लॉट/सर्व्हे क्र.' },
  //           required: true,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'gatNo',
  //           type: 'text',
  //           label: { en: 'Gat No.', hi: 'गट नंबर', mr: 'गट क्र.' },
  //           required: false,
  //           colSpan: 1
  //         },
  //         ...createAddressFieldsWithCity('property'),
  //         {
  //           id: 'plotArea',
  //           type: 'number',
  //           label: { en: 'Plot Area (sq. m)', hi: 'प्लॉट क्षेत्र (वर्ग मी)', mr: 'प्लॉट क्षेत्र (चौ. मी)' },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 1 }
  //         },
  //         {
  //           id: 'proposedBuiltUpArea',
  //           type: 'number',
  //           label: { en: 'Proposed Built-up Area (sq. m)', hi: 'प्रस्तावित निर्मित क्षेत्र (वर्ग मी)', mr: 'प्रस्तावित बांधकाम क्षेत्र (चौ. मी)' },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 1 }
  //         },
  //         {
  //           id: 'numberOfFloors',
  //           type: 'number',
  //           label: { en: 'Number of Floors', hi: 'मंजिलों की संख्या', mr: 'मजल्यांची संख्या' },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 1, max: 50 }
  //         },
  //         {
  //           id: 'buildingHeight',
  //           type: 'number',
  //           label: { en: 'Total Building Height (m)', hi: 'कुल इमारत ऊंचाई (मी)', mr: 'एकूण इमारत उंची (मी)' },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 1 }
  //         },
  //         {
  //           id: 'buildingType',
  //           type: 'select',
  //           label: { en: 'Building Type', hi: 'भवन प्रकार', mr: 'इमारत प्रकार' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'residential', label: { en: 'Residential', hi: 'आवासीय', mr: 'निवासी' } },
  //             { value: 'commercial', label: { en: 'Commercial', hi: 'वाणिज्यिक', mr: 'व्यावसायिक' } },
  //             { value: 'mixed', label: { en: 'Mixed Use', hi: 'मिश्रित उपयोग', mr: 'मिश्र वापर' } },
  //             { value: 'industrial', label: { en: 'Industrial', hi: 'औद्योगिक', mr: 'औद्योगिक' } }
  //           ]
  //         },
  //         {
  //           id: 'constructionType',
  //           type: 'select',
  //           label: { en: 'Construction Type', hi: 'निर्माण प्रकार', mr: 'बांधकाम प्रकार' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'new', label: { en: 'New Construction', hi: 'नया निर्माण', mr: 'नवीन बांधकाम' } },
  //             { value: 'addition', label: { en: 'Addition/Extension', hi: 'वृद्धि/विस्तार', mr: 'वाढ/विस्तार' } },
  //             { value: 'renovation', label: { en: 'Renovation', hi: 'नवीनीकरण', mr: 'नूतनीकरण' } }
  //           ]
  //         }
  //       ]
  //     },
  //     // ------------------------------------------------------
  //     // Declaration
  //     // ------------------------------------------------------
  //       {
  //         id: 'declaration',
  //         title: {
  //           en: 'Declaration',
  //           hi: 'घोषणा',
  //           mr: 'घोषणापत्र'
  //         },
  //         fields: [
  //           ...declarationField(),
  //         ]
  //       }
  //   ],
  //   documents: [
  //     {
  //       id: 'ownershipProof',
  //       label: { en: 'Property Ownership Proof', hi: 'संपत्ति स्वामित्व प्रमाण', mr: 'मालमत्ता मालकी पुरावा' },
  //       description: { en: '7/12 Extract, Property Card, Sale Deed', hi: '7/12 उद्धरण, संपत्ति कार्ड, बिक्री विलेख', mr: '7/12 उतारा, मालमत्ता कार्ड, विक्री खत' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  //       maxSize: 5
  //     },
  //     {
  //       id: 'architecturalDrawings',
  //       label: { en: 'Architectural Drawings', hi: 'वास्तुशिल्प चित्र', mr: 'वास्तुविशारद रेखाचित्रे' },
  //       description: { en: 'Building plans, elevations, sections signed by licensed architect', hi: 'लाइसेंस प्राप्त वास्तुकार द्वारा हस्ताक्षरित भवन योजनाएं, ऊंचाई, खंड', mr: 'परवानाधारक वास्तुविशारदाने स्वाक्षरी केलेली इमारत योजना, उंची, विभाग' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  //       maxSize: 20
  //     },
  //     {
  //       id: 'structuralDrawings',
  //       label: { en: 'Structural Drawings', hi: 'संरचनात्मक चित्र', mr: 'संरचनात्मक रेखाचित्रे' },
  //       description: { en: 'Structural designs signed by structural engineer', hi: 'संरचनात्मक इंजीनियर द्वारा हस्ताक्षरित संरचनात्मक डिजाइन', mr: 'संरचनात्मक अभियंत्याने स्वाक्षरी केलेली संरचनात्मक रचना' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  //       maxSize: 20
  //     },
  //     {
  //       id: 'ownerIdProof',
  //       label: { en: 'Owner ID Proof', hi: 'मालिक का पहचान प्रमाण', mr: 'मालकाचा ओळख पुरावा' },
  //       description: { en: 'Aadhaar/PAN/Passport', hi: 'आधार/पैन/पासपोर्ट', mr: 'आधार/पॅन/पारपत्र' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  //       maxSize: 5
  //     },
  //     {
  //       id: 'architectLicense',
  //       label: { en: 'Architect License Copy', hi: 'वास्तुकार लाइसेंस की प्रति', mr: 'वास्तुविशारद परवान्याची प्रत' },
  //       description: { en: 'Valid architect registration certificate', hi: 'वैध वास्तुकार पंजीकरण प्रमाणपत्र', mr: 'वैध वास्तुविशारद नोंदणी प्रमाणपत्र' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  //       maxSize: 5
  //     }
  //   ]
  // },



// 7207 – Issuance of Zone Certificate


// 7211 – Issuance of Occupancy Certificate
  '7209': {
  serviceId: '7209',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant Details
    // ------------------------------------------------------
    {
      id: 'applicant-details',
      title: { en: 'Applicant Details', hi: 'आवेदक का विवरण', mr: 'अर्जदाराची माहिती' },
      fields: [
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
          id: 'alternateMobileNo',
          type: 'text',
          label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        },
        {
          id: 'applicantAddress',
          type: 'textarea',
          label: { en: 'Residential Address', hi: 'आवासीय पता', mr: 'राहण्याचा पत्ता' },
          placeholder: { en: 'House no, area, city, PIN', hi: 'घर नं, क्षेत्र, शहर, पिन', mr: 'घर क्र, परिसर, शहर, पिन' },
          required: true,
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
            { value: 'dl', label: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', mr: 'ड्रायव्हिंग लायसन्स' } },
            { value: 'passport', label: { en: 'Passport', hi: 'पासपोर्ट', mr: 'पासपोर्ट' } }
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
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Ward / Zone & Property Details (Auto-Fetch)
    // NOTE:
    // 1) propertyNo first position
    // 2) propertyNo select केल्यावर Ward/Zone/Owner/Address/PlotArea/CTS etc. auto-fill (read-only)
    // ------------------------------------------------------
    {
      id: 'property-details',
      title: { en: 'Ward / Zone & Property Details', hi: 'वार्ड / ज़ोन व संपत्ति विवरण', mr: 'वार्ड / झोन व मालमत्ता तपशील' },
      description: {
        en: 'Select property number and auto-fetch property details from municipal records.',
        hi: 'प्रॉपर्टी नंबर निवडा आणि नगरपालिकेच्या नोंदीतून माहिती ऑटो-फेच करा।',
        mr: 'प्रॉपर्टी नंबर निवडा आणि पालिकेच्या नोंदीतून माहिती ऑटो-फेच करा.'
      },
      fields: [
        {
          id: 'propertyNo',
          type: 'select',
          label: { en: 'Select Property No / UPIC', hi: 'प्रॉपर्टी नं / UPIC निवडा', mr: 'प्रॉपर्टी नं / UPIC निवडा' },
          required: true,
          colSpan: 1,
          options: [] // populate dynamically from DB/API (searchable dropdown recommended)
        },
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward (Auto)', hi: 'वार्ड (ऑटो)', mr: 'वार्ड (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [], // ward master
          disabled: true
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone (Auto)', hi: 'झोन (ऑटो)', mr: 'झोन (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [], // zone master
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
          label: { en: 'Property Address (Auto)', hi: 'संपत्ति पता (ऑटो)', mr: 'मालमत्ता पत्ता (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        },
        {
          id: 'plotAreaSqm',
          type: 'number',
          label: { en: 'Plot Area (sq. m) (Auto)', hi: 'प्लॉट क्षेत्र (वर्ग मी.) (ऑटो)', mr: 'प्लॉट क्षेत्र (चौ. मी.) (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        },
        {
          id: 'ctsSurveyNo',
          type: 'text',
          label: { en: 'CTS / Survey No (Auto)', hi: 'CTS / सर्वे नं (ऑटो)', mr: 'CTS / सर्व्हे क्र (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: Proposal / Work Details
    // ------------------------------------------------------
    {
      id: 'proposal-details',
      title: { en: 'Construction Proposal Details', hi: 'निर्माण प्रस्ताव विवरण', mr: 'बांधकाम प्रस्ताव तपशील' },
      fields: [
        {
          id: 'typeOfWork',
          type: 'select',
          label: { en: 'Type of Work', hi: 'कार्य का प्रकार', mr: 'कामाचा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'new', label: { en: 'New Construction', hi: 'नवीन निर्माण', mr: 'नवीन बांधकाम' } },
            { value: 'addition', label: { en: 'Addition (Extra)', hi: 'अतिरिक्त', mr: 'अतिरिक्त (मजला/भाग)' } },
            { value: 'alteration', label: { en: 'Alteration (Change)', hi: 'बदल', mr: 'बदल (Alteration)' } },
            { value: 'redevelopment', label: { en: 'Redevelopment', hi: 'पुनर्विकास', mr: 'पुनर्विकास' } },
            { value: 'repair', label: { en: 'Repair', hi: 'दुरुस्ती', mr: 'दुरुस्ती' } }
          ]
        },
        {
          id: 'buildingUse',
          type: 'select',
          label: { en: 'Building Use', hi: 'भवन उपयोग', mr: 'इमारतीचा वापर' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'residential', label: { en: 'Residential', hi: 'आवासीय', mr: 'निवासी' } },
            { value: 'commercial', label: { en: 'Commercial', hi: 'वाणिज्यिक', mr: 'व्यावसायिक' } },
            { value: 'mixed', label: { en: 'Mixed Use', hi: 'मिश्रित', mr: 'मिश्र वापर' } },
            { value: 'industrial', label: { en: 'Industrial', hi: 'औद्योगिक', mr: 'औद्योगिक' } },
            { value: 'institutional', label: { en: 'Institutional', hi: 'संस्थात्मक', mr: 'संस्थात्मक' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
{
  id: 'proposedFloors',
  type: 'number',
  label: { en: 'Total Floors (Proposed)', hi: 'प्रस्तावित कुल मंज़िलें', mr: 'प्रस्तावित एकूण मजले' },
  placeholder: { en: 'e.g. Ground+1 = 2', hi: 'उदा: ग्राउंड+1 = 2', mr: 'उदा: भूतल+1 = 2' },
  helperText: {
    en: 'Enter total floors count (Ground+2 = 3)',
    hi: 'कुल मंज़िलें लिखें (ग्राउंड+2 = 3)',
    mr: 'एकूण मजले लिहा (भूतल+2 = 3)'
  },
  required: true,
  colSpan: 1,
  validation: { min: 0 }
},

     {
  id: 'proposedBuiltUpAreaSqm',
  type: 'number',
  label: { en: 'Total Built-up Area (sq. m)', hi: 'कुल निर्मित क्षेत्र (वर्ग मी.)', mr: 'एकूण बांधकाम क्षेत्र (चौ. मी.)' },
  placeholder: { en: 'e.g. 100', hi: 'उदा: 100', mr: 'उदा: 100' },
  helperText: {
    en: 'Sum of all floor areas (estimate is ok)',
    hi: 'सभी मंज़िलों के क्षेत्र का योग (अंदाज़ा चलेगा)',
    mr: 'सर्व मजल्यांचे क्षेत्रफळ मिळून (आंदाज चालेल)'
  },
  required: true,
  colSpan: 1,
  validation: { min: 0 }
}
,
        {
          id: 'hasBasementOrStilt',
          type: 'select',
          label: { en: 'Basement / Stilt Parking?', hi: 'बेसमेंट / स्टिल्ट पार्किंग?', mr: 'बेसमेंट / स्टिल्ट पार्किंग?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'buildingHeightM',
          type: 'number',
          label: { en: 'Building Height (m) (if known)', hi: 'इमारत उंची (मी.) (माहित असल्यास)', mr: 'इमारत उंची (मी.) (माहित असल्यास)' },
          required: false,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'briefWorkDescription',
          type: 'textarea',
          label: { en: 'Brief Description (optional)', hi: 'संक्षिप्त विवरण (वैकल्पिक)', mr: 'थोडक्यात माहिती (ऐच्छिक)' },
          placeholder: { en: 'Any additional details', hi: 'अतिरिक्त माहिती', mr: 'अतिरिक्त माहिती' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Architect / Engineer Details
    // ------------------------------------------------------
    {
      id: 'technical-person-details',
      title: { en: 'Architect / Engineer Details', hi: 'आर्किटेक्ट / इंजीनियर विवरण', mr: 'आर्किटेक्ट / इंजिनिअर तपशील' },
      fields: [
        {
          id: 'submittedThroughLicensedPerson',
          type: 'select',
          label: { en: 'Submitted through Licensed Architect/Engineer?', hi: 'लायसन्सधारक आर्किटेक्ट/इंजीनियर मार्फत?', mr: 'लायसन्सधारक आर्किटेक्ट/इंजिनिअर मार्फत?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'architectName',
          type: 'text',
          label: { en: 'Architect/Engineer Name', hi: 'आर्किटेक्ट/इंजीनियर का नाम', mr: 'आर्किटेक्ट/इंजिनिअरचे नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'architectLicenseNo',
          type: 'text',
          label: { en: 'License / Registration No', hi: 'लाइसेंस/रजिस्ट्रेशन नं', mr: 'लायसन्स/नोंदणी क्र.' },
          required: true,
          colSpan: 1
        },
        {
          id: 'architectMobile',
          type: 'text',
          label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
          required: true,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        },
        {
          id: 'architectEmail',
          type: 'text',
          label: { en: 'Email (optional)', hi: 'ईमेल (वैकल्पिक)', mr: 'ईमेल (ऐच्छिक)' },
          required: false,
          colSpan: 1
        }
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
      description: {
        en: 'Any one: Tax receipt / Property Card / 7/12 etc.',
        hi: 'कोई एक: कर पावती / प्रॉपर्टी कार्ड / 7/12',
        mr: 'कोणताही एक: कर पावती / मालमत्ता कार्ड / 7/12'
      },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'buildingPlans',
      label: { en: 'Building Plans / Drawings (PDF)', hi: 'बिल्डिंग प्लान/ड्रॉइंग (PDF)', mr: 'बिल्डिंग प्लॅन/ड्रॉइंग (PDF)' },
      description: {
        en: 'Site plan, floor plans, sections/elevations, area statement (signed).',
        hi: 'साइट प्लान, फ्लोर प्लान, सेक्शन/इलेवेशन, एरिया स्टेटमेंट (साइन).',
        mr: 'साइट प्लॅन, फ्लोअर प्लॅन, सेक्शन/इलेवेशन, एरिया स्टेटमेंट (स्वाक्षरी).'
      },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 25
    },
    {
      id: 'architectAuthorization',
      label: { en: 'Architect Authorization / Appointment (if applicable)', hi: 'आर्किटेक्ट प्राधिकरण/नियुक्ती (लागू असल्यास)', mr: 'आर्किटेक्ट अधिकृत पत्र/नियुक्ती (लागू असल्यास)' },
      description: {
        en: 'Upload if architect/engineer submits on behalf of owner.',
        hi: 'यदि आर्किटेक्ट/इंजीनियर मालिकाच्या वतीने अर्ज करतो.',
        mr: 'आर्किटेक्ट/इंजिनिअर मालकाच्या वतीने अर्ज करत असल्यास.'
      },
      required: false, // Make conditionally required if submittedThroughLicensedPerson == 'yes' OR applicantRelationship != 'owner'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'authorizationProof',
      label: { en: 'Authorization/POA (if applicant is not owner)', hi: 'प्राधिकरण/POA (यदि आवेदक मालिक नहीं)', mr: 'अधिकृत पत्र/POA (अर्जदार मालक नसल्यास)' },
      description: { en: 'Upload if applicant is not owner', hi: 'यदि आवेदक मालिक नहीं है', mr: 'अर्जदार मालक नसेल तर' },
      required: false, // Conditionally required if applicantRelationship != 'owner'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ]
},
'7211': {
  serviceId: '7211',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant Details
    // ------------------------------------------------------
    {
      id: 'applicant-details',
      title: { en: 'Applicant Details', hi: 'आवेदक का विवरण', mr: 'अर्जदाराची माहिती' },
      fields: [
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
          id: 'alternateMobileNo',
          type: 'text',
          label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        },
        {
          id: 'applicantAddress',
          type: 'textarea',
          label: { en: 'Residential Address', hi: 'आवासीय पता', mr: 'राहण्याचा पत्ता' },
          placeholder: { en: 'House no, area, city, PIN', hi: 'घर नं, क्षेत्र, शहर, पिन', mr: 'घर क्र, परिसर, शहर, पिन' },
          required: true,
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
            { value: 'dl', label: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', mr: 'ड्रायव्हिंग लायसन्स' } },
            { value: 'passport', label: { en: 'Passport', hi: 'पासपोर्ट', mr: 'पासपोर्ट' } }
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
          label: { en: 'Relationship to Property', hi: 'मालमत्तेसोबत संबंध', mr: 'मालमत्तेशी संबंध' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'owner', label: { en: 'Owner', hi: 'मालक', mr: 'मालक' } },
            { value: 'poa', label: { en: 'POA Holder', hi: 'POA धारक', mr: 'मुखत्यार (POA)' } },
            { value: 'representative', label: { en: 'Representative', hi: 'प्रतिनिधि', mr: 'प्रतिनिधी' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Ward / Zone & Property Details (Auto-Fetch)
    // NOTE:
    // 1) propertyNo first position
    // 2) propertyNo select केल्यावर Ward/Zone/Owner/Address auto-fill (read-only)
    // ------------------------------------------------------
    {
      id: 'property-details',
      title: { en: 'Ward / Zone & Property Details', hi: 'वार्ड / ज़ोन व संपत्ति विवरण', mr: 'वार्ड / झोन व मालमत्ता तपशील' },
      description: {
        en: 'Select property number and auto-fetch property details from municipal records.',
        hi: 'प्रॉपर्टी नंबर निवडा आणि नगरपालिकेच्या नोंदीतून माहिती ऑटो-फेच करा।',
        mr: 'प्रॉपर्टी नंबर निवडा आणि पालिकेच्या नोंदीतून माहिती ऑटो-फेच करा.'
      },
      fields: [
        {
          id: 'propertyNo',
          type: 'select',
          label: { en: 'Select Property No / UPIC', hi: 'प्रॉपर्टी नं / UPIC निवडा', mr: 'प्रॉपर्टी नं / UPIC निवडा' },
          required: true,
          colSpan: 1,
          options: [] // populate dynamically from DB/API (searchable dropdown recommended)
        },
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward (Auto)', hi: 'वार्ड (ऑटो)', mr: 'वार्ड (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [], // ward master
          disabled: true
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone (Auto)', hi: 'झोन (ऑटो)', mr: 'झोन (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [], // zone master
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
          label: { en: 'Property Address (Auto)', hi: 'संपत्ति पता (ऑटो)', mr: 'मालमत्ता पत्ता (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: OC Request Details
    // ------------------------------------------------------
    {
      id: 'oc-request-details',
      title: { en: 'OC Request Details', hi: 'ओसी विनंती विवरण', mr: 'ओसी विनंती तपशील' },
      fields: [
        {
          id: 'ocType',
          type: 'select',
          label: { en: 'OC Type', hi: 'ओसी प्रकार', mr: 'ओसी प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'full', label: { en: 'Full OC', hi: 'पूर्ण ओसी', mr: 'पूर्ण ओसी' } },
            { value: 'part', label: { en: 'Part OC', hi: 'आंशिक ओसी', mr: 'आंशिक ओसी' } }
          ]
        },
        {
          id: 'buildingPermissionRefNo',
          type: 'text',
          label: { en: 'Building Permission / CC Reference No', hi: 'बिल्डिंग परमीशन / CC रेफरन्स नं', mr: 'बांधकाम परवाना / CC संदर्भ क्र.' },
          placeholder: { en: 'Enter reference number', hi: 'रेफरन्स नंबर लिहा', mr: 'संदर्भ क्रमांक लिहा' },
          required: true,
          colSpan: 1,
          validation: { maxLength: 50 }
        },
        {
          id: 'completionDate',
          type: 'date',
          label: { en: 'Completion Date', hi: 'पूर्णता दिनांक', mr: 'पूर्णत्व दिनांक' },
          required: true,
          colSpan: 1
        },
        {
          id: 'totalFloorsConstructed',
          type: 'number',
          label: { en: 'Total Floors Constructed', hi: 'निर्मित कुल मंज़िलें', mr: 'बांधलेले एकूण मजले' },
          placeholder: { en: 'e.g. Ground+1 = 2', hi: 'उदा: ग्राउंड+1 = 2', mr: 'उदा: भूतल+1 = 2' },
          helperText: {
            en: 'Enter total floors count (Ground+2 = 3)',
            hi: 'कुल मंज़िलें लिखें (ग्राउंड+2 = 3)',
            mr: 'एकूण मजले लिहा (भूतल+2 = 3)'
          },
          required: true,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'totalBuiltUpAreaSqm',
          type: 'number',
          label: { en: 'Total Built-up Area (sq. m)', hi: 'कुल बांधकाम क्षेत्र (वर्ग मी.)', mr: 'एकूण बांधकाम क्षेत्र (चौ. मी.)' },
          placeholder: { en: 'e.g. 100', hi: 'उदा: 100', mr: 'उदा: 100' },
          helperText: {
            en: 'Sum of all floor areas (estimate is ok)',
            hi: 'सभी मंज़िलों के क्षेत्र का योग (अंदाज़ा चलेगा)',
            mr: 'सर्व मजल्यांचे क्षेत्रफळ मिळून (आंदाज चालेल)'
          },
          required: true,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'remarks',
          type: 'textarea',
          label: { en: 'Remarks (optional)', hi: 'टिप्पणी (वैकल्पिक)', mr: 'टिप्पणी (ऐच्छिक)' },
          placeholder: { en: 'Any additional info', hi: 'अतिरिक्त माहिती', mr: 'अतिरिक्त माहिती' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Architect / Engineer Details (Yes/No Conditional)
    // NOTE:
    // If submittedThroughLicensedPerson == 'yes' then make architect fields required.
    // If 'no' then hide/disable architect fields and set required=false in UI.
    // ------------------------------------------------------
    {
      id: 'technical-person-details',
      title: { en: 'Architect / Engineer Details', hi: 'आर्किटेक्ट / इंजीनियर विवरण', mr: 'आर्किटेक्ट / इंजिनिअर तपशील' },
      fields: [
        {
          id: 'submittedThroughLicensedPerson',
          type: 'select',
          label: { en: 'Submitted through Licensed Architect/Engineer?', hi: 'लायसन्सधारक आर्किटेक्ट/इंजीनियर मार्फत?', mr: 'लायसन्सधारक आर्किटेक्ट/इंजिनिअर मार्फत?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'architectName',
          type: 'text',
          label: { en: 'Architect/Engineer Name', hi: 'आर्किटेक्ट/इंजीनियर का नाम', mr: 'आर्किटेक्ट/इंजिनिअरचे नाव' },
          placeholder: { en: 'Enter name', hi: 'नाव लिहा', mr: 'नाव लिहा' },
          required: false, // conditionally required in UI
          colSpan: 1
        },
        {
          id: 'architectLicenseNo',
          type: 'text',
          label: { en: 'License / Registration No', hi: 'लाइसेंस/रजिस्ट्रेशन नं', mr: 'लायसन्स/नोंदणी क्र.' },
          placeholder: { en: 'Enter number', hi: 'क्रमांक लिहा', mr: 'क्रमांक लिहा' },
          required: false, // conditionally required in UI
          colSpan: 1
        },
        {
          id: 'architectMobile',
          type: 'text',
          label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
          placeholder: { en: '10-digit mobile', hi: '10 अंकों का मोबाइल', mr: '10 अंकी मोबाईल' },
          required: false, // conditionally required in UI
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        },
        {
          id: 'architectEmail',
          type: 'text',
          label: { en: 'Email (optional)', hi: 'ईमेल (वैकल्पिक)', mr: 'ईमेल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1
        }
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
      description: {
        en: 'Any one: Tax receipt / Property Card / 7/12 etc.',
        hi: 'कोई एक: कर पावती / प्रॉपर्टी कार्ड / 7/12',
        mr: 'कोणताही एक: कर पावती / मालमत्ता कार्ड / 7/12'
      },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'buildingPermissionCopy',
      label: { en: 'Building Permission / CC Copy', hi: 'बिल्डिंग परमीशन / CC कॉपी', mr: 'बांधकाम परवाना / CC प्रत' },
      description: { en: 'Upload approved permission/CC copy', hi: 'मंजूर परमीशन/CC कॉपी अपलोड करा', mr: 'मंजूर परवाना/CC प्रत अपलोड करा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'completionCertificate',
      label: { en: 'Completion Certificate', hi: 'कम्प्लीशन सर्टिफिकेट', mr: 'पूर्णत्व प्रमाणपत्र' },
      description: { en: 'Signed by Architect/Engineer (if applicable)', hi: 'आर्किटेक्ट/इंजीनियर द्वारा हस्ताक्षरित', mr: 'आर्किटेक्ट/इंजिनिअरची स्वाक्षरी (लागू असल्यास)' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'asBuiltPlan',
      label: { en: 'As-built / Completion Plan (PDF)', hi: 'अ‍ॅज-बिल्ट / कम्प्लीशन प्लान (PDF)', mr: 'अ‍ॅज-बिल्ट / पूर्णत्व नकाशा (PDF)' },
      description: { en: 'Final plan as constructed (signed)', hi: 'अंतिम बांधकामानुसार नकाशा (साइन)', mr: 'बांधकाम झाल्यानुसार अंतिम नकाशा (स्वाक्षरी)' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 25
    },
    {
      id: 'authorizationProof',
      label: { en: 'Authorization/POA (if not owner)', hi: 'प्राधिकरण/POA (यदि मालिक नहीं)', mr: 'अधिकृत पत्र/POA (मालक नसल्यास)' },
      description: { en: 'Upload if applicant is not owner', hi: 'यदि आवेदक मालिक नहीं है', mr: 'अर्जदार मालक नसेल तर' },
      required: false, // Make conditionally required in UI if applicantRelationship != 'owner'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'fireNoc',
      label: { en: 'Fire NOC (if applicable)', hi: 'फायर NOC (लागू असल्यास)', mr: 'फायर NOC (लागू असल्यास)' },
      description: { en: 'Upload if required as per building type/height', hi: 'जर लागू असेल तर', mr: 'जर लागू असेल तर' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'liftCertificate',
      label: { en: 'Lift Certificate (if applicable)', hi: 'लिफ्ट प्रमाणपत्र (लागू असल्यास)', mr: 'लिफ्ट प्रमाणपत्र (लागू असल्यास)' },
      description: { en: 'Upload if lift is installed', hi: 'लिफ्ट असल्यास अपलोड करा', mr: 'लिफ्ट असल्यास अपलोड करा' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'structuralStabilityCertificate',
      label: { en: 'Structural Stability Certificate (if applicable)', hi: 'स्ट्रक्चरल स्थिरता प्रमाणपत्र (लागू असल्यास)', mr: 'स्ट्रक्चरल स्थिरता प्रमाणपत्र (लागू असल्यास)' },
      description: { en: 'Upload if required', hi: 'जर आवश्यक असेल तर', mr: 'जर आवश्यक असेल तर' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    }
  ]
},


// '7211': {
//     serviceId: '7211',
//     steps: [
//      {
//         id: "applicant-information",
//         title: {
//           en: "Applicant Information",
//           hi: "आवेदक की जानकारी",
//           mr: "आवेदकाची माहिती",
//         },
//         fields: createApplicantInformationFields(),
//       },

//       {
//         id: 'property-identification',
//         title: {
//           en: 'Property / Building Identification',
//           hi: 'संपत्ति / भवन की पहचान',
//           mr: 'मालमत्ता / इमारत ओळख'
//         },
//         description: {
//           en: 'Details of the building for which occupancy certificate is requested',
//           hi: 'जिस भवन के लिए आक्यूपेंसी प्रमाण पत्र मांगा जा रहा है उसका विवरण',
//           mr: 'ज्या इमारतीसाठी आक्युपंसी प्रमाणपत्र मागितले आहे त्याचे तपशील'
//         },
//         fields: [
//           {
//             id: 'buildingPermissionNo',
//             type: 'text',
//             label: {
//               en: 'Building Permission No.',
//               hi: 'भवन अनुमति संख्या',
//               mr: 'बांधकाम परवानगी क्रमांक'
//             },
//             required: true,
//             colSpan: 1
//           },
//           {
//             id: 'buildingPermissionDate',
//             type: 'date',
//             label: {
//               en: 'Building Permission Date',
//               hi: 'भवन अनुमति दिनांक',
//               mr: 'बांधकाम परवानगी दिनांक'
//             },
//             required: true,
//             colSpan: 1
//           },
//           {
//             id: 'ulbPropertyAccountNo',
//             type: 'text',
//             label: {
//               en: 'Property Tax Account No. (if assessed)',
//               hi: 'संपत्ति कर खाता नंबर (यदि आकलित हो)',
//               mr: 'मालमत्ता कर खाते क्रमांक (असल्यास)'
//             },
//             required: false,
//             colSpan: 1
//           },
//           {
//             id: 'surveyGatNo',
//             type: 'text',
//             label: {
//               en: 'Survey / Gat No.',
//               hi: 'सर्वे / गट नंबर',
//               mr: 'सर्व्हे / गट क्र.'
//             },
//             required: true,
//             colSpan: 1
//           },
//           {
//             id: 'ctsNo',
//             type: 'text',
//             label: {
//               en: 'CTS / City Survey No.',
//               hi: 'सीटीएस / सिटी सर्वे नंबर',
//               mr: 'सीटीएस / सिटी सर्व्हे क्र.'
//             },
//             required: false,
//             colSpan: 1
//           },
//           {
//             id: 'plotOrFpNo',
//             type: 'text',
//             label: {
//               en: 'Plot No. / Final Plot No.',
//               hi: 'प्लॉट नंबर / फाइनल प्लॉट नंबर',
//               mr: 'प्लॉट क्र. / फायनल प्लॉट क्र.'
//             },
//             required: true,
//             colSpan: 1
//           },
//           {
//             id: 'villageName',
//             type: 'text',
//             label: {
//               en: 'Village / Locality Name',
//               hi: 'गांव / क्षेत्र का नाम',
//               mr: 'गाव / परिसराचे नाव'
//             },
//             required: true,
//             colSpan: 1
//           },
//           {
//             id: 'wardNo',
//             type: 'text',
//             label: {
//               en: 'Ward No.',
//               hi: 'वार्ड नंबर',
//               mr: 'प्रभाग क्रमांक'
//             },
//             required: true,
//             colSpan: 1
//           },
//           {
//             id: 'administrativeZoneNo',
//             type: 'select',
//             label: {
//               en: 'Zone No.',
//               hi: 'ज़ोन नंबर',
//               mr: 'झोन क्रमांक'
//             },
//             required: true,
//             colSpan: 1,
//             options: [
//               { value: '1', label: { en: 'Zone 1', hi: 'ज़ोन 1', mr: 'झोन 1' } },
//               { value: '2', label: { en: 'Zone 2', hi: 'ज़ोन 2', mr: 'झोन 2' } },
//               { value: '3', label: { en: 'Zone 3', hi: 'ज़ोन 3', mr: 'झोन 3' } },
//               { value: '4', label: { en: 'Zone 4', hi: 'ज़ोन 4', mr: 'झोन 4' } },
//               { value: '5', label: { en: 'Zone 5', hi: 'ज़ोन 5', mr: 'झोन 5' } }
//             ]
//           },
//           ...createAddressFieldsWithCity('property')
//         ]
//       },

//       {
//         id: 'building-occupancy-details',
//         title: {
//           en: 'Building & Occupancy Details',
//           hi: 'भवन एवं अधिवास विवरण',
//           mr: 'इमारत व अधिवास तपशील'
//         },
//         fields: [
//           {
//             id: 'buildingUse',
//             type: 'select',
//             label: {
//               en: 'Use of Building',
//               hi: 'इमारत का उपयोग',
//               mr: 'इमारतीचा वापर'
//             },
//             required: true,
//             colSpan: 1,
//             options: [
//               { value: 'residential', label: { en: 'Residential', hi: 'आवासीय', mr: 'निवासी' } },
//               { value: 'commercial', label: { en: 'Commercial', hi: 'वाणिज्यिक', mr: 'व्यावसायिक' } },
//               { value: 'industrial', label: { en: 'Industrial', hi: 'औद्योगिक', mr: 'औद्योगिक' } },
//               { value: 'institutional', label: { en: 'Institutional', hi: 'संस्थागत', mr: 'संस्थात्मक' } },
//               { value: 'mixed-use', label: { en: 'Mixed Use', hi: 'मिश्रित उपयोग', mr: 'मिश्र वापर' } },
//               { value: 'amenity', label: { en: 'Amenity / Public Utility', hi: 'सुविधा / सार्वजनिक उपयोगिता', mr: 'सुविधा / सार्वजनिक उपयोगिता' } }
//             ]
//           },
//           {
//             id: 'noOfBuildings',
//             type: 'number',
//             label: {
//               en: 'Number of Buildings / Wings',
//               hi: 'इमारत / विंग की संख्या',
//               mr: 'इमारती / विंगची संख्या'
//             },
//             required: true,
//             colSpan: 1,
//             validation: { min: 1 }
//           },
//           {
//             id: 'maxFloorsAboveGround',
//             type: 'number',
//             label: {
//               en: 'Maximum Floors Above Ground (G+)',
//               hi: 'भूमि से ऊपर अधिकतम मंजिलें (G+)',
//               mr: 'जमिनीवरील कमाल मजले (G+)'
//             },
//             required: true,
//             colSpan: 1,
//             validation: { min: 0 }
//           },
//           {
//             id: 'noOfBasements',
//             type: 'number',
//             label: {
//               en: 'Number of Basement Levels',
//               hi: 'बेसमेंट की मंजिलों की संख्या',
//               mr: 'तळमजल्यांची संख्या'
//             },
//             required: false,
//             colSpan: 1,
//             validation: { min: 0 }
//           },
//           {
//             id: 'totalBuiltupAreaSqm',
//             type: 'number',
//             label: {
//               en: 'Total Built-up Area as constructed (sq. m)',
//               hi: 'निर्मित कुल निर्मित क्षेत्र (वर्ग मी.)',
//               mr: 'बांधकाम झालेले एकूण बांधकाम क्षेत्र (चौ. मी.)'
//             },
//             required: true,
//             colSpan: 1,
//             validation: { min: 0 }
//           },
//           {
//             id: 'approvedBuiltupAreaSqm',
//             type: 'number',
//             label: {
//               en: 'Approved Built-up Area as per sanction (sq. m)',
//               hi: 'मंजूर ड्रॉइंग अनुसार स्वीकृत निर्मित क्षेत्र (वर्ग मी.)',
//               mr: 'मंजूर नकाश्यानुसार मंजूर बांधकाम क्षेत्र (चौ. मी.)'
//             },
//             required: true,
//             colSpan: 1,
//             validation: { min: 0 }
//           },
//           {
//             id: 'deviationSummary',
//             type: 'textarea',
//             label: {
//               en: 'Any deviations from approved plans (if any)',
//               hi: 'स्वीकृत नक्शों से कोई विचलन (यदि हो)',
//               mr: 'मंजूर नकाश्यापेक्षा कोणतेही फरक (असल्यास)'
//             },
//             required: false,
//             colSpan: 1
//           },
//           {
//             id: 'fireProtectionProvided',
//             type: 'select',
//             label: {
//               en: 'Fire protection systems provided as per norms',
//               hi: 'मानकों के अनुसार फायर प्रोटेक्शन सिस्टम उपलब्ध है',
//               mr: 'मानकानुसार अग्निसुरक्षा प्रणाली पुरविली आहे'
//             },
//             required: true,
//             colSpan: 1,
//             options: [
//               { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
//               { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
//               { value: 'partial', label: { en: 'Partially / in progress', hi: 'आंशिक / प्रगति पर', mr: 'आंशिक / प्रगतीत' } }
//             ]
//           }
//         ]
//       },

//       {
//       id: 'declaration',
//       title: {
//         en: 'Declaration',
//         hi: 'घोषणा',
//         mr: 'घोषणापत्र'
//       },
//       fields: [
//         ...declarationField(),
//       ]
//     },

//       {
//         id: 'oc-office-use',
//         title: {
//           en: 'Town Planning / Building Permission – Office Use Only',
//           hi: 'टाउन प्लानिंग / भवन अनुमति – केवल कार्यालय उपयोग हेतु',
//           mr: 'टाउन प्लॅनिंग / बांधकाम परवानगी – केवळ कार्यालयीन वापरासाठी'
//         },
//         fields: [
//           {
//             id: 'ocFileNo',
//             type: 'text',
//             label: {
//               en: 'OC File No.',
//               hi: 'OC फाइल नंबर',
//               mr: 'OC फाईल क्रमांक'
//             },
//             required: false,
//             colSpan: 1
//           },
//           {
//             id: 'ocIssueDate',
//             type: 'date',
//             label: {
//               en: 'OC Issue Date',
//               hi: 'OC जारी दिनांक',
//               mr: 'OC जारी दिनांक'
//             },
//             required: false,
//             colSpan: 1
//           },
//           {
//             id: 'occupancyAllowedFloors',
//             type: 'text',
//             label: {
//               en: 'Floors / wings permitted for occupancy',
//               hi: 'अधिवास की अनुमति वाले फ्लोर / विंग',
//               mr: 'अधिवासासाठी मंजूर मजले / विंग'
//             },
//             required: false,
//             colSpan: 1
//           },
//           {
//             id: 'remarks',
//             type: 'textarea',
//             label: {
//               en: 'Remarks / conditions in OC',
//               hi: 'OC में शर्तें / टिप्पणी',
//               mr: 'OC मधील अटी / निरीक्षण'
//             },
//             required: false,
//             colSpan: 1
//           }
//         ]
//       }
//     ],

//     documents: [
//       {
//         id: 'ownershipProof',
//         label: {
//           en: 'Ownership Proof',
//           hi: 'स्वामित्व प्रमाण',
//           mr: 'मालकी पुरावा'
//         },
//         description: {
//           en: 'Sale deed / property card / allotment letter etc.',
//           hi: 'सेल डीड / प्रॉपर्टी कार्ड / अलॉटमेंट लेटर आदि',
//           mr: 'सेल डीड / मालमत्ता कार्ड / वाटप पत्र इ.'
//         },
//         required: true,
//         acceptedFormats: ['.pdf'],
//         maxSize: 10
//       },
//       {
//         id: 'approvedBuildingPlans',
//         label: {
//           en: 'Approved Building Plans',
//           hi: 'स्वीकृत भवन नक्शे',
//           mr: 'मंजूर इमारत नकाशे'
//         },
//         description: {
//           en: 'Copy of sanctioned building plans',
//           hi: 'स्वीकृत बिल्डिंग प्लान की प्रत',
//           mr: 'मंजूर बिल्डिंग प्लॅनची प्रत'
//         },
//         required: true,
//         acceptedFormats: ['.pdf'],
//         maxSize: 20
//       },
//       {
//         id: 'asBuiltPlans',
//         label: {
//           en: 'As-built Building Plans',
//           hi: 'वास्तविक निर्मित भवन नक्शे',
//           mr: 'प्रत्यक्ष बांधकाम नकाशे (As-built)'
//         },
//         description: {
//           en: 'As-built drawings certified by architect / engineer',
//           hi: 'आर्किटेक्ट / अभियंता द्वारा प्रमाणित वास्तविक निर्मित ड्रॉइंग',
//           mr: 'आर्किटेक्ट / अभियंता प्रमाणित As-built ड्रॉइंग'
//         },
//         required: true,
//         acceptedFormats: ['.pdf'],
//         maxSize: 20
//       },
//       {
//         id: 'structuralStabilityCertificate',
//         label: {
//           en: 'Structural Stability Certificate',
//           hi: 'संरचनात्मक स्थिरता प्रमाणपत्र',
//           mr: 'संरचनात्मक स्थिरता प्रमाणपत्र'
//         },
//         description: {
//           en: 'Certificate by licensed structural engineer',
//           hi: 'लाइसेंस प्राप्त संरचनात्मक अभियंता द्वारा प्रमाणपत्र',
//           mr: 'परवाना प्राप्त संरचनात्मक अभियंत्याचे प्रमाणपत्र'
//         },
//         required: true,
//         acceptedFormats: ['.pdf'],
//         maxSize: 10
//       },
//       {
//         id: 'fireNoc',
//         label: {
//           en: 'Fire NOC',
//           hi: 'फायर NOC',
//           mr: 'फायर NOC'
//         },
//         description: {
//           en: 'Fire NOC from Fire Department, where applicable',
//           hi: 'जहां लागू हो वहां फायर विभाग से NOC',
//           mr: 'लागू असल्यास अग्निशमन विभागाकडून NOC'
//         },
//         required: false,
//         acceptedFormats: ['.pdf'],
//         maxSize: 10
//       },
//       {
//         id: 'completionCertificate',
//         label: {
//           en: 'Completion Certificate (Architect / Engineer)',
//           hi: 'कम्प्लीशन सर्टिफिकेट (आर्किटेक्ट / अभियंता)',
//           mr: 'कम्प्लिशन सर्टिफिकेट (आर्किटेक्ट / अभियंता)'
//         },
//         description: {
//           en: 'Certificate that building is completed as per sanction',
//           hi: 'भवन स्वीकृत नक्शों के अनुरूप पूर्ण होने का प्रमाण पत्र',
//           mr: 'इमारत मंजूर नकाश्यानुसार पूर्ण झाल्याचे प्रमाणपत्र'
//         },
//         required: true,
//         acceptedFormats: ['.pdf'],
//         maxSize: 10
//       },
//       {
//         id: 'buildingPhotographs',
//         label: {
//           en: 'Building Photographs',
//           hi: 'भवन के फोटो',
//           mr: 'इमारतीचे फोटो'
//         },
//         description: {
//           en: 'Recent photographs of building from all sides',
//           hi: 'भवन के सभी ओर से हाल के फोटो',
//           mr: 'इमारतीचे सर्व बाजूंनी ताजे फोटो'
//         },
//         required: false,
//         acceptedFormats: ['.jpg', '.jpeg', '.png'],
//         maxSize: 10
//       },
//       {
//         id: 'authorisationLetter',
//         label: {
//           en: 'Authorisation Letter',
//           hi: 'प्राधिकरण पत्र',
//           mr: 'अधिकृत पत्र'
//         },
//         description: {
//           en: 'If application signed by authorised signatory',
//           hi: 'यदि आवेदन अधिकृत हस्ताक्षरकर्ता द्वारा किया गया हो',
//           mr: 'अर्ज अधिकृत स्वाक्षरीदाराने केल्यास'
//         },
//         required: false,
//         acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//         maxSize: 5
//       },
//       {
//         id: 'aadhaarCard',
//         label: {
//           en: 'Aadhaar Card of Applicant',
//           hi: 'आवेदक का आधार कार्ड',
//           mr: 'अर्जदाराचा आधार कार्ड'
//         },
//         description: {
//           en: 'Scanned copy of Aadhaar card',
//           hi: 'आधार कार्ड की स्कैन प्रति',
//           mr: 'आधार कार्डची स्कॅन प्रत'
//         },
//         required: true,
//         acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//         maxSize: 5
//       }
//     ]
//   },

// 9002 – Maintaining and securing sewer covers
// '9002': {
//   serviceId: '9002',
//   steps: [
//     {
//         id: "applicant-information",
//         title: {
//           en: "Applicant Information",
//           hi: "आवेदक की जानकारी",
//           mr: "आवेदकाची माहिती",
//         },
//         fields: createApplicantInformationFields(),
//       },

//     {
//       id: 'sewer-location-details',
//       title: {
//         en: 'Sewer Cover Location Details',
//         hi: 'सीवर कवर का स्थान विवरण',
//         mr: 'गटार झाकणाचे स्थान तपशील'
//       },
//       description: {
//         en: 'Exact location and condition of the sewer / manhole cover',
//         hi: 'सीवर / मैनहोल कवर का सटीक स्थान व स्थिति',
//         mr: 'गटार / मॅनहोल झाकणाचे नेमके स्थान व स्थिती'
//       },
//       fields: [
//         {
//           id: 'roadName',
//           type: 'text',
//           label: {
//             en: 'Road / Street Name',
//             hi: 'सड़क / गली का नाम',
//             mr: 'रस्ता / गल्लीचे नाव'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'nearestLandmark',
//           type: 'text',
//           label: {
//             en: 'Nearest landmark / building',
//             hi: 'निकटतम लैंडमार्क / इमारत',
//             mr: 'जवळचे भूचिन्ह / इमारत'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'locationDescription',
//           type: 'textarea',
//           label: {
//             en: 'Location description',
//             hi: 'स्थान का विवरण',
//             mr: 'स्थानाचे वर्णन'
//           },
//           placeholder: {
//             en: 'E.g. in middle of road, near corner, on footpath etc.',
//             hi: 'जैसे – सड़क के बीच में, कोने पर, फुटपाथ पर आदि',
//             mr: 'उदा. रस्त्याच्या मधोमध, कोपऱ्यावर, फुटपाथवर इ.'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'wardNo',
//           type: 'text',
//           label: {
//             en: 'Ward No.',
//             hi: 'वार्ड नंबर',
//             mr: 'प्रभाग क्रमांक'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'zoneNo',
//           type: 'select',
//           label: {
//             en: 'Administrative Zone No.',
//             hi: 'प्रशासनिक ज़ोन नंबर',
//             mr: 'प्रशासनिक झोन क्रमांक'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: '1', label: { en: 'Zone 1', hi: 'ज़ोन 1', mr: 'झोन 1' } },
//             { value: '2', label: { en: 'Zone 2', hi: 'ज़ोन 2', mr: 'झोन 2' } },
//             { value: '3', label: { en: 'Zone 3', hi: 'ज़ोन 3', mr: 'झोन 3' } },
//             { value: '4', label: { en: 'Zone 4', hi: 'ज़ोन 4', mr: 'झोन 4' } },
//             { value: '5', label: { en: 'Zone 5', hi: 'ज़ोन 5', mr: 'झोन 5' } }
//           ]
//         },
//         {
//           id: 'gpsCoordinates',
//           type: 'text',
//           label: {
//             en: 'Approx. GPS Coordinates (if known)',
//             hi: 'लगभग GPS लोकेशन (यदि ज्ञात हो)',
//             mr: 'अंदाजे GPS स्थान (माहित असल्यास)'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'locationType',
//           type: 'select',
//           label: {
//             en: 'Location type',
//             hi: 'स्थान का प्रकार',
//             mr: 'स्थानाचा प्रकार'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'carriageway', label: { en: 'On carriageway (vehicle lane)', hi: 'वाहन लेन / सड़क के बीच', mr: 'वाहन लेन / रस्त्याच्या मधोमध' } },
//             { value: 'shoulder',    label: { en: 'On shoulder / side of road', hi: 'सड़क के कंधे पर', mr: 'रस्त्याच्या कडेला' } },
//             { value: 'footpath',    label: { en: 'On footpath', hi: 'फुटपाथ पर', mr: 'फुटपाथवर' } },
//             { value: 'open-plot',   label: { en: 'Inside open plot / ground', hi: 'खुले प्लॉट / मैदान के अंदर', mr: 'मोकळ्या प्लॉट / मैदानात' } }
//           ]
//         }
//       ]
//     },

//     {
//       id: 'cover-condition-details',
//       title: {
//         en: 'Cover Condition & Hazard Details',
//         hi: 'कवर की स्थिति व जोखिम विवरण',
//         mr: 'झाकणाची स्थिती व जोखीम तपशील'
//       },
//       fields: [
//         {
//           id: 'issueType',
//           type: 'select',
//           label: {
//             en: 'Type of issue',
//             hi: 'समस्या का प्रकार',
//             mr: 'समस्येचा प्रकार'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'missing',  label: { en: 'Cover completely missing / open manhole', hi: 'कवर पूरी तरह गायब / खुला मैनहोल', mr: 'झाकण पूर्णपणे गायब / उघडा मॅनहोल' } },
//             { value: 'broken',   label: { en: 'Cover broken / cracked', hi: 'कवर टूटा / दरार', mr: 'झाकण तुटलेले / फाटलेले' } },
//             { value: 'loose',    label: { en: 'Cover loose / dislodged', hi: 'कवर ढीला / हिलता हुआ', mr: 'झाकण ढिले / हलते' } },
//             { value: 'sunken',   label: { en: 'Cover sunken / below road level', hi: 'कवर धंसा हुआ / सड़क से नीचे', mr: 'झाकण खाली बसलेले / रस्त्याच्या पातळीखाली' } },
//             { value: 'raised',   label: { en: 'Cover raised / above road level', hi: 'कवर उभरा हुआ / सड़क से ऊपर', mr: 'झाकण उंच / रस्त्यापेक्षा वर' } },
//             { value: 'blocked',  label: { en: 'Blocked / choked manhole', hi: 'ब्लॉक / चोक मैनहोल', mr: 'ब्लॉक / चोक मॅनहोल' } },
//             { value: 'other',    label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
//           ]
//         },
//         {
//           id: 'openingSize',
//           type: 'text',
//           label: {
//             en: 'Approx. opening size / depth',
//             hi: 'खुला हिस्सा / गहराई (लगभग)',
//             mr: 'उघड्या भागाचा / खोलीचा अंदाजे आकार'
//           },
//           placeholder: {
//             en: 'E.g. 60 cm x 60 cm, depth 1 m',
//             hi: 'जैसे – 60 से.मी. x 60 से.मी., गहराई 1 मीटर',
//             mr: 'उदा. 60 से.मी. x 60 से.मी., खोली 1 मी.'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'immediateBarricadingDone',
//           type: 'select',
//           label: {
//             en: 'Any immediate barricading / temporary covering done?',
//             hi: 'क्या कोई अस्थायी बैरिकेडिंग / ढकने की व्यवस्था की गई है?',
//             mr: 'तात्पुरती बॅरिकेडिंग / झाकण्याची व्यवस्था केलेली आहे का?'
//           },
//           required: false,
//           colSpan: 1,
//           options: [
//             { value: 'yes-by-applicant', label: { en: 'Yes, by applicant / locals', hi: 'हाँ, आवेदक / स्थानीय द्वारा', mr: 'होय, अर्जदार / स्थानिकांनी' } },
//             { value: 'yes-by-ulb',       label: { en: 'Yes, by ULB earlier', hi: 'हाँ, पहले नगर निगम द्वारा', mr: 'होय, आधी महानगरपालिकेने' } },
//             { value: 'no',               label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
//           ]
//         }
//       ]
//     },

//     {
//       id: 'declaration',
//       title: {
//         en: 'Declaration',
//         hi: 'घोषणा',
//         mr: 'घोषणापत्र'
//       },
//       fields: [
//         ...declarationField(),
//       ]
//     },

//     {
//       id: 'sewer-office-use',
//       title: {
//         en: 'Drainage / Sewer Department – Office Use Only',
//         hi: 'ड्रेनेज / सीवर विभाग – केवल कार्यालय उपयोग हेतु',
//         mr: 'ड्रेनेज / गटार विभाग – केवळ कार्यालयीन वापरासाठी'
//       },
//       fields: [
//         {
//           id: 'complaintNo',
//           type: 'text',
//           label: {
//             en: 'Complaint / Ticket No.',
//             hi: 'शिकायत / टिकट नंबर',
//             mr: 'तक्रार / तिकीट क्रमांक'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'inwardDate',
//           type: 'date',
//           label: {
//             en: 'Date of receipt',
//             hi: 'प्राप्ति दिनांक',
//             mr: 'प्राप्त दिनांक'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'priorityCategory',
//           type: 'select',
//           label: {
//             en: 'Priority category (department)',
//             hi: 'प्राथमिकता श्रेणी (विभागीय)',
//             mr: 'प्राथमिकता श्रेणी (विभागीय)'
//           },
//           required: false,
//           colSpan: 1,
//           options: [
//             { value: 'emergency', label: { en: 'Emergency', hi: 'आपातकालीन', mr: 'आपत्कालीन' } },
//             { value: 'high',      label: { en: 'High', hi: 'उच्च', mr: 'उच्च' } },
//             { value: 'normal',    label: { en: 'Normal', hi: 'सामान्य', mr: 'साधारण' } }
//           ]
//         },
//         {
//           id: 'assignedSection',
//           type: 'text',
//           label: {
//             en: 'Assigned section / ward office',
//             hi: 'आवंटित सेक्शन / वार्ड कार्यालय',
//             mr: 'नेमलेला विभाग / प्रभाग कार्यालय'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'actionTaken',
//           type: 'textarea',
//           label: {
//             en: 'Action taken / remarks',
//             hi: 'किए गए कार्य / टिप्पणी',
//             mr: 'केलेली कार्यवाही / निरीक्षण'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'securingCompletionDate',
//           type: 'date',
//           label: {
//             en: 'Date of securing / cover replacement',
//             hi: 'कवर सुरक्षित / बदलने की तारीख',
//             mr: 'झाकण सुरक्षित / बदलण्याची तारीख'
//           },
//           required: false,
//           colSpan: 1
//         }
//       ]
//     }
//   ],

//   documents: [
//     {
//       id: 'locationPhotos',
//       label: {
//         en: 'Location photographs',
//         hi: 'स्थान के फोटो',
//         mr: 'स्थानाचे फोटो'
//       },
//       description: {
//         en: 'Clear photos showing sewer / manhole cover and surroundings',
//         hi: 'सीवर / मैनहोल कवर व आसपास का स्पष्ट फोटो',
//         mr: 'गटार / मॅनहोल झाकण व आजूबाजूचा भाग दाखवणारे स्पष्ट फोटो'
//       },
//       required: true,
//       acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
//       maxSize: 10
//     },
//     {
//       id: 'sketchOrMap',
//       label: {
//         en: 'Rough sketch / map of location',
//         hi: 'स्थान का rough स्केच / नक्शा',
//         mr: 'स्थानाचा साधा स्केच / नकाशा'
//       },
//       description: {
//         en: 'Optional sketch marking exact manhole position and nearby landmarks',
//         hi: 'मैनहोल का सटीक स्थान व लैंडमार्क दर्शाने वाला वैकल्पिक स्केच',
//         mr: 'मॅनहोलचे नेमके स्थान व भूचिन्ह दर्शवणारा पर्यायी स्केच'
//       },
//       required: false,
//       acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
//       maxSize: 5
//     },
//     {
//       id: 'authorisationLetter',
//       label: {
//         en: 'Authorisation Letter (if filed by representative)',
//         hi: 'प्राधिकरण पत्र (यदि प्रतिनिधि द्वारा दायर)',
//         mr: 'अधिकृत पत्र (प्रतिनिधीमार्फत अर्ज असल्यास)'
//       },
//       description: {
//         en: 'If application is submitted by organisation / institution on behalf of residents',
//         hi: 'यदि आवेदन निवासियों की ओर से संस्था / संस्थान द्वारा दिया गया हो',
//         mr: 'अर्ज रहिवाशांच्या वतीने संस्था / संस्थेकडून दिल्यास'
//       },
//       required: false,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 5
//     }
//   ]
// },
'9002': {
  serviceId: '9002',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Citizen Details
    // ------------------------------------------------------
    {
      id: 'citizen-details',
      title: { en: 'Citizen Details', hi: 'नागरिक विवरण', mr: 'नागरिक माहिती' },
      fields: [
        {
          id: 'citizenFullName',
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
          id: 'alternateMobileNo',
          type: 'text',
          label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Sewer Cover Location Details
    // ------------------------------------------------------
    {
      id: 'sewer-location',
      title: { en: 'Sewer Cover Location Details', hi: 'सीवर कव्हर स्थान विवरण', mr: 'सीवर कव्हर लोकेशन तपशील' },
      fields: [
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward', hi: 'वार्ड', mr: 'वार्ड' },
          required: true,
          colSpan: 1,
          options: [] // ward master
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone', hi: 'झोन', mr: 'झोन' },
          required: true,
          colSpan: 1,
          options: [] // zone master (filtered by ward)
        },
        {
          id: 'areaName',
          type: 'text',
          label: { en: 'Area / Locality', hi: 'क्षेत्र / परिसर', mr: 'परिसर / एरिया' },
          placeholder: { en: 'Enter area name', hi: 'क्षेत्र का नाम', mr: 'परिसराचे नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'roadStreetName',
          type: 'text',
          label: { en: 'Road / Street Name', hi: 'रस्ता / गल्लीचे नाव', mr: 'रस्ता / गल्लीचे नाव' },
          placeholder: { en: 'Enter road/street name', hi: 'रस्त्याचे नाव लिहा', mr: 'रस्त्याचे नाव लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'landmark',
          type: 'text',
          label: { en: 'Landmark', hi: 'लँडमार्क', mr: 'लँडमार्क' },
          placeholder: { en: 'e.g. Near bus stop/building', hi: 'उदा: बस स्टॉप/इमारतीजवळ', mr: 'उदा: बस स्टॉप/इमारतीजवळ' },
          required: true,
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
    // STEP 3: Sewer Cover Issue Details
    // ------------------------------------------------------
    {
      id: 'sewer-issue-details',
      title: { en: 'Sewer Cover Issue Details', hi: 'सीवर कव्हर समस्या विवरण', mr: 'सीवर कव्हर समस्या तपशील' },
      fields: [
        {
          id: 'issueType',
          type: 'select',
          label: { en: 'Issue Type', hi: 'समस्या प्रकार', mr: 'समस्या प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'missing_cover', label: { en: 'Cover Missing', hi: 'कव्हर गायब', mr: 'कव्हर गायब आहे' } },
            { value: 'broken_cover', label: { en: 'Cover Broken', hi: 'कव्हर तुटले', mr: 'कव्हर तुटले आहे' } },
            { value: 'loose_cover', label: { en: 'Cover Loose / Moving', hi: 'कव्हर सैल', mr: 'कव्हर सैल/हलते' } },
            { value: 'uneven_level', label: { en: 'Uneven Level', hi: 'लेव्हल नाही', mr: 'कव्हर उंच-खाली (लेव्हल नाही)' } },
            { value: 'damaged_frame', label: { en: 'Frame Damaged', hi: 'फ्रेम डॅमेज', mr: 'चेंबर फ्रेम तुटली/डॅमेज' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'riskLevel',
          type: 'select',
          label: { en: 'Risk Level', hi: 'जोखिम स्तर', mr: 'धोका पातळी' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'low', label: { en: 'Low', hi: 'कमी', mr: 'कमी' } },
            { value: 'medium', label: { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम' } },
            { value: 'high', label: { en: 'High', hi: 'जास्त', mr: 'जास्त' } }
          ]
        },
        {
          id: 'coverCount',
          type: 'number',
          label: { en: 'Number of Covers', hi: 'कव्हर संख्या', mr: 'किती कव्हर्स आहेत?' },
          placeholder: { en: 'e.g. 1', hi: 'उदा: 1', mr: 'उदा: 1' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        },
   
        {
          id: 'remarks',
          type: 'textarea',
          label: { en: 'Remarks (optional)', hi: 'टिप्पणी (वैकल्पिक)', mr: 'टिप्पणी (ऐच्छिक)' },
          placeholder: { en: 'Any additional details', hi: 'अतिरिक्त माहिती', mr: 'अतिरिक्त माहिती' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Declaration
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
      id: 'sewerCoverPhoto',
      label: { en: 'Photo of Sewer Cover/Chamber', hi: 'सीवर कव्हर/चेंबरचा फोटो', mr: 'सीवर कव्हर/चेंबरचा फोटो' },
      description: {
        en: 'Upload clear photo(s) (wide + close-up recommended).',
        hi: 'स्पष्ट फोटो अपलोड करा (वाइड + क्लोज-अप).',
        mr: 'स्पष्ट फोटो अपलोड करा (वाइड + क्लोज-अप).'
      },
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxSize: 10
    }
  ]
},

// 9001 – Filling potholes on city roads
// '9001': {
//   serviceId: '9001',
//   steps: [
//    {
//         id: "applicant-information",
//         title: {
//           en: "Applicant Information",
//           hi: "आवेदक की जानकारी",
//           mr: "आवेदकाची माहिती",
//         },
//         fields: createApplicantInformationFields(),
//       },

//     {
//       id: 'road-location-details',
//       title: {
//         en: 'Road & Location Details',
//         hi: 'सड़क व स्थान विवरण',
//         mr: 'रस्ता व स्थान तपशील'
//       },
//       description: {
//         en: 'Precise location of potholes to help quick response and planning',
//         hi: 'त्वरित कार्रवाई व योजना के लिए गड्ढों का सटीक स्थान',
//         mr: 'त्वरित कार्यवाही व नियोजनासाठी खड्ड्यांचे नेमके स्थान'
//       },
//       fields: [
//         {
//           id: 'roadName',
//           type: 'text',
//           label: {
//             en: 'Road Name',
//             hi: 'सड़क का नाम',
//             mr: 'रस्त्याचे नाव'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'fromLandmark',
//           type: 'text',
//           label: {
//             en: 'From Landmark / Junction',
//             hi: 'किस लैंडमार्क / चौक से',
//             mr: 'कोणत्या भूचिन्ह / चौकापासून'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'toLandmark',
//           type: 'text',
//           label: {
//             en: 'To Landmark / Junction',
//             hi: 'किस लैंडमार्क / चौक तक',
//             mr: 'कोणत्या भूचिन्ह / चौकापर्यंत'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'localityName',
//           type: 'text',
//           label: {
//             en: 'Locality / Area',
//             hi: 'क्षेत्र / इलाका',
//             mr: 'परिसर / भाग'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'wardNo',
//           type: 'text',
//           label: {
//             en: 'Ward No.',
//             hi: 'वार्ड नंबर',
//             mr: 'प्रभाग क्रमांक'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'zoneNo',
//           type: 'select',
//           label: {
//             en: 'Administrative Zone No.',
//             hi: 'प्रशासनिक ज़ोन नंबर',
//             mr: 'प्रशासनिक झोन क्रमांक'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: '1', label: { en: 'Zone 1', hi: 'ज़ोन 1', mr: 'झोन 1' } },
//             { value: '2', label: { en: 'Zone 2', hi: 'ज़ोन 2', mr: 'झोन 2' } },
//             { value: '3', label: { en: 'Zone 3', hi: 'ज़ोन 3', mr: 'झोन 3' } },
//             { value: '4', label: { en: 'Zone 4', hi: 'ज़ोन 4', mr: 'झोन 4' } },
//             { value: '5', label: { en: 'Zone 5', hi: 'ज़ोन 5', mr: 'झोन 5' } }
//           ]
//         },
//         {
//           id: 'gpsCoordinates',
//           type: 'text',
//           label: {
//             en: 'Approx. GPS Coordinates (if known)',
//             hi: 'लगभग GPS लोकेशन (यदि ज्ञात हो)',
//             mr: 'अंदाजे GPS स्थान (माहित असल्यास)'
//           },
//           placeholder: {
//             en: 'Latitude, Longitude',
//             hi: 'रेखांश, देशांश',
//             mr: 'रेखांश, देशांश'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'roadCategory',
//           type: 'select',
//           label: {
//             en: 'Road Category',
//             hi: 'सड़क की श्रेणी',
//             mr: 'रस्त्याची श्रेणी'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'arterial',      label: { en: 'Arterial Road', hi: 'मुख्य (आर्टेरियल) सड़क', mr: 'मुख्य (आर्टेरियल) रस्ता' } },
//             { value: 'sub-arterial',  label: { en: 'Sub-arterial / Major Link', hi: 'सब-आर्टेरियल / मुख्य लिंक', mr: 'सब-आर्टेरियल / मुख्य लिंक' } },
//             { value: 'collector',     label: { en: 'Collector Road', hi: 'कलेक्टर सड़क', mr: 'कलेक्टर रस्ता' } },
//             { value: 'local',         label: { en: 'Local / Internal Road', hi: 'लोकल / आंतरिक सड़क', mr: 'लोकल / अंतर्गत रस्ता' } },
//             { value: 'industrial',    label: { en: 'Industrial Area Road', hi: 'औद्योगिक क्षेत्र सड़क', mr: 'औद्योगिक क्षेत्र रस्ता' } }
//           ]
//         },
//         {
//           id: 'noOfPotholes',
//           type: 'number',
//           label: {
//             en: 'Approx. number of potholes',
//             hi: 'गड्ढों की अनुमानित संख्या',
//             mr: 'खड्ड्यांची अंदाजे संख्या'
//           },
//           required: true,
//           colSpan: 1,
//           validation: { min: 1 }
//         },
//         {
//           id: 'largestPotholeLength',
//           type: 'number',
//           label: {
//             en: 'Largest pothole length (cm)',
//             hi: 'सबसे बड़े गड्ढे की लंबाई (से.मी.)',
//             mr: 'सर्वात मोठ्या खड्ड्याची लांबी (से.मी.)'
//           },
//           required: false,
//           colSpan: 1,
//           validation: { min: 0 }
//         },
//         {
//           id: 'largestPotholeWidth',
//           type: 'number',
//           label: {
//             en: 'Largest pothole width (cm)',
//             hi: 'सबसे बड़े गड्ढे की चौड़ाई (से.मी.)',
//             mr: 'सर्वात मोठ्या खड्ड्याची रुंदी (से.मी.)'
//           },
//           required: false,
//           colSpan: 1,
//           validation: { min: 0 }
//         },
//         {
//           id: 'largestPotholeDepth',
//           type: 'number',
//           label: {
//             en: 'Largest pothole depth (cm)',
//             hi: 'सबसे बड़े गड्ढे की गहराई (से.मी.)',
//             mr: 'सर्वात मोठ्या खड्ड्याची खोली (से.मी.)'
//           },
//           required: false,
//           colSpan: 1,
//           validation: { min: 0 }
//         }
//       ]
//     },

    

//     {
//       id: 'declaration',
//       title: {
//         en: 'Declaration',
//         hi: 'घोषणा',
//         mr: 'घोषणापत्र'
//       },
//       fields: [
//         ...declarationField(),
//       ]
//     },

//     {
//       id: 'roads-office-use',
//       title: {
//         en: 'Road Department – Office Use Only',
//         hi: 'सड़क विभाग – केवल कार्यालय उपयोग हेतु',
//         mr: 'रस्ता विभाग – केवळ कार्यालयीन वापरासाठी'
//       },
//       fields: [
//         {
//           id: 'complaintNo',
//           type: 'text',
//           label: {
//             en: 'Complaint / Ticket No.',
//             hi: 'शिकायत / टिकट नंबर',
//             mr: 'तक्रार / तिकीट क्रमांक'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'inwardDate',
//           type: 'date',
//           label: {
//             en: 'Date of receipt',
//             hi: 'प्राप्ति दिनांक',
//             mr: 'प्राप्त दिनांक'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'priorityCategory',
//           type: 'select',
//           label: {
//             en: 'Priority category (department)',
//             hi: 'प्राथमिकता श्रेणी (विभागीय)',
//             mr: 'प्राथमिकता श्रेणी (विभागीय)'
//           },
//           required: false,
//           colSpan: 1,
//           options: [
//             { value: 'emergency', label: { en: 'Emergency', hi: 'आपातकालीन', mr: 'आपत्कालीन' } },
//             { value: 'high',      label: { en: 'High', hi: 'उच्च', mr: 'उच्च' } },
//             { value: 'normal',    label: { en: 'Normal', hi: 'सामान्य', mr: 'साधारण' } }
//           ]
//         },
//         {
//           id: 'assignedSection',
//           type: 'text',
//           label: {
//             en: 'Assigned section / ward office',
//             hi: 'आवंटित सेक्शन / वार्ड कार्यालय',
//             mr: 'नेमलेला विभाग / प्रभाग कार्यालय'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'actionTaken',
//           type: 'textarea',
//           label: {
//             en: 'Action taken / remarks',
//             hi: 'किए गए कार्य / टिप्पणी',
//             mr: 'केलेली कार्यवाही / निरीक्षण'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'workCompletionDate',
//           type: 'date',
//           label: {
//             en: 'Date of pothole filling completion',
//             hi: 'गड्ढा भराव कार्य पूर्ण होने की तारीख',
//             mr: 'खड्डे भरण्याचे काम पूर्ण होण्याची तारीख'
//           },
//           required: false,
//           colSpan: 1
//         }
//       ]
//     }
//   ],

//   documents: [
//     {
//       id: 'locationPhotos',
//       label: {
//         en: 'Location photographs',
//         hi: 'स्थान के फोटो',
//         mr: 'स्थानाचे फोटो'
//       },
//       description: {
//         en: 'Clear photos of potholes and surrounding road stretch',
//         hi: 'गड्ढों और आसपास की सड़क के स्पष्ट फोटो',
//         mr: 'खड्डे व आजूबाजूच्या रस्त्याचे स्पष्ट फोटो'
//       },
//       required: true,
//       acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
//       maxSize: 10
//     },
//     {
//       id: 'sketchOrMap',
//       label: {
//         en: 'Rough sketch / map of location',
//         hi: 'स्थान का rough स्केच / नक्शा',
//         mr: 'स्थानाचा साधा स्केच / नकाशा'
//       },
//       description: {
//         en: 'Optional sketch showing exact spot and landmarks',
//         hi: 'सटीक स्थान व लैंडमार्क दर्शाने वाला वैकल्पिक स्केच',
//         mr: 'अचूक स्थान व भूचिन्ह दर्शवणारा पर्यायी स्केच'
//       },
//       required: false,
//       acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
//       maxSize: 5
//     },
//     {
//       id: 'authorisationLetter',
//       label: {
//         en: 'Authorisation Letter (if filed by representative)',
//         hi: 'प्राधिकरण पत्र (यदि प्रतिनिधि द्वारा दायर)',
//         mr: 'अधिकृत पत्र (प्रतिनिधीमार्फत अर्ज असल्यास)'
//       },
//       description: {
//         en: 'Required only when filed by organisation / contractor on behalf of others',
//         hi: 'केवल तब आवश्यक जब किसी अन्य की ओर से संस्था / ठेकेदार द्वारा दाखिल हो',
//         mr: 'फक्त इतरांच्या वतीने संस्था / ठेकेदाराने अर्ज केल्यास आवश्यक'
//       },
//       required: false,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 5
//     }
//   ]
// },

'9001': {
  serviceId: '9001',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant / Citizen Details
    // ------------------------------------------------------
    {
      id: 'citizen-details',
      title: { en: 'Citizen Details', hi: 'नागरिक विवरण', mr: 'नागरिक माहिती' },
      fields: [
        {
          id: 'citizenFullName',
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
          id: 'alternateMobileNo',
          type: 'text',
          label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Pothole Location Details
    // ------------------------------------------------------
    {
      id: 'pothole-location',
      title: { en: 'Pothole Location Details', hi: 'खड्डा स्थान विवरण', mr: 'खड्ड्याचे लोकेशन तपशील' },
      fields: [
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward', hi: 'वार्ड', mr: 'वार्ड' },
          required: true,
          colSpan: 1,
          options: [] // ward master
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone', hi: 'झोन', mr: 'झोन' },
          required: true,
          colSpan: 1,
          options: [] // zone master (filtered by ward)
        },
        {
          id: 'areaName',
          type: 'text',
          label: { en: 'Area / Locality', hi: 'क्षेत्र / परिसर', mr: 'परिसर / एरिया' },
          placeholder: { en: 'Enter area name', hi: 'क्षेत्र का नाम', mr: 'परिसराचे नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'roadStreetName',
          type: 'text',
          label: { en: 'Road / Street Name', hi: 'रस्ता / गल्लीचे नाव', mr: 'रस्ता / गल्लीचे नाव' },
          placeholder: { en: 'Enter road/street name', hi: 'रस्त्याचे नाव लिहा', mr: 'रस्त्याचे नाव लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'landmark',
          type: 'text',
          label: { en: 'Landmark', hi: 'लँडमार्क', mr: 'लँडमार्क' },
          placeholder: { en: 'e.g. Near school/temple/chowk', hi: 'उदा: शाळेजवळ/मंदिराजवळ', mr: 'उदा: शाळेजवळ/मंदिराजवळ/चौकाजवळ' },
          required: true,
          colSpan: 1
        },
        {
          id: 'fromLocation',
          type: 'text',
          label: { en: 'From (optional)', hi: 'कुठून (वैकल्पिक)', mr: 'कुठून (ऐच्छिक)' },
          placeholder: { en: 'Start point (optional)', hi: 'सुरुवात ठिकाण', mr: 'सुरुवातीचे ठिकाण' },
          required: false,
          colSpan: 1
        },
        {
          id: 'toLocation',
          type: 'text',
          label: { en: 'To (optional)', hi: 'कुठपर्यंत (वैकल्पिक)', mr: 'कुठपर्यंत (ऐच्छिक)' },
          placeholder: { en: 'End point (optional)', hi: 'शेवट ठिकाण', mr: 'शेवटचे ठिकाण' },
          required: false,
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
    // STEP 3: Pothole Details
    // ------------------------------------------------------
    {
      id: 'pothole-details',
      title: { en: 'Pothole Details', hi: 'खड्डा विवरण', mr: 'खड्ड्याचा तपशील' },
      fields: [
        {
          id: 'potholeCount',
          type: 'number',
          label: { en: 'Number of Potholes', hi: 'खड्डों की संख्या', mr: 'खड्डे किती?' },
          placeholder: { en: 'e.g. 1', hi: 'उदा: 1', mr: 'उदा: 1' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'potholeSize',
          type: 'select',
          label: { en: 'Pothole Size', hi: 'खड्डेचा आकार', mr: 'खड्ड्याचा आकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'small', label: { en: 'Small', hi: 'लहान', mr: 'लहान' } },
            { value: 'medium', label: { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम' } },
            { value: 'large', label: { en: 'Large', hi: 'मोठा', mr: 'मोठा' } }
          ]
        },
        {
          id: 'riskLevel',
          type: 'select',
          label: { en: 'Risk Level', hi: 'जोखिम स्तर', mr: 'धोका पातळी' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'low', label: { en: 'Low', hi: 'कमी', mr: 'कमी' } },
            { value: 'medium', label: { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम' } },
            { value: 'high', label: { en: 'High', hi: 'जास्त', mr: 'जास्त' } }
          ]
        },
        {
          id: 'accidentOrDamage',
          type: 'select',
          label: { en: 'Any accident/vehicle damage?', hi: 'कोई अपघात/नुकसान?', mr: 'अपघात/वाहन नुकसान झाले का?' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'remarks',
          type: 'textarea',
          label: { en: 'Remarks (optional)', hi: 'टिप्पणी (वैकल्पिक)', mr: 'टिप्पणी (ऐच्छिक)' },
          placeholder: { en: 'Any additional details', hi: 'अतिरिक्त माहिती', mr: 'अतिरिक्त माहिती' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Declaration
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
      id: 'potholePhoto',
      label: { en: 'Pothole Photo', hi: 'खड्डेचा फोटो', mr: 'खड्ड्याचा फोटो' },
      description: {
        en: 'Upload clear photo(s) of the pothole (wide + close-up recommended).',
        hi: 'खड्डेचा स्पष्ट फोटो अपलोड करा (वाइड + क्लोज-अप).',
        mr: 'खड्ड्याचा स्पष्ट फोटो अपलोड करा (वाइड + क्लोज-अप).'
      },
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxSize: 10
    }
  ]
},

// 8277 – Underground Optical Fibre Cable Permission
  // '8277': {
  //   serviceId: '8277',
  //   steps: [
  //    {
  //       id: "applicant-information",
  //       title: {
  //         en: "Applicant Information",
  //         hi: "आवेदक की जानकारी",
  //         mr: "आवेदकाची माहिती",
  //       },
  //       fields: createApplicantInformationFields(),
  //     },

  //     {
  //       id: 'route-details',
  //       title: {
  //         en: 'Proposed OFC Route Details',
  //         hi: 'प्रस्तावित ओएफसी मार्ग विवरण',
  //         mr: 'प्रस्तावित OFC मार्ग तपशील'
  //       },
  //       description: {
  //         en: 'Accurate route details help coordinate with utilities and plan for emergencies',
  //         hi: 'सटीक मार्ग विवरण से यूटिलिटी समन्वय व आपदा प्रबंधन की योजना आसान होती है',
  //         mr: 'अचूक मार्ग तपशीलामुळे युटिलिटी समन्वय व आपत्ती नियोजन सुलभ होते'
  //       },
  //       fields: [
  //         {
  //           id: 'routeType',
  //           type: 'select',
  //           label: {
  //             en: 'Type of route',
  //             hi: 'मार्ग का प्रकार',
  //             mr: 'मार्गाचा प्रकार'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'along-road', label: { en: 'Along city road / footpath', hi: 'शहर सड़क / फुटपाथ के साथ', mr: 'शहर रस्ता / फुटपाथलगत' } },
  //             { value: 'crossing-road', label: { en: 'Crossing road', hi: 'सड़क पार करना', mr: 'रस्ता क्रॉसिंग' } },
  //             { value: 'across-bridge', label: { en: 'Across bridge / culvert', hi: 'पुल / कलवर्ट के ऊपर/साथ', mr: 'पुल / कल्व्हर्टवरून / बाजूने' } }
  //           ]
  //         },
  //         {
  //           id: 'startLocation',
  //           type: 'text',
  //           label: {
  //             en: 'Start Location (from)',
  //             hi: 'प्रारंभिक स्थान (से)',
  //             mr: 'सुरुवातीचे स्थान (पासून)'
  //           },
  //           required: true,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'endLocation',
  //           type: 'text',
  //           label: {
  //             en: 'End Location (to)',
  //             hi: 'अंतिम स्थान (तक)',
  //             mr: 'अंतिम स्थान (पर्यंत)'
  //           },
  //           required: true,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'routeDescription',
  //           type: 'textarea',
  //           label: {
  //             en: 'Route description with key junctions / land marks',
  //             hi: 'मुख्य चौक / लैंडमार्क सहित मार्ग का वर्णन',
  //             mr: 'मुख्य चौक / भूचिन्हांसह मार्गाचे वर्णन'
  //           },
  //           required: true,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'totalRouteLengthMeters',
  //           type: 'number',
  //           label: {
  //             en: 'Total route length (meters) within ULB area',
  //             hi: 'यूएलबी क्षेत्र में कुल मार्ग लंबाई (मीटर)',
  //             mr: 'महानगरपालिका क्षेत्रातील एकूण मार्ग लांबी (मीटर)'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 1 }
  //         },
  //         {
  //           id: 'zoneNo',
  //           type: 'select',
  //           label: {
  //             en: 'Administrative Zone No.',
  //             hi: 'प्रशासनिक ज़ोन नंबर',
  //             mr: 'प्रशासनिक झोन क्रमांक'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: '1', label: { en: 'Zone 1', hi: 'ज़ोन 1', mr: 'झोन 1' } },
  //             { value: '2', label: { en: 'Zone 2', hi: 'ज़ोन 2', mr: 'झोन 2' } },
  //             { value: '3', label: { en: 'Zone 3', hi: 'ज़ोन 3', mr: 'झोन 3' } },
  //             { value: '4', label: { en: 'Zone 4', hi: 'ज़ोन 4', mr: 'झोन 4' } },
  //             { value: '5', label: { en: 'Zone 5', hi: 'ज़ोन 5', mr: 'झोन 5' } }
  //           ]
  //         },
  //         {
  //           id: 'wardNosCovered',
  //           type: 'text',
  //           label: {
  //             en: 'Ward Nos. covered along route',
  //             hi: 'मार्ग के साथ आने वाले वार्ड नंबर',
  //             mr: 'मार्गावरील प्रभाग क्रमांक'
  //           },
  //           required: true,
  //           colSpan: 1
  //         }
  //       ]
  //     },

  //     {
  //       id: 'trench-and-cable-details',
  //       title: {
  //         en: 'Trench, Duct & Cable Details',
  //         hi: 'खाई, डक्ट व केबल विवरण',
  //         mr: 'खंदक, डक्ट व केबल तपशील'
  //       },
  //       fields: [
  //         {
  //           id: 'layingMethod',
  //           type: 'select',
  //           label: {
  //             en: 'Laying method',
  //             hi: 'बिछाने की पद्धति',
  //             mr: 'अंथरण पद्धत'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'open-cut', label: { en: 'Open cut trench', hi: 'ओपन कट खाई', mr: 'ओपन कट खंदक' } },
  //             { value: 'hdd', label: { en: 'Horizontal directional drilling (HDD)', hi: 'एचडीडी (Horizontal Drilling)', mr: 'HDD (क्षैतिज ड्रिलिंग)' } },
  //             { value: 'micro-tunnelling', label: { en: 'Micro-tunnelling', hi: 'माइक्रो टनलिंग', mr: 'मायक्रो टनेलिंग' } }
  //           ]
  //         },
  //         {
  //           id: 'trenchWidth',
  //           type: 'number',
  //           label: {
  //             en: 'Trench width (cm)',
  //             hi: 'खाई चौड़ाई (से.मी.)',
  //             mr: 'खंदक रुंदी (से.मी.)'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 0 }
  //         },
  //         {
  //           id: 'trenchDepth',
  //           type: 'number',
  //           label: {
  //             en: 'Trench depth (cm)',
  //             hi: 'खाई गहराई (से.मी.)',
  //             mr: 'खंदक खोली (से.मी.)'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 0 }
  //         },
  //         {
  //           id: 'noOfDucts',
  //           type: 'number',
  //           label: {
  //             en: 'Number of ducts proposed',
  //             hi: 'प्रस्तावित डक्ट की संख्या',
  //             mr: 'प्रस्तावित डक्टची संख्या'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           validation: { min: 1 }
  //         },
  //         {
  //           id: 'cableType',
  //           type: 'text',
  //           label: {
  //             en: 'Type of OFC / cable',
  //             hi: 'OFC / केबल का प्रकार',
  //             mr: 'OFC / केबलचा प्रकार'
  //           },
  //           required: true,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'reinstatementType',
  //           type: 'select',
  //           label: {
  //             en: 'Surface reinstatement type',
  //             hi: 'सतह बहाली का प्रकार',
  //             mr: 'सपाटी पुनर्स्थापन प्रकार'
  //           },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'bt-road', label: { en: 'BT road', hi: 'बीटी सड़क', mr: 'बीटी रस्ता' } },
  //             { value: 'cc-road', label: { en: 'CC road', hi: 'सीसी सड़क', mr: 'CC रस्ता' } },
  //             { value: 'paver', label: { en: 'Paver block / footpath', hi: 'पेवर ब्लॉक / फुटपाथ', mr: 'पेवर ब्लॉक / फुटपाथ' } },
  //             { value: 'earthen', label: { en: 'Earthen shoulder / berm', hi: 'मिट्टी कंधा / बर्म', mr: 'मातीचा खांदा / बर्म' } }
  //           ]
  //         }
  //       ]
  //     },

  //     {
  //     id: 'declaration',
  //     title: {
  //       en: 'Declaration',
  //       hi: 'घोषणा',
  //       mr: 'घोषणापत्र'
  //     },
  //     fields: [
  //       ...declarationField(),
  //     ]
  //     },

  //     {
  //       id: 'ofc-office-use',
  //       title: {
  //         en: 'Town Planning / Road Department – Office Use Only',
  //         hi: 'टाउन प्लानिंग / सड़क विभाग – केवल कार्यालय उपयोग हेतु',
  //         mr: 'टाउन प्लॅनिंग / रस्ता विभाग – केवळ कार्यालयीन वापरासाठी'
  //       },
  //       fields: [
  //         {
  //           id: 'permissionFileNo',
  //           type: 'text',
  //           label: {
  //             en: 'Permission File No.',
  //             hi: 'अनुमति फाइल नंबर',
  //             mr: 'परवानगी फाईल क्रमांक'
  //           },
  //           required: false,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'permissionIssueDate',
  //           type: 'date',
  //           label: {
  //             en: 'Permission Issue Date',
  //             hi: 'अनुमति जारी दिनांक',
  //             mr: 'परवानगी जारी दिनांक'
  //           },
  //           required: false,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'securityDepositAmount',
  //           type: 'number',
  //           label: {
  //             en: 'Security deposit amount (₹)',
  //             hi: 'सिक्योरिटी डिपॉजिट राशि (₹)',
  //             mr: 'सिक्योरिटी डिपॉझिट रक्कम (₹)'
  //           },
  //           required: false,
  //           colSpan: 1
  //         },
  //         {
  //           id: 'restorationVerified',
  //           type: 'select',
  //           label: {
  //             en: 'Road restoration verified',
  //             hi: 'रोड बहाली की पुष्टि',
  //             mr: 'रस्ता पुनर्स्थापन तपासले'
  //           },
  //           required: false,
  //           colSpan: 1,
  //           options: [
  //             { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
  //             { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
  //           ]
  //         },
  //         {
  //           id: 'remarks',
  //           type: 'textarea',
  //           label: {
  //             en: 'Department remarks / conditions',
  //             hi: 'विभागीय टिप्पणी / शर्तें',
  //             mr: 'विभागीय निरीक्षण / अटी'
  //           },
  //           required: false,
  //           colSpan: 1
  //         }
  //       ]
  //     }
  //   ],

  //   documents: [
  //     {
  //       id: 'companyRegistrationDoc',
  //       label: {
  //         en: 'Company Registration / License',
  //         hi: 'कंपनी पंजीकरण / लाइसेंस',
  //         mr: 'कंपनी नोंदणी / परवाना'
  //       },
  //       description: {
  //         en: 'Copy of telecom / infrastructure license / registration',
  //         hi: 'टेलीकॉम / इन्फ्रा लाइसेंस / पंजीकरण की प्रति',
  //         mr: 'टेलिकॉम / इन्फ्रा परवाना / नोंदणीची प्रत'
  //       },
  //       required: true,
  //       acceptedFormats: ['.pdf'],
  //       maxSize: 10
  //     },
  //     {
  //       id: 'routeMap',
  //       label: {
  //         en: 'Route map on city base map',
  //         hi: 'सिटी बेस मैप पर मार्ग नक्शा',
  //         mr: 'सिटी बेस नकाशावर मार्ग नकाशा'
  //       },
  //       description: {
  //         en: 'Route map showing start / end, junctions, major utilities and critical facilities',
  //         hi: 'प्रारंभ / अंत, चौक, प्रमुख यूटिलिटी व महत्वपूर्ण संस्थाएं दिखाने वाला मार्ग नक्शा',
  //         mr: 'सुरुवात / शेवट, चौक, प्रमुख युटिलिटी व महत्त्वाच्या सुविधा दर्शवणारा मार्ग नकाशा'
  //       },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  //       maxSize: 20
  //     },
  //     {
  //       id: 'crossSectionDetail',
  //       label: {
  //         en: 'Typical trench / cross-section detail',
  //         hi: 'ट्रेंच / क्रॉस सेक्शन डिटेल',
  //         mr: 'खंदक / क्रॉस सेक्शन तपशील'
  //       },
  //       description: {
  //         en: 'Drawing showing trench width, depth, ducts and reinstatement layers',
  //         hi: 'खाई चौड़ाई, गहराई, डक्ट व बहाली लेयर दिखाने वाला ड्रॉइंग',
  //         mr: 'खंदक रुंदी, खोली, डक्ट व पुनर्स्थापन लेयर दर्शवणारा ड्रॉइंग'
  //       },
  //       required: true,
  //       acceptedFormats: ['.pdf'],
  //       maxSize: 10
  //     },
  //     {
  //       id: 'trafficManagementPlan',
  //       label: {
  //         en: 'Traffic management plan (if required)',
  //         hi: 'ट्रैफिक मैनेजमेंट प्लान (यदि आवश्यक हो)',
  //         mr: 'वाहतूक व्यवस्थापन योजना (लागू असल्यास)'
  //       },
  //       description: {
  //         en: 'Diversion / signage plan for high traffic roads',
  //         hi: 'अधिक यातायात सड़कों हेतु डायवर्जन / साइनेज प्लान',
  //         mr: 'जास्त वाहतूक असलेल्या रस्त्यांसाठी डायव्हर्शन / साइनज योजना'
  //       },
  //       required: false,
  //       acceptedFormats: ['.pdf'],
  //       maxSize: 10
  //     },
  //     {
  //       id: 'authorisationLetter',
  //       label: {
  //         en: 'Authorisation Letter',
  //         hi: 'प्राधिकरण पत्र',
  //         mr: 'अधिकृत पत्र'
  //       },
  //       description: {
  //         en: 'If application filed by authorised contractor / representative',
  //         hi: 'यदि आवेदन अधिकृत ठेकेदार / प्रतिनिधि द्वारा दाखिल हो',
  //         mr: 'अर्ज अधिकृत कंत्राटदार / प्रतिनिधीने दाखल केल्यास'
  //       },
  //       required: false,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  //       maxSize: 5
  //     }
  //   ]
  // },
'8277': {
  serviceId: '8277',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant / Organization Details
    // ------------------------------------------------------
    {
      id: 'applicant-org-details',
      title: { en: 'Applicant / Organization Details', hi: 'आवेदक / संस्था विवरण', mr: 'अर्जदार / संस्था माहिती' },
      fields: [
        {
          id: 'applicantType',
          type: 'select',
          label: { en: 'Applicant Type', hi: 'आवेदक प्रकार', mr: 'अर्जदाराचा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'telecom_isp', label: { en: 'Telecom / ISP', hi: 'टेलिकॉम / ISP', mr: 'टेलिकॉम / ISP' } },
            { value: 'contractor', label: { en: 'Contractor', hi: 'कॉन्ट्रॅक्टर', mr: 'कॉन्ट्रॅक्टर' } },
            { value: 'government', label: { en: 'Government', hi: 'शासकीय', mr: 'शासकीय' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'organizationName',
          type: 'text',
          label: { en: 'Organization / Company Name', hi: 'संस्था / कंपनीचे नाव', mr: 'संस्था / कंपनीचे नाव' },
          placeholder: { en: 'Enter organization name', hi: 'संस्थेचे नाव लिहा', mr: 'संस्थेचे नाव लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'authorizedSignatoryName',
          type: 'text',
          label: { en: 'Authorized Signatory Name', hi: 'अधिकृत स्वाक्षरीदाराचे नाव', mr: 'अधिकृत स्वाक्षरीदाराचे नाव' },
          placeholder: { en: 'Enter name', hi: 'नाव लिहा', mr: 'नाव लिहा' },
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
          label: { en: 'Email (recommended)', hi: 'ईमेल (शिफारसीय)', mr: 'ईमेल (शिफारसीय)' },
          placeholder: { en: 'Enter email', hi: 'ईमेल लिहा', mr: 'ईमेल लिहा' },
          required: false,
          colSpan: 1
        },
        {
          id: 'officeAddress',
          type: 'textarea',
          label: { en: 'Office Address', hi: 'कार्यालयाचा पत्ता', mr: 'कार्यालयाचा पत्ता' },
          placeholder: { en: 'Full office address', hi: 'पूर्ण पत्ता', mr: 'पूर्ण पत्ता' },
          required: true,
          colSpan: 1
        },
        {
          id: 'licenseOrRegistrationNo',
          type: 'text',
          label: { en: 'License / Registration No (if any)', hi: 'लाइसेंस / रजिस्ट्रेशन नं (यदि हो)', mr: 'लायसन्स / नोंदणी क्र. (असल्यास)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { maxLength: 50 }
        },
        {
          id: 'gstNo',
          type: 'text',
          label: { en: 'GST No (if any)', hi: 'GST नं (यदि हो)', mr: 'GST क्र. (असल्यास)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { maxLength: 20 }
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Work Location Details
    // ------------------------------------------------------
    {
      id: 'work-location',
      title: { en: 'Work Location Details', hi: 'कार्य स्थल विवरण', mr: 'कामाचा परिसर' },
      fields: [
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward', hi: 'वार्ड', mr: 'वार्ड' },
          required: true,
          colSpan: 1,
          options: [] // ward master
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone', hi: 'झोन', mr: 'झोन' },
          required: true,
          colSpan: 1,
          options: [] // zone master (filtered by ward)
        },
        {
          id: 'workAreaType',
          type: 'select',
          label: { en: 'Work Area Type', hi: 'कार्य क्षेत्र प्रकार', mr: 'कामाचा भाग कोणता?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'main_road', label: { en: 'Main Road', hi: 'मुख्य रस्ता', mr: 'मुख्य रस्ता' } },
            { value: 'internal_road', label: { en: 'Internal Road', hi: 'अंतर्गत रस्ता', mr: 'अंतर्गत रस्ता' } },
            { value: 'footpath', label: { en: 'Footpath', hi: 'फुटपाथ', mr: 'फुटपाथ' } },
            { value: 'divider', label: { en: 'Divider', hi: 'डिव्हायडर', mr: 'डिव्हायडर' } },
            { value: 'garden_open_space', label: { en: 'Garden / Open Space', hi: 'बाग / मोकळी जागा', mr: 'बाग / मोकळी जागा' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'roadStreetName',
          type: 'text',
          label: { en: 'Road / Street Name', hi: 'रस्ता / गल्लीचे नाव', mr: 'रस्ता / गल्लीचे नाव' },
          placeholder: { en: 'Enter road/street name', hi: 'रस्त्याचे नाव लिहा', mr: 'रस्त्याचे नाव लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'fromLocation',
          type: 'text',
          label: { en: 'From Location', hi: 'कुठून', mr: 'कुठून (From)' },
          placeholder: { en: 'Start point', hi: 'सुरुवात ठिकाण', mr: 'सुरुवातीचे ठिकाण' },
          required: true,
          colSpan: 1
        },
        {
          id: 'toLocation',
          type: 'text',
          label: { en: 'To Location', hi: 'कुठपर्यंत', mr: 'कुठपर्यंत (To)' },
          placeholder: { en: 'End point', hi: 'शेवट ठिकाण', mr: 'शेवटचे ठिकाण' },
          required: true,
          colSpan: 1
        },
        {
          id: 'landmark',
          type: 'text',
          label: { en: 'Landmark (optional)', hi: 'लँडमार्क (वैकल्पिक)', mr: 'लँडमार्क (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1
        },
        {
          id: 'totalRouteLengthMeters',
          type: 'number',
          label: { en: 'Total Route Length (meters)', hi: 'कुल लांबी (मीटर)', mr: 'एकूण लांबी (मीटर)' },
          placeholder: { en: 'e.g. 500', hi: 'उदा: 500', mr: 'उदा: 500' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: Excavation / Laying Details
    // NOTE:
    // If methodOfLaying == 'open_trench' then trenchWidthCm & trenchDepthCm should be required in UI.
    // ------------------------------------------------------
    {
      id: 'laying-details',
      title: { en: 'Excavation / Laying Details', hi: 'खोदकाम / बिछाने का विवरण', mr: 'खोदकाम / केबल टाकण्याचा तपशील' },
      fields: [
        {
          id: 'methodOfLaying',
          type: 'select',
          label: { en: 'Method of Laying', hi: 'बिछाने की पद्धत', mr: 'केबल टाकण्याची पद्धत' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'open_trench', label: { en: 'Open Trench (Excavation)', hi: 'उघडे खोदकाम', mr: 'उघडे खोदकाम (Open Trench)' } },
            { value: 'hdd_boring', label: { en: 'HDD (Boring)', hi: 'बोरिंग (HDD)', mr: 'बोरिंग (HDD)' } },
            { value: 'micro_trenching', label: { en: 'Micro-trenching', hi: 'मायक्रो ट्रेंचिंग', mr: 'मायक्रो ट्रेंचिंग' } },
            { value: 'existing_duct', label: { en: 'Use Existing Duct', hi: 'विद्यमान डक्ट वापरणे', mr: 'विद्यमान डक्ट वापरणे' } }
          ]
        },
        {
          id: 'trenchWidthCm',
          type: 'number',
          label: { en: 'Trench Width (cm)', hi: 'खोदाई चौड़ाई (सेमी)', mr: 'खोदकामाची रुंदी (सेमी)' },
          placeholder: { en: 'e.g. 30', hi: 'उदा: 30', mr: 'उदा: 30' },
          required: false, // conditionally required if methodOfLaying == 'open_trench'
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'trenchDepthCm',
          type: 'number',
          label: { en: 'Trench Depth (cm)', hi: 'खोदाई गहराई (सेमी)', mr: 'खोदकामाची खोली (सेमी)' },
          placeholder: { en: 'e.g. 90', hi: 'उदा: 90', mr: 'उदा: 90' },
          required: false, // conditionally required if methodOfLaying == 'open_trench'
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'roadCrossingsCount',
          type: 'number',
          label: { en: 'No. of Road Crossings', hi: 'रोड क्रॉसिंग संख्या', mr: 'रोड क्रॉसिंग किती?' },
          placeholder: { en: 'e.g. 2', hi: 'उदा: 2', mr: 'उदा: 2' },
          required: true,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'ductPipeSize',
          type: 'text',
          label: { en: 'Duct / HDPE Pipe Size', hi: 'डक्ट / HDPE पाइप साईज', mr: 'डक्ट / HDPE पाइप साईज' },
          placeholder: { en: 'e.g. 40mm', hi: 'उदा: 40mm', mr: 'उदा: 40mm' },
          required: true,
          colSpan: 1,
          validation: { maxLength: 50 }
        },
        {
          id: 'noOfDucts',
          type: 'number',
          label: { en: 'No. of Ducts (optional)', hi: 'डक्ट संख्या (वैकल्पिक)', mr: 'डक्ट संख्या (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'handholesChambersCount',
          type: 'number',
          label: { en: 'Handholes / Chambers (optional)', hi: 'हॅन्डहोल / चेंबर (वैकल्पिक)', mr: 'हँडहोल / चेंबर (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'expectedStartDate',
          type: 'date',
          label: { en: 'Expected Start Date', hi: 'सुरू दिनांक', mr: 'काम सुरू दिनांक' },
          required: true,
          colSpan: 1
        },
        {
          id: 'expectedEndDate',
          type: 'date',
          label: { en: 'Expected End Date', hi: 'पूर्ण दिनांक', mr: 'काम पूर्ण दिनांक' },
          required: true,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Safety & Restoration
    // ------------------------------------------------------
    {
      id: 'safety-restoration',
      title: { en: 'Safety & Restoration', hi: 'सुरक्षा व पुनर्स्थापना', mr: 'सुरक्षा व रस्ता पूर्ववत' },
      fields: [
        {
          id: 'trafficManagementRequired',
          type: 'select',
          label: { en: 'Traffic Management Required?', hi: 'ट्रॅफिक मॅनेजमेंट आवश्यक?', mr: 'ट्रॅफिक मॅनेजमेंट लागेल का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'barricadingAndSafety',
          type: 'select',
          label: { en: 'Barricading & Safety Arrangement', hi: 'बॅरिकेडिंग व सुरक्षा व्यवस्था', mr: 'बॅरिकेडिंग व सुरक्षा व्यवस्था' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes, will provide', hi: 'हाँ, करू', mr: 'होय, करणार' } }
          ]
        },
        {
          id: 'restorationResponsibility',
          type: 'select',
          label: { en: 'Restoration Responsibility', hi: 'पुनर्स्थापना जबाबदारी', mr: 'रस्ता पूर्ववत कोण करेल?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'applicant', label: { en: 'Applicant', hi: 'आवेदक', mr: 'अर्जदार' } },
            { value: 'contractor', label: { en: 'Contractor', hi: 'कॉन्ट्रॅक्टर', mr: 'कॉन्ट्रॅक्टर' } }
          ]
        },
        {
          id: 'restorationType',
          type: 'select',
          label: { en: 'Restoration Type', hi: 'पुनर्स्थापना प्रकार', mr: 'Restoration प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'cc_road', label: { en: 'CC Road', hi: 'सीसी रस्ता', mr: 'सीसी रस्ता' } },
            { value: 'asphalt', label: { en: 'Asphalt', hi: 'डांबर', mr: 'डांबर' } },
            { value: 'paver_blocks', label: { en: 'Paver Blocks', hi: 'पेवर ब्लॉक्स', mr: 'पेवर ब्लॉक्स' } },
            { value: 'footpath_tiles', label: { en: 'Footpath Tiles', hi: 'फुटपाथ टाईल्स', mr: 'फुटपाथ टाईल्स' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'undertakingConsent',
          type: 'select',
          label: { en: 'Undertaking / Indemnity Consent', hi: 'हमीपत्र / नुकसानभरपाई संमती', mr: 'हमीपत्र / नुकसानभरपाई संमती' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes, I agree', hi: 'हाँ, सहमत', mr: 'होय, मी सहमत आहे' } }
          ]
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
      id: 'routeMapDrawing',
      label: { en: 'Route Map / Drawing (PDF)', hi: 'रूट मैप / ड्रॉईंग (PDF)', mr: 'रूट मॅप / ड्रॉईंग (PDF)' },
      description: {
        en: 'From-To route map with road names and length marked.',
        hi: 'From-To रूट मैप (रस्त्यांची नावे व लांबी).',
        mr: 'From-To रूट मॅप (रस्त्यांची नावे व लांबी मार्क).'
      },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 25
    },
    {
      id: 'methodStatement',
      label: { en: 'Work Method Statement', hi: 'मेथड स्टेटमेंट', mr: 'कामाची पद्धत (Method Statement)' },
      description: {
        en: 'Open trench/HDD details with safety plan.',
        hi: 'Open trench/HDD तपशील व सुरक्षा योजना.',
        mr: 'Open trench/HDD तपशील व सुरक्षा योजना.'
      },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 15
    },
    {
      id: 'authorizationLetter',
      label: { en: 'Authorization Letter', hi: 'अधिकृत पत्र', mr: 'अधिकृत पत्र' },
      description: {
        en: 'Company authorization to signatory/contractor.',
        hi: 'कंपनीकडून स्वाक्षरीदार/कॉन्ट्रॅक्टरला अधिकृत पत्र.',
        mr: 'कंपनीकडून स्वाक्षरीदार/कॉन्ट्रॅक्टरला अधिकृत पत्र.'
      },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'undertakingIndemnityBond',
      label: { en: 'Undertaking / Indemnity Bond', hi: 'हमीपत्र / Indemnity Bond', mr: 'हमीपत्र / Indemnity Bond' },
      description: {
        en: 'Undertaking for restoration and liability.',
        hi: 'रस्ता पूर्ववत व नुकसान जबाबदारीसाठी हमीपत्र.',
        mr: 'रस्ता पूर्ववत व नुकसान जबाबदारीसाठी हमीपत्र.'
      },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 15
    },
    {
      id: 'trafficPoliceNoc',
      label: { en: 'Traffic Police NOC (if applicable)', hi: 'ट्रॅफिक पोलीस NOC (लागू असल्यास)', mr: 'ट्रॅफिक पोलीस NOC (लागू असल्यास)' },
      description: { en: 'Upload if required for main road/heavy traffic.', hi: 'जर लागू असेल तर', mr: 'जर लागू असेल तर' },
      required: false, // conditionally required if trafficManagementRequired == 'yes'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'pwdNhaiNoc',
      label: { en: 'PWD/NHAI NOC (if applicable)', hi: 'PWD/NHAI NOC (लागू असल्यास)', mr: 'PWD/NHAI NOC (लागू असल्यास)' },
      description: { en: 'Upload if route includes highway/major road.', hi: 'जर लागू असेल तर', mr: 'जर लागू असेल तर' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    }
  ]
},


  // ------------------------------------------
  // ROAD CUTTING PERMISSION (7700)
  // ------------------------------------------
  // '9003': {
  //   serviceId: '9003',
  //   steps: [
  //     // STEP 1: APPLICANT DETAILS
  //   {
  //       id: "applicant-information",
  //       title: {
  //         en: "Applicant Information",
  //         hi: "आवेदक की जानकारी",
  //         mr: "आवेदकाची माहिती",
  //       },
  //       fields: createApplicantInformationFields(),
  //     },

  //     // STEP 2: ROAD CUTTING DETAILS
  //     {
  //       id: 'road-details',
  //       title: { en: 'Road Cutting Details', hi: 'सड़क काटने का विवरण', mr: 'रस्ते खोदणे तपशील' },
  //       fields: [
  //         {
  //           id: 'zoneNo',
  //           type: 'select',
  //           label: { en: 'Zone', hi: 'ज़ोन', mr: 'क्षेत्र / झोन' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'East', label: { en: 'East Zone', hi: 'पूर्व ज़ोन', mr: 'पूर्व झोन' } },
  //             { value: 'West', label: { en: 'West Zone', hi: 'पश्चिम ज़ोन', mr: 'पश्चिम झोन' } },
  //             { value: 'North', label: { en: 'North Zone', hi: 'उत्तर ज़ोन', mr: 'उत्तर झोन' } },
  //             { value: 'South', label: { en: 'South Zone', hi: 'दक्षिण ज़ोन', mr: 'दक्षिण झोन' } }
  //           ]
  //         },
  //         { id: 'wardArea', type: 'text', label: { en: 'Ward Area', hi: 'वार्ड क्षेत्र', mr: 'प्रभाग क्षेत्र' }, required: true, colSpan: 1 },
          
  //         { id: 'purpose', type: 'textarea', label: { en: 'Purpose of Road Cutting', hi: 'सड़क काटने का उद्देश्य', mr: 'रस्ता खोदण्याचे कारण' }, required: true, colSpan: 1 },
  //         { id: 'roadLength', type: 'number', label: { en: 'Length to be cut (Mtr)', hi: 'काटने वाली लंबाई (मीटर)', mr: 'खोदण्यात येणाऱ्या रस्त्याची लांबी (मी.)' }, required: true, colSpan: 1 },
  //         { id: 'locationCount', type: 'number', label: { en: 'Number of Locations', hi: 'स्थानों की संख्या', mr: 'ठिकाणांची संख्या' }, required: true, colSpan: 1 },
          
  //         { id: 'sizeMM', type: 'text', label: { en: 'Size (in MM)', hi: 'आकार (मिमी)', mr: 'आकार (मी.मी.) मध्ये' }, required: true, colSpan: 1 },
  //         { id: 'roadAddress', type: 'textarea', label: { en: 'Address of the Road', hi: 'सड़क का पता', mr: 'रस्ता खोदण्याच्या ठिकाणाचा पत्ता' }, required: true, colSpan: 1 },
  //       ]
  //     },

  //     // STEP 3: DECLARATION
  //    {
  //     id: 'declaration',
  //     title: {
  //       en: 'Declaration',
  //       hi: 'घोषणा',
  //       mr: 'घोषणापत्र'
  //     },
  //     fields: [
  //       ...declarationField(),
  //     ]
  //   }
  //   ],

  //   // DOCUMENTS
  //   documents: [
  //     {
  //       id: 'prescribedApp',
  //       label: { en: 'Application in Prescribed Format', hi: 'निर्धारित प्रारूप में आवेदन', mr: 'विहित नमुन्यातील अर्ज' },
  //       description: { en: 'Upload filled application form', hi: 'भरा हुआ आवेदन पत्र अपलोड करें', mr: 'भरलेला अर्ज अपलोड करा' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 5
  //     },
  //     {
  //       id: 'noDuesCert',
  //       label: { en: 'Certificate of No Dues', hi: 'बकाया नहीं होने का प्रमाण पत्र', mr: 'थकबाकी नसल्याचा दाखला' },
  //       description: { en: 'Proof of no pending dues', hi: 'कोई लंबित बकाया नहीं होने का प्रमाण', mr: 'थकबाकी नसल्याचा पुरावा' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'govtDocs',
  //       label: { en: 'Govt. Instructed Documents', hi: 'सरकार द्वारा निर्देशित दस्तावेज', mr: 'शासनाद्वारे विहित केलेली कागदपत्रे' },
  //       description: { en: 'Any other government required docs', hi: 'कोई अन्य सरकारी आवश्यक दस्तावेज', mr: 'इतर कोणतीही शासकीय आवश्यक कागदपत्रे' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 5
  //     }
  //   ]
  // },
'9003': {
  serviceId: '9003',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant Details
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
            { value: 'citizen', label: { en: 'Citizen', hi: 'नागरिक', mr: 'नागरिक' } },
            { value: 'contractor', label: { en: 'Contractor', hi: 'कॉन्ट्रॅक्टर', mr: 'कॉन्ट्रॅक्टर' } },
            { value: 'utility_company', label: { en: 'Utility Company', hi: 'युटिलिटी कंपनी', mr: 'युटिलिटी कंपनी' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'applicantNameOrCompany',
          type: 'text',
          label: { en: 'Applicant / Company Name', hi: 'आवेदक / कंपनीचे नाव', mr: 'अर्जदार / कंपनीचे नाव' },
          placeholder: { en: 'Enter name/company', hi: 'नाव/कंपनी लिहा', mr: 'नाव/कंपनी लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'authorizedPersonName',
          type: 'text',
          label: { en: 'Authorized Person Name (if applicable)', hi: 'अधिकृत व्यक्तीचे नाव (लागू असल्यास)', mr: 'अधिकृत व्यक्तीचे नाव (लागू असल्यास)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false, // Conditionally required if applicantType == 'contractor' or 'utility_company'
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
          label: { en: 'Address', hi: 'पता', mr: 'पत्ता' },
          placeholder: { en: 'Full address', hi: 'पूर्ण पत्ता', mr: 'पूर्ण पत्ता' },
          required: true,
          colSpan: 1
        },
        {
          id: 'idProofType',
          type: 'select',
          label: { en: 'ID Proof Type (for citizen)', hi: 'पहचान पत्र प्रकार (नागरिक)', mr: 'ओळखपत्र प्रकार (नागरिक)' },
          required: false, // Recommended for applicantType == 'citizen'
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
          label: { en: 'ID Proof Number (for citizen)', hi: 'पहचान पत्र क्रमांक (नागरिक)', mr: 'ओळखपत्र क्रमांक (नागरिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false, // Recommended for applicantType == 'citizen'
          colSpan: 1,
          validation: { maxLength: 20 }
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Work Location Details
    // ------------------------------------------------------
    {
      id: 'work-location',
      title: { en: 'Work Location Details', hi: 'कार्य स्थल विवरण', mr: 'कामाचे लोकेशन' },
      fields: [
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward', hi: 'वार्ड', mr: 'वार्ड' },
          required: true,
          colSpan: 1,
          options: [] // ward master
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone', hi: 'झोन', mr: 'झोन' },
          required: true,
          colSpan: 1,
          options: [] // zone master (filtered by ward)
        },
        {
          id: 'roadStreetName',
          type: 'text',
          label: { en: 'Road / Street Name', hi: 'रस्ता / गल्लीचे नाव', mr: 'रस्ता / गल्लीचे नाव' },
          placeholder: { en: 'Enter road/street name', hi: 'रस्त्याचे नाव लिहा', mr: 'रस्त्याचे नाव लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'fromLocation',
          type: 'text',
          label: { en: 'From Location', hi: 'कुठून', mr: 'कुठून (From)' },
          placeholder: { en: 'Start point', hi: 'सुरुवात ठिकाण', mr: 'सुरुवातीचे ठिकाण' },
          required: true,
          colSpan: 1
        },
        {
          id: 'toLocation',
          type: 'text',
          label: { en: 'To Location', hi: 'कुठपर्यंत', mr: 'कुठपर्यंत (To)' },
          placeholder: { en: 'End point', hi: 'शेवट ठिकाण', mr: 'शेवटचे ठिकाण' },
          required: true,
          colSpan: 1
        },
        {
          id: 'landmark',
          type: 'text',
          label: { en: 'Landmark', hi: 'लँडमार्क', mr: 'लँडमार्क' },
          placeholder: { en: 'e.g. Near school/chowk', hi: 'उदा: शाळेजवळ/चौकाजवळ', mr: 'उदा: शाळेजवळ/चौकाजवळ' },
          required: true,
          colSpan: 1
        },
        {
          id: 'totalLengthMeters',
          type: 'number',
          label: { en: 'Total Length (meters)', hi: 'कुल लांबी (मीटर)', mr: 'एकूण लांबी (मीटर)' },
          placeholder: { en: 'e.g. 50', hi: 'उदा: 50', mr: 'उदा: 50' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
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
    // STEP 3: Road Cutting Details
    // NOTE:
    // If excavationMethod == 'open_trench' then width/depth should be required in UI.
    // ------------------------------------------------------
    {
      id: 'road-cutting-details',
      title: { en: 'Road Cutting Details', hi: 'रोड कटिंग विवरण', mr: 'रस्ता कटिंग तपशील' },
      fields: [
        {
          id: 'purpose',
          type: 'select',
          label: { en: 'Purpose / Reason', hi: 'उद्देश्य / कारण', mr: 'उद्देश / कारण' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'water_connection', label: { en: 'Water Connection', hi: 'पाणी कनेक्शन', mr: 'पाणी कनेक्शन' } },
            { value: 'sewer_connection', label: { en: 'Sewer/Drainage Connection', hi: 'ड्रेनेज कनेक्शन', mr: 'ड्रेनेज कनेक्शन' } },
            { value: 'electric_cable', label: { en: 'Electric Cable', hi: 'विद्युत केबल', mr: 'विद्युत केबल' } },
            { value: 'gas_pipeline', label: { en: 'Gas Pipeline', hi: 'गॅस लाईन', mr: 'गॅस लाईन' } },
            { value: 'ofc', label: { en: 'OFC / Telecom Cable', hi: 'OFC / टेलिकॉम', mr: 'OFC / टेलिकॉम' } },
            { value: 'repair', label: { en: 'Repair / Maintenance', hi: 'दुरुस्ती', mr: 'दुरुस्ती' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'excavationMethod',
          type: 'select',
          label: { en: 'Method', hi: 'पद्धत', mr: 'पद्धत' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'open_trench', label: { en: 'Open Trench', hi: 'उघडे खोदकाम', mr: 'उघडे खोदकाम' } },
            { value: 'hdd_boring', label: { en: 'HDD (Boring)', hi: 'HDD (बोरिंग)', mr: 'HDD (बोरिंग)' } },
            { value: 'micro_trench', label: { en: 'Micro-trenching', hi: 'मायक्रो ट्रेंचिंग', mr: 'मायक्रो ट्रेंचिंग' } }
          ]
        },
        {
          id: 'surfaceType',
          type: 'select',
          label: { en: 'Surface Type', hi: 'सतह प्रकार', mr: 'रस्त्याचा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'asphalt', label: { en: 'Asphalt (Tar)', hi: 'डांबर', mr: 'डांबर' } },
            { value: 'cc_road', label: { en: 'CC Road', hi: 'सीसी रस्ता', mr: 'सीसी रस्ता' } },
            { value: 'paver_blocks', label: { en: 'Paver Blocks', hi: 'पेवर ब्लॉक्स', mr: 'पेवर ब्लॉक्स' } },
            { value: 'footpath_tiles', label: { en: 'Footpath Tiles', hi: 'फुटपाथ टाईल्स', mr: 'फुटपाथ टाईल्स' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'cuttingWidthCm',
          type: 'number',
          label: { en: 'Cutting Width (cm)', hi: 'कटिंग चौड़ाई (सेमी)', mr: 'कटिंग रुंदी (सेमी)' },
          placeholder: { en: 'e.g. 30', hi: 'उदा: 30', mr: 'उदा: 30' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'cuttingDepthCm',
          type: 'number',
          label: { en: 'Cutting Depth (cm)', hi: 'कटिंग गहराई (सेमी)', mr: 'कटिंग खोली (सेमी)' },
          placeholder: { en: 'e.g. 90', hi: 'उदा: 90', mr: 'उदा: 90' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'roadCrossingsCount',
          type: 'number',
          label: { en: 'No. of Road Crossings (optional)', hi: 'रोड क्रॉसिंग (वैकल्पिक)', mr: 'रोड क्रॉसिंग (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'expectedStartDate',
          type: 'date',
          label: { en: 'Expected Start Date', hi: 'सुरू दिनांक', mr: 'काम सुरू दिनांक' },
          required: true,
          colSpan: 1
        },
        {
          id: 'expectedEndDate',
          type: 'date',
          label: { en: 'Expected End Date', hi: 'पूर्ण दिनांक', mr: 'काम पूर्ण दिनांक' },
          required: true,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Safety & Restoration
    // ------------------------------------------------------
    {
      id: 'safety-restoration',
      title: { en: 'Safety & Restoration', hi: 'सुरक्षा व पुनर्स्थापना', mr: 'सुरक्षा व रस्ता पूर्ववत' },
      fields: [
        {
          id: 'trafficManagementRequired',
          type: 'select',
          label: { en: 'Traffic Management Required?', hi: 'ट्रॅफिक मॅनेजमेंट आवश्यक?', mr: 'ट्रॅफिक मॅनेजमेंट लागेल का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'barricadingAndSafety',
          type: 'select',
          label: { en: 'Barricading & Safety Arrangement', hi: 'बॅरिकेडिंग व सुरक्षा व्यवस्था', mr: 'बॅरिकेडिंग व सुरक्षा व्यवस्था' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes, will provide', hi: 'हाँ, करू', mr: 'होय, करणार' } }
          ]
        },
        {
          id: 'restorationResponsibility',
          type: 'select',
          label: { en: 'Restoration Responsibility', hi: 'पुनर्स्थापना जबाबदारी', mr: 'रस्ता पूर्ववत कोण करेल?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'applicant', label: { en: 'Applicant', hi: 'आवेदक', mr: 'अर्जदार' } },
            { value: 'contractor', label: { en: 'Contractor', hi: 'कॉन्ट्रॅक्टर', mr: 'कॉन्ट्रॅक्टर' } }
          ]
        },
        {
          id: 'restorationType',
          type: 'select',
          label: { en: 'Restoration Type', hi: 'पुनर्स्थापना प्रकार', mr: 'Restoration प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'asphalt', label: { en: 'Asphalt', hi: 'डांबर', mr: 'डांबर' } },
            { value: 'cc_road', label: { en: 'CC Road', hi: 'सीसी रस्ता', mr: 'सीसी रस्ता' } },
            { value: 'paver_blocks', label: { en: 'Paver Blocks', hi: 'पेवर ब्लॉक्स', mr: 'पेवर ब्लॉक्स' } },
            { value: 'footpath_tiles', label: { en: 'Footpath Tiles', hi: 'फुटपाथ टाईल्स', mr: 'फुटपाथ टाईल्स' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'undertakingConsent',
          type: 'select',
          label: { en: 'Undertaking / Indemnity Consent', hi: 'हमीपत्र / नुकसानभरपाई संमती', mr: 'हमीपत्र / नुकसानभरपाई संमती' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes, I agree', hi: 'हाँ, सहमत', mr: 'होय, मी सहमत आहे' } }
          ]
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
      id: 'routeMapSketch',
      label: { en: 'Route Map / Sketch (PDF)', hi: 'रूट मैप / स्केच (PDF)', mr: 'रूट मॅप / स्केच (PDF)' },
      description: {
        en: 'From-To route map/sketch with length marked.',
        hi: 'From-To रूट मैप/स्केच (लांबी मार्क).',
        mr: 'From-To रूट मॅप/स्केच (लांबी मार्क).'
      },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 25
    },
    {
      id: 'methodStatementSafetyPlan',
      label: { en: 'Work Method Statement / Safety Plan', hi: 'मेथड स्टेटमेंट / सुरक्षा योजना', mr: 'कामाची पद्धत / सुरक्षा योजना' },
      description: {
        en: 'Method of excavation + safety arrangements.',
        hi: 'खोदकाम पद्धत + सुरक्षा व्यवस्था.',
        mr: 'खोदकाम पद्धत + सुरक्षा व्यवस्था.'
      },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 15
    },
    {
      id: 'undertakingIndemnityBond',
      label: { en: 'Undertaking / Indemnity Bond', hi: 'हमीपत्र / Indemnity Bond', mr: 'हमीपत्र / Indemnity Bond' },
      description: {
        en: 'Undertaking for restoration and liability.',
        hi: 'रस्ता पूर्ववत व नुकसान जबाबदारीसाठी हमीपत्र.',
        mr: 'रस्ता पूर्ववत व नुकसान जबाबदारीसाठी हमीपत्र.'
      },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 15
    },
    {
      id: 'authorizationOrPoa',
      label: { en: 'Authorization / POA (if applicable)', hi: 'प्राधिकरण / POA (लागू असल्यास)', mr: 'अधिकृत पत्र / POA (लागू असल्यास)' },
      description: {
        en: 'Upload if applicant is not authorized owner/signatory.',
        hi: 'यदि आवेदक अधिकृत नहीं है तो अपलोड करें.',
        mr: 'अर्जदार अधिकृत नसेल तर अपलोड करा.'
      },
      required: false, // Conditionally required if applicantType != 'citizen' OR if applicant acts on behalf of owner/company
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'preConditionPhotos',
      label: { en: 'Pre-condition Photos', hi: 'पूर्व स्थिति फोटो', mr: 'कामापूर्वीचे फोटो' },
      description: {
        en: 'Clear photos of the road/footpath before cutting.',
        hi: 'कटिंगपूर्वी रस्त्याचे स्पष्ट फोटो.',
        mr: 'कटिंगपूर्वी रस्त्याचे स्पष्ट फोटो.'
      },
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxSize: 10
    },
    {
      id: 'trafficPoliceNoc',
      label: { en: 'Traffic Police NOC (if applicable)', hi: 'ट्रॅफिक पोलीस NOC (लागू असल्यास)', mr: 'ट्रॅफिक पोलीस NOC (लागू असल्यास)' },
      description: { en: 'Upload if required for main road/heavy traffic.', hi: 'जर लागू असेल तर', mr: 'जर लागू असेल तर' },
      required: false, // conditionally required if trafficManagementRequired == 'yes'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'pwdNhaiNoc',
      label: { en: 'PWD/NHAI NOC (if applicable)', hi: 'PWD/NHAI NOC (लागू असल्यास)', mr: 'PWD/NHAI NOC (लागू असल्यास)' },
      description: { en: 'Upload if route includes highway/major road.', hi: 'जर लागू असेल तर', mr: 'जर लागू असेल तर' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    }
  ]
},


  // ------------------------------------------
  // MOBILE TOWER PERMISSION (7701)
  // ------------------------------------------
  // '8279': {
  //   serviceId: '8279',
  //   steps: [
  //     // STEP 1: ESTABLISHMENT / COMPANY DETAILS
  //    {
  //       id: "applicant-information",
  //       title: {
  //         en: "Applicant Information",
  //         hi: "आवेदक की जानकारी",
  //         mr: "आवेदकाची माहिती",
  //       },
  //       fields: createApplicantInformationFields(),
  //     },

  //     // STEP 2: LICENSE & BUSINESS INFO
  //     {
  //       id: 'license-info',
  //       title: { en: 'License & Business Info', hi: 'लाइसेंस और व्यवसाय जानकारी', mr: 'परवाना आणि व्यवसाय माहिती' },
  //       fields: [
  //         { id: 'licenseFromYear', type: 'text', label: { en: 'License From Year', hi: 'लाइसेंस वर्ष (से)', mr: 'परवाना वर्ष (पासून)' }, placeholder: {en: 'YYYY', hi: 'YYYY', mr: 'YYYY'}, required: true, colSpan: 1 },
  //         { id: 'licenseToYear', type: 'text', label: { en: 'License To Year', hi: 'लाइसेंस वर्ष (तक)', mr: 'परवाना वर्ष (पर्यंत)' }, placeholder: {en: 'YYYY', hi: 'YYYY', mr: 'YYYY'}, required: true, colSpan: 1 },
  //         { id: 'amount', type: 'number', label: { en: 'Amount (Rs)', hi: 'राशि', mr: 'रक्कम' }, required: true, colSpan: 1 },
  //         { id: 'natureOfBusiness', type: 'text', label: { en: 'Nature of Business', hi: 'व्यवसाय का प्रकार', mr: 'व्यवसायाचा प्रकार' }, required: true, colSpan: 1 },
          
  //         {
  //           id: 'isGoodsManufactured',
  //           type: 'select',
  //           label: { en: 'Is goods manufactured?', hi: 'क्या माल निर्मित है?', mr: 'वस्तू निर्मित आहे का' },
  //           required: true,
  //           colSpan: 1,
  //           options: [{ value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }, { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }]
  //         },
  //         { id: 'businessStartYear', type: 'number', label: { en: 'Year of Business Start', hi: 'व्यवसाय प्रारंभ वर्ष', mr: 'व्यवसाय सुरु केल्याचे वर्ष' }, required: true, colSpan: 1, validation: { min: 1900, max: 2100 } },
          
  //         { id: 'shopActNo', type: 'text', label: { en: 'Shop Act Registration No.', hi: 'शॉप एक्ट पंजीकरण संख्या', mr: 'शॉप ऍक्ट नोंदणी क्र.' }, required: true, colSpan: 1 },
  //         { id: 'fdaLicenseNo', type: 'text', label: { en: 'FDA Registration No.', hi: 'एफडीए पंजीकरण संख्या', mr: 'अन्न व औषध प्रशासन नोंदणी क्र.' }, required: false, colSpan: 1 },
  //       ]
  //     },

  //     // STEP 3: PREMISES & OWNERSHIP
  //     {
  //       id: 'premises-ownership',
  //       title: { en: 'Premises & Ownership', hi: 'परिसर और स्वामित्व', mr: 'जागा आणि मालकी' },
  //       fields: [
  //         {
  //           id: 'ownPremises',
  //           type: 'select',
  //           label: { en: 'Business on Own Premises?', hi: 'क्या व्यवसाय खुद की जगह पर है?', mr: 'स्वतःच्या मालकीच्या जागेत व्यवसाय करीत आहे का' },
  //           required: true,
  //           colSpan: 1,
  //           options: [{ value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }, { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }]
  //         },
  //         { id: 'ownerName', type: 'text', label: { en: 'Owner Name', hi: 'मालिक का नाम', mr: 'जागा मालकीचे नाव' }, required: true, colSpan: 1 },
  //         { id: 'ownerAddress', type: 'textarea', label: { en: 'Owner Address', hi: 'मालिक का पता', mr: 'जागा मालकाचा पत्ता' }, required: true, colSpan: 1 },
  //         { id: 'rentalAgreementWith', type: 'text', label: { en: 'Rental Agreement With', hi: 'किराया समझौता किसके साथ', mr: 'भाडे करार कोणासोबत केलेले आहे' }, required: false, colSpan: 1 },
          
  //         { id: 'premisesArea', type: 'number', label: { en: 'Area of premises (sq.ft.)', hi: 'परिसर का क्षेत्रफल (वर्ग फुट)', mr: 'वापरातील जागेचे क्षेत्र (चौ. फु.)' }, required: true, colSpan: 1 },
  //         {
  //           id: 'municipalNoc',
  //           type: 'select',
  //           label: { en: 'NOC from Municipal Corp?', hi: 'नगर निगम से एनओसी?', mr: 'म.न.पा. नाहरकत प्रमाणपत्र घेतले आहे का' },
  //           required: true,
  //           colSpan: 1,
  //           options: [{ value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }, { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }]
  //         },
  //       ]
  //     },

  //     // STEP 4: DIRECTOR / APPLICANT DETAILS (Split Name)
  //     {
  //       id: 'director-details',
  //       title: { en: 'Director/Applicant Details', hi: 'निदेशक/आवेदक विवरण', mr: 'संचालक/अर्जदाराचे तपशील' },
  //       fields: [
  //         // Split Name Fields as Requested
  //         { id: 'directorFirstName', type: 'text', label: { en: 'Director First Name', hi: 'निदेशक का प्रथम नाम', mr: 'संचालकाचे पहिले नाव' }, required: true, colSpan: 1 },
  //         { id: 'directorMiddleName', type: 'text', label: { en: 'Director Middle Name', hi: 'निदेशक का मध्य नाम', mr: 'संचालकाचे मधले नाव' }, required: true, colSpan: 1 },
  //         { id: 'directorLastName', type: 'text', label: { en: 'Director Last Name', hi: 'निदेशक का उपनाम', mr: 'संचालकाचे आडनाव' }, required: true, colSpan: 1 },

  //         { id: 'directorMobile', type: 'tel', label: { en: 'Director Mobile Number', hi: 'निदेशक मोबाइल नंबर', mr: 'संचालकांचा संपर्क क्रमांक' }, required: true, colSpan: 1, validation: { pattern: '^[0-9]{10}$', maxLength: 10 } },
  //         { id: 'directorEmail', type: 'email', label: { en: 'Director Email', hi: 'निदेशक ईमेल', mr: 'संचालकांचा ई-मेल' }, required: true, colSpan: 1 },
  //         { id: 'directorAadhar', type: 'text', label: { en: 'Director Aadhar Number', hi: 'निदेशक आधार संख्या', mr: 'संचालकांचा आधार क्रमांक' }, required: true, colSpan: 1, validation: { pattern: '^[0-9]{12}$', maxLength: 12 } },
          
  //         { id: 'directorAddress', type: 'textarea', label: { en: 'Director Address', hi: 'निदेशक का पता', mr: 'संचालकांचा पत्ता' }, required: true, colSpan: 1 },
          
  //         {
  //           id: 'directorGender',
  //           type: 'select',
  //           label: { en: 'Gender', hi: 'लिंग', mr: 'लिंग' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'Male', label: { en: 'Male', hi: 'पुरुष', mr: 'पुरुष' } },
  //             { value: 'Female', label: { en: 'Female', hi: 'महिला', mr: 'महिला' } },
  //             { value: 'Other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
  //           ]
  //         },
  //         {
  //           id: 'applicantType',
  //           type: 'select',
  //           label: { en: 'Applicant Type', hi: 'आवेदक का प्रकार', mr: 'अर्जदार प्रकार' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'Owner', label: { en: 'Owner', hi: 'मालिक', mr: 'मालक' } },
  //             { value: 'Partner', label: { en: 'Partner', hi: 'साझेदार', mr: 'भागीदार' } },
  //             { value: 'Director', label: { en: 'Director', hi: 'निदेशक', mr: 'संचालक' } }
  //           ]
  //         },
  //       ]
  //     },

  //     // STEP 5: DECLARATION
  //     {
  //     id: 'declaration',
  //     title: {
  //       en: 'Declaration',
  //       hi: 'घोषणा',
  //       mr: 'घोषणापत्र'
  //     },
  //     fields: [
  //       ...declarationField(),
  //     ]
  //   }
  //   ],

  //   // DOCUMENTS
  //   documents: [
  //     {
  //       id: 'directorPhoto',
  //       label: { en: 'Director Photo', hi: 'निदेशक की फोटो', mr: 'संचालकांचा फोटो' },
  //       description: { en: 'Passport size photo', hi: 'पासपोर्ट साइज फोटो', mr: 'पासपोर्ट आकाराचा फोटो' },
  //       required: true,
  //       acceptedFormats: ['.jpg', '.jpeg', '.png'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'shopInsidePhoto',
  //       label: { en: 'Interior Photos', hi: 'आंतरिक फोटो', mr: 'दुकानाचे/जागेचे आतील फोटो' },
  //       description: { en: 'Photo showing interior/equipment', hi: 'आंतरिक फोटो', mr: 'आतील बाजूचा फोटो' },
  //       required: true,
  //       acceptedFormats: ['.jpg', '.jpeg', '.png'],
  //       maxSize: 5
  //     },
  //     {
  //       id: 'shopOutsidePhoto',
  //       label: { en: 'Exterior Photos', hi: 'बाहरी फोटो', mr: 'दुकानाचे/जागेचे बाहेरील फोटो' },
  //       description: { en: 'Photo showing exterior/tower', hi: 'बाहरी फोटो', mr: 'बाहेरील बाजूचा फोटो' },
  //       required: true,
  //       acceptedFormats: ['.jpg', '.jpeg', '.png'],
  //       maxSize: 5
  //     },
  //     {
  //       id: 'fireNoc',
  //       label: { en: 'Fire NOC', hi: 'अग्निशमन एनओसी', mr: 'अग्निशमन नाहरकत प्रमाणपत्र' },
  //       description: { en: 'No Objection Certificate from Fire Dept', hi: 'फायर विभाग से एनओसी', mr: 'अग्निशमन विभागाकडून नाहरकत' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'shopActCopy',
  //       label: { en: 'Shop Act Copy', hi: 'शॉप एक्ट प्रति', mr: 'शॉप ऍक्ट प्रत' },
  //       description: { en: 'Registration Certificate', hi: 'पंजीकरण प्रमाण पत्र', mr: 'नोंदणी प्रमाणपत्र' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'fdaRegCopy',
  //       label: { en: 'FDA Registration Copy', hi: 'एफडीए पंजीकरण प्रति', mr: 'अन्न व औषध प्रशासन नोंदणी प्रत' },
  //       description: { en: 'If applicable', hi: 'यदि लागू हो', mr: 'लागू असल्यास' },
  //       required: false,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'directorPan',
  //       label: { en: 'Director PAN Card', hi: 'निदेशक पैन कार्ड', mr: 'संचालकांचे पॅन कार्ड' },
  //       description: { en: 'Original Copy', hi: 'मूल प्रति', mr: 'मुळ प्रत' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'directorAadhar',
  //       label: { en: 'Director Aadhar Card', hi: 'निदेशक आधार कार्ड', mr: 'संचालकांचे आधार कार्ड' },
  //       description: { en: 'Original Copy', hi: 'मूल प्रति', mr: 'मुळ प्रत' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'taxReceipt',
  //       label: { en: 'Current Year Tax Receipt', hi: 'वर्तमान वर्ष कर रसीद', mr: 'चालू वर्षाची कर पावती' },
  //       description: { en: 'Property Tax Receipt', hi: 'संपत्ति कर रसीद', mr: 'मालमत्ता कर पावती' },
  //       required: true,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'marketLicenseRenewal',
  //       label: { en: 'Market License (Renewal)', hi: 'बाजार लाइसेंस (नवीनीकरण)', mr: 'बाजार परवाना (नुतनीकरणावेळेस)' },
  //       description: { en: 'If renewing', hi: 'यदि नवीनीकरण हो रहा है', mr: 'जर नूतनीकरण असेल तर' },
  //       required: false,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 2
  //     },
  //     {
  //       id: 'otherDocs',
  //       label: { en: 'Other Documents', hi: 'अन्य दस्तावेज', mr: 'इतर कागदपत्रे' },
  //       description: { en: 'Rent Agreement, Partnership Deed, etc.', hi: 'किराया समझौता, आदि', mr: 'भाडे करार, भागीदारी करार इ.' },
  //       required: false,
  //       acceptedFormats: ['.pdf', '.jpg'],
  //       maxSize: 5
  //     }
  //   ]
  // },

'8279': {
  serviceId: '8279',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant / Company Details
    // ------------------------------------------------------
    {
      id: 'applicant-company-details',
      title: { en: 'Applicant / Company Details', hi: 'आवेदक / कंपनी विवरण', mr: 'अर्जदार / कंपनी माहिती' },
      fields: [
        {
          id: 'applicantType',
          type: 'select',
          label: { en: 'Applicant Type', hi: 'आवेदक प्रकार', mr: 'अर्जदाराचा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'telecom_operator', label: { en: 'Telecom Operator', hi: 'टेलिकॉम ऑपरेटर', mr: 'टेलिकॉम ऑपरेटर' } },
            { value: 'tower_infra', label: { en: 'Tower Infrastructure Company', hi: 'टॉवर इन्फ्रा कंपनी', mr: 'टॉवर इन्फ्रा कंपनी' } },
            { value: 'contractor', label: { en: 'Contractor', hi: 'कॉन्ट्रॅक्टर', mr: 'कॉन्ट्रॅक्टर' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'companyName',
          type: 'text',
          label: { en: 'Company / Organization Name', hi: 'कंपनी / संस्था नाव', mr: 'कंपनी / संस्था नाव' },
          placeholder: { en: 'Enter company name', hi: 'कंपनीचे नाव लिहा', mr: 'कंपनीचे नाव लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'authorizedSignatoryName',
          type: 'text',
          label: { en: 'Authorized Signatory Name', hi: 'अधिकृत स्वाक्षरीदाराचे नाव', mr: 'अधिकृत स्वाक्षरीदाराचे नाव' },
          placeholder: { en: 'Enter name', hi: 'नाव लिहा', mr: 'नाव लिहा' },
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
          label: { en: 'Email', hi: 'ईमेल', mr: 'ईमेल' },
          placeholder: { en: 'Enter email', hi: 'ईमेल लिहा', mr: 'ईमेल लिहा' },
          required: true,
          colSpan: 1
        },
        {
          id: 'officeAddress',
          type: 'textarea',
          label: { en: 'Office Address', hi: 'कार्यालयाचा पत्ता', mr: 'कार्यालयाचा पत्ता' },
          placeholder: { en: 'Full office address', hi: 'पूर्ण पत्ता', mr: 'पूर्ण पत्ता' },
          required: true,
          colSpan: 1
        },
        {
          id: 'dotLicenseOrRegNo',
          type: 'text',
          label: { en: 'DoT/License/Registration No (if any)', hi: 'DoT/लाइसेंस/रजिस्ट्रेशन नं (यदि हो)', mr: 'DoT/लायसन्स/नोंदणी क्र. (असल्यास)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { maxLength: 50 }
        },
        {
          id: 'gstNo',
          type: 'text',
          label: { en: 'GST No (optional)', hi: 'GST नं (वैकल्पिक)', mr: 'GST क्र. (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { maxLength: 20 }
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Site / Property Details (Auto-Fetch)
    // NOTE:
    // propertyNo select केल्यावर Ward/Zone/Owner/Address auto-fill (read-only)
    // ------------------------------------------------------
    {
      id: 'site-property-details',
      title: { en: 'Site / Property Details', hi: 'साइट / संपत्ति विवरण', mr: 'साईट / मालमत्ता तपशील' },
      fields: [
        {
          id: 'propertyNo',
          type: 'select',
          label: { en: 'Select Property No / UPIC', hi: 'प्रॉपर्टी नं / UPIC निवडा', mr: 'प्रॉपर्टी नं / UPIC निवडा' },
          required: true,
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
          label: { en: 'Property Address (Auto)', hi: 'संपत्ति पता (ऑटो)', mr: 'मालमत्ता पत्ता (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        },
        {
          id: 'siteType',
          type: 'select',
          label: { en: 'Site Type', hi: 'साइट प्रकार', mr: 'साईट प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'rooftop', label: { en: 'Rooftop (Terrace)', hi: 'रूफटॉप (टेरेस)', mr: 'रूफटॉप (टेरेस)' } },
            { value: 'ground_base', label: { en: 'Ground Base', hi: 'ग्राउंड बेस', mr: 'ग्राउंड बेस' } }
          ]
        },
        {
          id: 'buildingUse',
          type: 'select',
          label: { en: 'Building Use (optional)', hi: 'इमारत वापर (वैकल्पिक)', mr: 'इमारत वापर (ऐच्छिक)' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'residential', label: { en: 'Residential', hi: 'आवासीय', mr: 'निवासी' } },
            { value: 'commercial', label: { en: 'Commercial', hi: 'वाणिज्यिक', mr: 'व्यावसायिक' } },
            { value: 'mixed', label: { en: 'Mixed', hi: 'मिश्रित', mr: 'मिश्र' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'totalFloorsInBuilding',
          type: 'number',
          label: { en: 'Total Floors in Building (optional)', hi: 'इमारतीतील एकूण मजले (वैकल्पिक)', mr: 'इमारतीतील एकूण मजले (ऐच्छिक)' },
          placeholder: { en: 'e.g. 5', hi: 'उदा: 5', mr: 'उदा: 5' },
          required: false,
          colSpan: 1,
          validation: { min: 0 }
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: Tower / Equipment Details
    // NOTE:
    // If dgSetAvailable == 'yes' then dgCapacityKva should be required in UI.
    // ------------------------------------------------------
    {
      id: 'tower-equipment-details',
      title: { en: 'Tower / Equipment Details', hi: 'टॉवर / उपकरण विवरण', mr: 'टॉवर / उपकरण तपशील' },
      fields: [
        {
          id: 'towerType',
          type: 'select',
          label: { en: 'Tower Type', hi: 'टॉवर प्रकार', mr: 'टॉवर प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'rooftop_pole', label: { en: 'Rooftop Pole', hi: 'रूफटॉप पोल', mr: 'रूफटॉप पोल' } },
            { value: 'rooftop_tower', label: { en: 'Rooftop Tower', hi: 'रूफटॉप टॉवर', mr: 'रूफटॉप टॉवर' } },
            { value: 'ground_base_tower', label: { en: 'Ground Base Tower', hi: 'ग्राउंड बेस टॉवर', mr: 'ग्राउंड बेस टॉवर' } }
          ]
        },
        {
          id: 'towerHeightMeters',
          type: 'number',
          label: { en: 'Tower Height (meters)', hi: 'टॉवर उंची (मीटर)', mr: 'टॉवर उंची (मीटर)' },
          placeholder: { en: 'e.g. 15', hi: 'उदा: 15', mr: 'उदा: 15' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'antennaCount',
          type: 'number',
          label: { en: 'No. of Antennas', hi: 'अँटेना संख्या', mr: 'अँटेना संख्या' },
          placeholder: { en: 'e.g. 3', hi: 'उदा: 3', mr: 'उदा: 3' },
          required: true,
          colSpan: 1,
          validation: { min: 1 }
        },
        {
          id: 'dgSetAvailable',
          type: 'select',
          label: { en: 'DG Set Available?', hi: 'DG सेट आहे का?', mr: 'DG सेट आहे का?' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'dgCapacityKva',
          type: 'number',
          label: { en: 'DG Capacity (kVA)', hi: 'DG क्षमता (kVA)', mr: 'DG क्षमता (kVA)' },
          placeholder: { en: 'e.g. 15', hi: 'उदा: 15', mr: 'उदा: 15' },
          required: false, // conditionally required in UI if dgSetAvailable == 'yes'
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'equipmentRoomAvailable',
          type: 'select',
          label: { en: 'Equipment/Shelter Room?', hi: 'उपकरण/शेल्टर रूम?', mr: 'उपकरण/शेल्टर रूम?' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'proposedInstallationDate',
          type: 'date',
          label: { en: 'Proposed Installation Date (optional)', hi: 'प्रस्तावित इंस्टॉलेशन दिनांक (वैकल्पिक)', mr: 'प्रस्तावित इंस्टॉलेशन दिनांक (ऐच्छिक)' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Safety / Compliance Details
    // NOTE:
    // If nearSchoolHospital == 'yes' then schoolHospitalNoc document should be required in UI.
    // If sacfaClearanceAvailable == 'yes' then SACFA document required.
    // If fireNocApplicable == 'yes' then Fire NOC document required.
    // ------------------------------------------------------
    {
      id: 'safety-compliance',
      title: { en: 'Safety / Compliance', hi: 'सुरक्षा / अनुपालन', mr: 'सुरक्षा / अनुपालन' },
      fields: [
        {
          id: 'structuralSafetyCertificateAvailable',
          type: 'select',
          label: { en: 'Structural Safety Certificate Available?', hi: 'स्ट्रक्चरल सेफ्टी सर्टिफिकेट उपलब्ध?', mr: 'स्ट्रक्चरल सेफ्टी सर्टिफिकेट उपलब्ध आहे का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'fireNocApplicable',
          type: 'select',
          label: { en: 'Fire NOC Applicable?', hi: 'फायर NOC लागू है?', mr: 'फायर NOC लागू आहे का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'sacfaClearanceAvailable',
          type: 'select',
          label: { en: 'SACFA Clearance Available?', hi: 'SACFA क्लिअरन्स उपलब्ध?', mr: 'SACFA क्लिअरन्स उपलब्ध आहे का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'aaiNocApplicable',
          type: 'select',
          label: { en: 'AAI/Airport NOC Applicable?', hi: 'AAI/एअरपोर्ट NOC लागू है?', mr: 'AAI/एअरपोर्ट NOC लागू आहे का?' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'nearSchoolHospital',
          type: 'select',
          label: { en: 'Is there a School/Hospital within 100m?', hi: '100 मीटर में स्कूल/अस्पताल है?', mr: '100 मीटरमध्ये शाळा/रुग्णालय आहे का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'remarks',
          type: 'textarea',
          label: { en: 'Remarks (optional)', hi: 'टिप्पणी (वैकल्पिक)', mr: 'टिप्पणी (ऐच्छिक)' },
          placeholder: { en: 'Any additional info', hi: 'अतिरिक्त माहिती', mr: 'अतिरिक्त माहिती' },
          required: false,
          colSpan: 1
        }
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
      id: 'applicationForm',
      label: { en: 'Application Form', hi: 'आवेदन पत्र', mr: 'अर्ज फॉर्म' },
      description: { en: 'Prescribed application format (if applicable)', hi: 'निर्धारित फॉर्मेट (लागू असल्यास)', mr: 'निर्धारित फॉर्मेट (लागू असल्यास)' },
      required: false,
      acceptedFormats: ['.pdf'],
      maxSize: 10
    },
    {
      id: 'ownerSocietyNoc',
      label: { en: 'Owner/Society NOC', hi: 'मालक/सोसायटी NOC', mr: 'मालक/सोसायटी NOC' },
      description: { en: 'NOC from building/land owner or society', hi: 'मालक/सोसायटी कडून NOC', mr: 'मालक/सोसायटी कडून NOC' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'agreementWithOwner',
      label: { en: 'Agreement Copy with Owner', hi: 'मालकासोबत करार प्रत', mr: 'मालकासोबत करार प्रत' },
      description: { en: 'Agreement/MoU between company and owner', hi: 'कंपनी व मालकातील करार', mr: 'कंपनी व मालकातील करार' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 20
    },
    {
      id: 'towerDataSheet',
      label: { en: 'Tower Data Sheet', hi: 'टॉवर डेटा शीट', mr: 'टॉवर डेटा शीट' },
      description: { en: 'Technical datasheet of tower/antenna', hi: 'टॉवर/अँटेना टेक्निकल डेटा', mr: 'टॉवर/अँटेना टेक्निकल डेटा' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 15
    },
    {
      id: 'towerDrawingDesign',
      label: { en: 'Tower Drawing / Design Details', hi: 'टॉवर ड्रॉईंग / डिझाईन', mr: 'टॉवर ड्रॉईंग / डिझाईन' },
      description: { en: 'Layout/drawing/design details (signed)', hi: 'लेआउट/ड्रॉईंग (स्वाक्षरीत)', mr: 'लेआउट/ड्रॉईंग (स्वाक्षरीत)' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 25
    },
    {
      id: 'structuralStabilityCertificate',
      label: { en: 'Structural Stability Certificate', hi: 'स्ट्रक्चरल स्टॅबिलिटी सर्टिफिकेट', mr: 'स्ट्रक्चरल स्टॅबिलिटी सर्टिफिकेट' },
      description: { en: 'Certificate from structural engineer', hi: 'स्ट्रक्चरल इंजिनिअरचे प्रमाणपत्र', mr: 'स्ट्रक्चरल इंजिनिअरचे प्रमाणपत्र' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 15
    },
    {
      id: 'indemnityBond',
      label: { en: 'Indemnity Bond', hi: 'इंडेम्निटी बॉन्ड', mr: 'इंडेम्निटी बॉन्ड' },
      description: { en: 'Indemnity/undertaking on stamp paper (as applicable)', hi: 'स्टॅम्प पेपरवर हमीपत्र', mr: 'स्टॅम्प पेपरवर हमीपत्र' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 15
    },
    {
      id: 'insurancePolicy',
      label: { en: 'Insurance Policy', hi: 'इन्शुरन्स पॉलिसी', mr: 'इन्शुरन्स पॉलिसी' },
      description: { en: 'Policy covering structure/third-party (if applicable)', hi: 'स्ट्रक्चर/थर्ड पार्टी कव्हर', mr: 'स्ट्रक्चर/थर्ड पार्टी कव्हर' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 20
    },
    {
      id: 'undertakingSafety',
      label: { en: 'Undertaking for Safety', hi: 'सुरक्षा हमीपत्र', mr: 'सुरक्षेसाठी हमीपत्र' },
      description: { en: 'Undertaking for safety of nearby residents', hi: 'जवळच्या रहिवाशांच्या सुरक्षेसाठी हमीपत्र', mr: 'जवळच्या रहिवाशांच्या सुरक्षेसाठी हमीपत्र' },
      required: true,
      acceptedFormats: ['.pdf'],
      maxSize: 10
    },
    {
      id: 'publicNotice',
      label: { en: 'Public Notice (Newspaper)', hi: 'सार्वजनिक जाहिरात', mr: 'सार्वजनिक जाहिरात' },
      description: { en: 'Newspaper public notice copy (if required)', hi: 'वृत्तपत्र जाहिरातीची प्रत (लागू असल्यास)', mr: 'वृत्तपत्र जाहिरातीची प्रत (लागू असल्यास)' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'sacfaClearance',
      label: { en: 'SACFA Clearance (if applicable)', hi: 'SACFA क्लिअरन्स (लागू असल्यास)', mr: 'SACFA क्लिअरन्स (लागू असल्यास)' },
      description: { en: 'Upload SACFA clearance/application copy', hi: 'SACFA प्रत अपलोड करा', mr: 'SACFA प्रत अपलोड करा' },
      required: false, // conditionally required if sacfaClearanceAvailable == 'yes'
      acceptedFormats: ['.pdf'],
      maxSize: 10
    },
    {
      id: 'aaiNoc',
      label: { en: 'AAI/Airport NOC (if applicable)', hi: 'AAI/एअरपोर्ट NOC (लागू असल्यास)', mr: 'AAI/एअरपोर्ट NOC (लागू असल्यास)' },
      description: { en: 'Upload if applicable', hi: 'लागू असल्यास अपलोड करा', mr: 'लागू असल्यास अपलोड करा' },
      required: false, // conditionally required if aaiNocApplicable == 'yes'
      acceptedFormats: ['.pdf'],
      maxSize: 10
    },
    {
      id: 'fireNoc',
      label: { en: 'Fire NOC (if applicable)', hi: 'फायर NOC (लागू असल्यास)', mr: 'फायर NOC (लागू असल्यास)' },
      description: { en: 'Upload if Fire NOC is applicable', hi: 'लागू असल्यास अपलोड करा', mr: 'लागू असल्यास अपलोड करा' },
      required: false, // conditionally required if fireNocApplicable == 'yes'
      acceptedFormats: ['.pdf'],
      maxSize: 10
    },
    {
      id: 'schoolHospitalNoc',
      label: { en: 'School/Hospital NOC (if applicable)', hi: 'स्कूल/अस्पताल NOC (लागू असल्यास)', mr: 'शाळा/रुग्णालय NOC (लागू असल्यास)' },
      description: { en: 'Upload if within 100m and required', hi: '100m मध्ये असल्यास अपलोड करा', mr: '100m मध्ये असल्यास अपलोड करा' },
      required: false, // conditionally required if nearSchoolHospital == 'yes'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'authorizationLetter',
      label: { en: 'Authorization Letter (if signed by representative)', hi: 'प्राधिकरण पत्र (यदि प्रतिनिधि)', mr: 'अधिकृत पत्र (प्रतिनिधी असल्यास)' },
      description: { en: 'Upload if application signed by representative', hi: 'प्रतिनिधि साइन करे तो', mr: 'प्रतिनिधीने स्वाक्षरी केल्यास' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ]
},



  // Giving Part Map – 7208
// '7208'  : {
//   serviceId: '7208',
//   steps: [
//     // --------------------------------------------------
//     // 1. Applicant Information
//     // --------------------------------------------------
//  {
//         id: "applicant-information",
//         title: {
//           en: "Applicant Information",
//           hi: "आवेदक की जानकारी",
//           mr: "आवेदकाची माहिती",
//         },
//         fields: createApplicantInformationFields(),
//       },

//     // --------------------------------------------------
//     // 2. Property / Land Parcel Identification
//     // --------------------------------------------------
//     {
//       id: 'property-identification',
//       title: {
//         en: 'Property / Land Parcel Identification',
//         hi: 'संपत्ति / भूखंड पहचान',
//         mr: 'मालमत्ता / भूखंड ओळख'
//       },
//       description: {
//         en: 'Details of the land parcel for which Part Map is required',
//         hi: 'ज्या भूखंडासाठी भाग नकाशा आवश्यक आहे त्याचा तपशील',
//         mr: 'ज्या भूखंडासाठी भाग नकाशा आवश्यक आहे त्याचा तपशील'
//       },
//       fields: [
//         {
//           id: 'administrativeZoneNo',
//           type: 'select',
//           label: {
//             en: 'Zone',
//             hi: 'झोन',
//             mr: 'झोन'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: '1', label: { en: 'Zone 1', hi: 'झोन 1', mr: 'झोन 1' } },
//             { value: '2', label: { en: 'Zone 2', hi: 'झोन 2', mr: 'झोन 2' } },
//             { value: '3', label: { en: 'Zone 3', hi: 'झोन 3', mr: 'झोन 3' } },
//             { value: '4', label: { en: 'Zone 4', hi: 'झोन 4', mr: 'झोन 4' } },
//             { value: '5', label: { en: 'Zone 5', hi: 'झोन 5', mr: 'झोन 5' } }
//             // Adjust as per actual CSMC zones
//           ]
//         },
//         {
//           id: 'citySurveyNumber',
//           type: 'text',
//           label: {
//             en: 'City Survey Number',
//             hi: 'सिटी सर्व्हे नंबर',
//             mr: 'सिटी सर्व्हे नंबर'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'additionalSurveyDetails',
//           type: 'text',
//           label: {
//             en: 'Other Survey Details (CTS / Gut No. / etc.)',
//             hi: 'अन्य सर्वे तपशील (सीटीएस / गट नंबर / इ.)',
//             mr: 'इतर सर्व्हे तपशील (सीटीएस / गट क्र. / इ.)'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'propertyWardNo',
//           type: 'text',
//           label: {
//             en: 'Ward No.',
//             hi: 'वार्ड नंबर',
//             mr: 'प्रभाग क्र.'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'propertyLocality',
//           type: 'text',
//           label: {
//             en: 'Area / Locality',
//             hi: 'क्षेत्र / इलाका',
//             mr: 'क्षेत्र / परिसर'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'propertyLandmark',
//           type: 'text',
//           label: {
//             en: 'Nearest Landmark',
//             hi: 'जवळील महत्त्वाचा ठिकाण / लँडमार्क',
//             mr: 'जवळील महत्त्वाचा ठिकाण / लँडमार्क'
//           },
//           placeholder: {
//             en: 'Near...',
//             hi: 'के पास...',
//             mr: 'जवळ...'
//           },
//           required: false,
//           colSpan: 1
//         },
//         // Structured address for precise geo-location (useful in disasters)
//         ...createAddressFieldsWithCity('property')
//       ]
//     },

//     // --------------------------------------------------
//     // 3. Part Map Specific Details
//     // --------------------------------------------------
//     {
//       id: 'part-map-details',
//       title: {
//         en: 'Part Map Details',
//         hi: 'भाग नकाशा तपशील',
//         mr: 'भाग नकाशा तपशील'
//       },
//       description: {
//         en: 'Details of the portion of land for which Part Map is requested',
//         hi: 'ज्या जमिनीच्या भागासाठी भाग नकाशा मागितला आहे त्याचे तपशील',
//         mr: 'ज्या जमिनीच्या भागासाठी भाग नकाशा मागितला आहे त्याचे तपशील'
//       },
//       fields: [
//         {
//           id: 'totalPlotAreaSqm',
//           type: 'number',
//           label: {
//             en: 'Total Plot Area (sq. m)',
//             hi: 'एकूण प्लॉट क्षेत्रफळ (वर्ग मी.)',
//             mr: 'एकूण प्लॉट क्षेत्रफळ (वर्ग मी.)'
//           },
//           placeholder: {
//             en: 'As per revenue / city survey record',
//             hi: 'राजस्व / सिटी सर्व्हे नोंदीनुसार',
//             mr: 'राजस्व / सिटी सर्व्हे नोंदीनुसार'
//           },
//           required: true,
//           validation: {
//             min: 1
//           },
//           colSpan: 1
//         },
//         {
//           id: 'partAreaSqm',
//           type: 'number',
//           label: {
//             en: 'Area of Part for Which Map is Required (sq. m)',
//             hi: 'ज्या भागासाठी नकाशा हवा आहे त्या भागाचे क्षेत्रफळ (वर्ग मी.)',
//             mr: 'ज्या भागासाठी नकाशा हवा आहे त्या भागाचे क्षेत्रफळ (वर्ग मी.)'
//           },
//           required: true,
//           validation: {
//             min: 1
//           },
//           colSpan: 1
//         },
//         {
//           id: 'partMapPurpose',
//           type: 'select',
//           label: {
//             en: 'Purpose of Part Map',
//             hi: 'भाग नकाशा घेण्याचे कारण',
//             mr: 'भाग नकाशा घेण्याचे कारण'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'subdivision',  label: { en: 'Sub-division of land', hi: 'जमिनीची उपविभागणी', mr: 'जमिनीची उपविभागणी' } },
//             { value: 'sale',         label: { en: 'Sale of part land', hi: 'जमिनीचा काही भाग विक्री', mr: 'जमिनीचा काही भाग विक्री' } },
//             { value: 'gift',         label: { en: 'Gift / Donation', hi: 'भेट / देणगी', mr: 'भेट / देणगी' } },
//             { value: 'roadWidening', label: { en: 'Road widening / Reservation', hi: 'रस्ता रुंदीकरण / आरक्षण', mr: 'रस्ता रुंदीकरण / आरक्षण' } },
//             { value: 'lease',        label: { en: 'Lease / Rental', hi: 'लीज / भाडे', mr: 'लीज / भाडे' } },
//             { value: 'regularisation', label: { en: 'Regularisation / Correction', hi: 'नियमितीकरण / दुरुस्ती', mr: 'नियमितीकरण / दुरुस्ती' } },
//             { value: 'other',        label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
//           ]
//         },
//         {
//           id: 'accessImpact',
//           type: 'select',
//           label: {
//             en: 'Will the Part Map affect access to any house/plot/road?',
//             hi: 'भाग नकाशामुळे कोणत्याही घर/प्लॉट/रस्त्याचा प्रवेश प्रभावित होईल का?',
//             mr: 'भाग नकाशामुळे कोणत्याही घर/प्लॉट/रस्त्याचा प्रवेश प्रभावित होईल का?'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: 'no',  label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
//             { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
//           ]
//         },
//         {
//           id: 'accessImpactDetails',
//           type: 'textarea',
//           label: {
//             en: 'If Yes, give details of affected access / right of way',
//             hi: 'होय असल्यास, प्रभावित प्रवेश / राईट ऑफ वे याचा तपशील द्या',
//             mr: 'होय असल्यास, प्रभावित प्रवेश / राईट ऑफ वे याचा तपशील द्या'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'nearestMainRoadName',
//           type: 'text',
//           label: {
//             en: 'Nearest Major Road Name',
//             hi: 'जवळील मुख्य रस्त्याचे नाव',
//             mr: 'जवळील मुख्य रस्त्याचे नाव'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'partMapRemarks',
//           type: 'textarea',
//           label: {
//             en: 'Any Other Information / Remarks',
//             hi: 'इतर कोणतीही माहिती / टिपण्णी',
//             mr: 'इतर कोणतीही माहिती / टिपण्णी'
//           },
//           required: false,
//           colSpan: 1
//         }
//       ]
//     },

//     // --------------------------------------------------
//     // 5. Applicant Declaration
//     // --------------------------------------------------
//     {
//       id: 'declaration',
//       title: {
//         en: 'Declaration',
//         hi: 'घोषणा',
//         mr: 'घोषणापत्र'
//       },
//       fields: [
//         ...declarationField(),
//       ]
//     },

//     // --------------------------------------------------
//     // 6. Town Planning Office Use Only
//     // --------------------------------------------------
//     {
//       id: 'planning-office-use',
//       title: {
//         en: 'Town Planning Department – Office Use Only',
//         hi: 'टाउन प्लानिंग विभाग – केवल कार्यालय उपयोग हेतु',
//         mr: 'टाउन प्लॅनिंग विभाग – केवळ कार्यालयीन वापरासाठी'
//       },
//       description: {
//         en: 'To be filled by Town Planning / City Planning office',
//         hi: 'टाउन प्लानिंग / सिटी प्लानिंग कार्यालय द्वारा भरा जाना है',
//         mr: 'टाउन प्लॅनिंग / सिटी प्लॅनिंग कार्यालयाने भरावयाचा'
//       },
//       fields: [
//         {
//           id: 'tpInwardNo',
//           type: 'text',
//           label: {
//             en: 'TP Inward No.',
//             hi: 'टीपी इनवर्ड नंबर',
//             mr: 'टीपी इनवर्ड क्रमांक'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'tpInwardDate',
//           type: 'date',
//           label: {
//             en: 'TP Inward Date',
//             hi: 'टीपी इनवर्ड दिनांक',
//             mr: 'टीपी इनवर्ड दिनांक'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'zoneAsPerDPFinal',
//           type: 'select',
//           label: {
//             en: 'Zone as per DP / RP (Final)',
//             hi: 'डीपी / आरपी अनुसार झोन (अंतिम)',
//             mr: 'डीपी / आरपी नुसार झोन (अंतिम)'
//           },
//           required: false,
//           colSpan: 1,
//           options: [
//             { value: 'residential',      label: { en: 'Residential', hi: 'आवासीय', mr: 'निवासी' } },
//             { value: 'commercial',       label: { en: 'Commercial', hi: 'वाणिज्यिक', mr: 'व्यावसायिक' } },
//             { value: 'industrial',       label: { en: 'Industrial', hi: 'औद्योगिक', mr: 'औद्योगिक' } },
//             { value: 'public-semi-public', label: { en: 'Public / Semi Public', hi: 'सार्वजनिक / अर्ध सार्वजनिक', mr: 'सार्वजनिक / अर्ध सार्वजनिक' } },
//             { value: 'green-agriculture', label: { en: 'Green / Agricultural', hi: 'हरित / कृषि', mr: 'हरित / कृषी' } },
//             { value: 'no-development',   label: { en: 'No Development Zone', hi: 'नो डेवलपमेंट झोन', mr: 'नो डेव्हलपमेंट झोन' } },
//             { value: 'transport-utility', label: { en: 'Transport / Utility', hi: 'परिवहन / उपयोगिता', mr: 'वाहतूक / उपयोगिता' } },
//             { value: 'mixed-use',        label: { en: 'Mixed Use Zone', hi: 'मिश्रित उपयोग झोन', mr: 'मिश्र वापर झोन' } },
//             { value: 'special',          label: { en: 'Special Zone', hi: 'विशेष झोन', mr: 'विशेष झोन' } }
//           ]
//         },
//         {
//           id: 'dpSheetAndBlock',
//           type: 'text',
//           label: {
//             en: 'DP Sheet / Block / Village Map Reference',
//             hi: 'डीपी शीट / ब्लॉक / गांव नकाशा संदर्भ',
//             mr: 'डीपी शीट / ब्लॉक / गाव नकाशा संदर्भ'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'planningOfficerRemarks',
//           type: 'textarea',
//           label: {
//             en: 'Planning Officer Remarks',
//             hi: 'प्लानिंग अधिकारी टिप्पणी',
//             mr: 'प्लॅनिंग अधिकाऱ्यांचे निरीक्षण'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'planningOfficerName',
//           type: 'text',
//           label: {
//             en: 'Planning Officer Name',
//             hi: 'प्लानिंग अधिकारी का नाम',
//             mr: 'प्लॅनिंग अधिकाऱ्याचे नाव'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'planningOfficerDesignation',
//           type: 'text',
//           label: {
//             en: 'Designation',
//             hi: 'पदनाम',
//             mr: 'पदनाम'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'planningOfficerSignDate',
//           type: 'date',
//           label: {
//             en: 'Date',
//             hi: 'दिनांक',
//             mr: 'दिनांक'
//           },
//           required: false,
//           colSpan: 1
//         }
//       ]
//     }
//   ],

//   // ----------------------------------------------------
//   // Document uploads (files) – corresponds to fields 8–10
//   // ----------------------------------------------------
//   documents: [
//     {
//       id: 'prescribedApplicationForm',
//       label: {
//         en: 'Application in Prescribed Format',
//         hi: 'विहित नमुन्यातील अर्ज',
//         mr: 'विहित नमुन्यातील अर्ज'
//       },
//       description: {
//         en: 'Duly filled and signed application in the prescribed format for Giving Part Map',
//         hi: 'भाग नकाशा देण्यासाठी विहित नमुन्यातील भरलेला व स्वाक्षरीत अर्ज',
//         mr: 'भाग नकाशा देण्यासाठी विहित नमुन्यातील भरलेला व स्वाक्षरीत अर्ज'
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10
//     },
//     {
//       id: 'revenueOrCitySurveyExtract',
//       label: {
//         en: '7/12 Utara or City Survey Extract',
//         hi: '7/12 उतारा किंवा सिटी सर्व्हे नकाशा उतारा',
//         mr: '7/12 उतारा किंवा सिटी सर्व्हे नकाशा उतारा'
//       },
//       description: {
//         en: 'Latest 7/12 Utara or City Survey extract showing ownership and area',
//         hi: 'मालकी व क्षेत्र दाखवणारा अद्ययावत 7/12 उतारा किंवा सिटी सर्व्हे उतारा',
//         mr: 'मालकी व क्षेत्र दाखवणारा अद्ययावत 7/12 उतारा किंवा सिटी सर्व्हे उतारा'
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10
//     },
//     {
//       id: 'measurementOrCitySurveyMap',
//       label: {
//         en: 'Measurement Map / City Survey Map',
//         hi: 'मोजणी नकाशा किंवा सिटी सर्व्हे नकाशा',
//         mr: 'मोजणी नकाशा किंवा सिटी सर्व्हे नकाशा'
//       },
//       description: {
//         en: 'Measured map / city survey map clearly showing the part to be demarcated',
//         hi: 'विभाग दाखवणारा स्पष्ट मोजणी नकाशा / सिटी सर्व्हे नकाशा',
//         mr: 'विभाग दाखवणारा स्पष्ट मोजणी नकाशा / सिटी सर्व्हे नकाशा'
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10
//     },
//     {
//       id: 'ownershipProof',
//       label: {
//         en: 'Ownership Proof',
//         hi: 'स्वामित्व प्रमाण',
//         mr: 'मालकी पुरावा'
//       },
//       description: {
//         en: 'Sale Deed / Property Card / Allotment Letter or other ownership document',
//         hi: 'विक्री विलेख / प्रॉपर्टी कार्ड / अलॉटमेंट पत्र किंवा इतर मालकी पुरावा',
//         mr: 'विक्री विलेख / प्रॉपर्टी कार्ड / अलॉटमेंट पत्र किंवा इतर मालकी पुरावा'
//       },
//       required: false,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 10
//     },
//     {
//       id: 'applicantIdProof',
//       label: {
//         en: "Applicant's ID Proof",
//         hi: 'आवेदक का ओळख पुरावा',
//         mr: 'अर्जदाराचा ओळख पुरावा'
//       },
//       description: {
//         en: 'Aadhaar / PAN / Voter ID of the applicant or authorised signatory',
//         hi: 'आवेदक / अधिकृत स्वाक्षरीदाराचा आधार / पॅन / मतदार ओळखपत्र',
//         mr: 'अर्जदार / अधिकृत स्वाक्षरीदाराचा आधार / पॅन / मतदार ओळखपत्र'
//       },
//       required: false,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
//       maxSize: 5
//     }
//   ]
// },

'7208': {
  serviceId: '7208',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Applicant Details
    // ------------------------------------------------------
    {
      id: 'applicant-details',
      title: { en: 'Applicant Details', hi: 'आवेदक का विवरण', mr: 'अर्जदाराची माहिती' },
      fields: [
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
          id: 'alternateMobileNo',
          type: 'text',
          label: { en: 'Alternate Mobile (optional)', hi: 'वैकल्पिक मोबाइल (वैकल्पिक)', mr: 'पर्यायी मोबाईल (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
          required: false,
          colSpan: 1,
          validation: { minLength: 10, maxLength: 10 }
        },
        {
          id: 'applicantAddress',
          type: 'textarea',
          label: { en: 'Residential Address', hi: 'आवासीय पता', mr: 'राहण्याचा पत्ता' },
          placeholder: { en: 'House no, area, city, PIN', hi: 'घर नं, क्षेत्र, शहर, पिन', mr: 'घर क्र, परिसर, शहर, पिन' },
          required: true,
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
            { value: 'dl', label: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', mr: 'ड्रायव्हिंग लायसन्स' } },
            { value: 'passport', label: { en: 'Passport', hi: 'पासपोर्ट', mr: 'पासपोर्ट' } }
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
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Ward / Zone & Property Details
    // NOTE:
    // 1) "प्रॉपर्टी नंबर निवडा" पहिल्या position ला ठेवला आहे.
    // 2) ओळख प्रकार (propertyIdType) काढला आहे.
    // 3) Property No select केल्यावर Ward/Zone/Owner/Address सर्व auto-fill (read-only) करा.
    // ------------------------------------------------------
    {
      id: 'property-search',
      title: { en: 'Ward / Zone & Property Details', hi: 'वार्ड / ज़ोन व संपत्ति विवरण', mr: 'वार्ड / झोन व मालमत्ता तपशील' },
      description: {
        en: 'Select property number and auto-fetch property details from municipal records.',
        hi: 'प्रॉपर्टी नंबर निवडा आणि नगरपालिकेच्या नोंदीतून माहिती ऑटो-फेच करा।',
        mr: 'प्रॉपर्टी नंबर निवडा आणि पालिकेच्या नोंदीतून माहिती ऑटो-फेच करा.'
      },
      fields: [
        // ✅ 1st position
        {
          id: 'propertyNo',
          type: 'select',
          label: { en: 'Select Property No / UPIC', hi: 'प्रॉपर्टी नं / UPIC निवडा', mr: 'प्रॉपर्टी नं / UPIC निवडा' },
          required: true,
          colSpan: 1,
          options: [] // populate dynamically from DB/API (searchable dropdown recommended)
        },

        // Auto-filled after propertyNo selection
        {
          id: 'wardId',
          type: 'select',
          label: { en: 'Ward (Auto)', hi: 'वार्ड (ऑटो)', mr: 'वार्ड (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [], // ward master (for showing label)
          disabled: true
        },
        {
          id: 'zoneId',
          type: 'select',
          label: { en: 'Zone (Auto)', hi: 'झोन (ऑटो)', mr: 'झोन (ऑटो)' },
          required: false,
          colSpan: 1,
          options: [], // zone master (for showing label)
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
          label: { en: 'Property Address (Auto)', hi: 'संपत्ति पता (ऑटो)', mr: 'मालमत्ता पत्ता (ऑटो)' },
          required: false,
          colSpan: 1,
          disabled: true
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: Part Map Request Details
    // ------------------------------------------------------
    {
      id: 'part-map-request',
      title: { en: 'Part Map Request', hi: 'भाग नकाशा विनंती', mr: 'भाग नकाशा विनंती' },
      fields: [
        {
          id: 'purpose',
          type: 'select',
          label: { en: 'Purpose', hi: 'उद्देश्य', mr: 'कशासाठी?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'sale', label: { en: 'Sale / Registry', hi: 'विक्री / नोंदणी', mr: 'विक्री / नोंदणी' } },
            { value: 'loan', label: { en: 'Bank Loan', hi: 'बँक कर्ज', mr: 'बँक कर्ज' } },
            { value: 'buildingPermission', label: { en: 'Building Permission', hi: 'बांधकाम परवानगी', mr: 'बांधकाम परवानगी' } },
            { value: 'legal', label: { en: 'Court / Legal', hi: 'न्यायालय / कायदेशीर', mr: 'न्यायालय / कायदेशीर' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'partMapType',
          type: 'select',
          label: { en: 'Part Map Type', hi: 'भाग नकाशा प्रकार', mr: 'भाग नकाशा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'dp', label: { en: 'City Development Map (DP)', hi: 'शहर विकास नकाशा (DP)', mr: 'शहर विकास नकाशा (DP)' } },
            { value: 'tps', label: { en: 'TP Scheme Map (TPS)', hi: 'टी.पी. स्कीम नकाशा (TPS)', mr: 'टी.पी. स्कीम नकाशा (TPS)' } },
            { value: 'rp', label: { en: 'Regional Map (RP)', hi: 'प्रादेशिक नकाशा (RP)', mr: 'प्रादेशिक नकाशा (RP)' } }
          ]
        },
        {
          id: 'applicantRelationship',
          type: 'select',
          label: { en: 'Relationship to Property', hi: 'मालमत्तेसोबत संबंध', mr: 'मालमत्तेशी संबंध' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'owner', label: { en: 'Owner', hi: 'मालक', mr: 'मालक' } },
            { value: 'poa', label: { en: 'POA Holder', hi: 'POA धारक', mr: 'मुखत्यार (POA)' } },
            { value: 'relative', label: { en: 'Relative', hi: 'नातेवाईक', mr: 'नातेवाईक' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 4: Declaration
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
      description: {
        en: 'Any one: Tax receipt / Property Card / 7/12 etc.',
        hi: 'कोई एक: कर पावती / प्रॉपर्टी कार्ड / 7/12',
        mr: 'कोणताही एक: कर पावती / मालमत्ता कार्ड / 7/12'
      },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'authorizationProof',
      label: { en: 'Authorization/POA (if not owner)', hi: 'प्राधिकरण/POA (यदि मालिक नहीं)', mr: 'अधिकृत पत्र/POA (मालक नसल्यास)' },
      description: { en: 'Upload if applicant is not owner', hi: 'यदि आवेदक मालिक नहीं है', mr: 'अर्जदार मालक नसेल तर' },
      required: false, // Make conditionally required in UI if applicantRelationship != 'owner'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ]
},



};






