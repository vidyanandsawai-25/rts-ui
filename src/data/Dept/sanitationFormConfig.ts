// @ts-nocheck
import { ServiceFormConfig , createApplicantInformationFields, createAddressFieldsWithCity,  declarationField } from "./formTypes";

export const sanitationFormConfigs: Record<string, ServiceFormConfig> = {
  // ------------------------------------------
  // MAINTAINING MANHOLES/SEWER COVERS (7240)
  // ------------------------------------------
  // '8255': {
  //   serviceId: '8255',
  //   steps: [
  //     // STEP 1: APPLICANT DETAILS
      
      
  //     {
  //       id: "applicant-information",
  //       title: {
  //         en: "Applicant Information",
  //         hi: "आवेदक की जानकारी",
  //         mr: "आवेदकाची माहिती",
  //       },
  //       fields: createApplicantInformationFields(),
  //     },

  //     // STEP 2: LOCATION OF ISSUE
  //     {
  //       id: 'location-details',
  //       title: { en: 'Location of Issue', hi: 'समस्या का स्थान', mr: 'समस्येचे ठिकाण' },
  //       description: { en: 'Please provide exact location of the manhole/sewer', hi: 'कृपया मैनहोल/सीवर का सटीक स्थान प्रदान करें', mr: 'कृपया मॅनहोल/गटरचे नेमके ठिकाण द्या' },
  //       fields: [
  //         {
  //           id: 'zoneId',
  //           type: 'select',
  //           label: { en: 'Zone', hi: 'ज़ोन', mr: 'झोन' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'East', label: { en: 'East Zone', hi: 'पूर्व ज़ोन', mr: 'पूर्व झोन' } },
  //             { value: 'West', label: { en: 'West Zone', hi: 'पश्चिम ज़ोन', mr: 'पश्चिम झोन' } },
  //             { value: 'North', label: { en: 'North Zone', hi: 'उत्तर ज़ोन', mr: 'उत्तर झोन' } },
  //             { value: 'South', label: { en: 'South Zone', hi: 'दक्षिण ज़ोन', mr: 'दक्षिण झोन' } }
  //           ]
  //         },
  //         { id: 'wardNo', type: 'text', label: { en: 'Ward Number', hi: 'वार्ड नंबर', mr: 'प्रभाग क्रमांक' }, required: true, colSpan: 1 },
  //         { id: 'areaName', type: 'text', label: { en: 'Area / Colony Name', hi: 'क्षेत्र / कॉलोनी का नाम', mr: 'परिसर / वसाहत नाव' }, required: true, colSpan: 1 },
  //         { id: 'streetName', type: 'text', label: { en: 'Street / Road Name', hi: 'सड़क / रास्ते का नाम', mr: 'रस्ता / रोडचे नाव' }, required: true, colSpan: 1 },
          
  //         { id: 'landmark', type: 'text', label: { en: 'Nearby Landmark', hi: 'निकटतम लैंडमार्क', mr: 'जवळील ओळखचिन्ह' }, required: true, colSpan: 1 },
  //         { id: 'locationDescription', type: 'textarea', label: { en: 'Specific Location Description', hi: 'विशिष्ट स्थान विवरण', mr: 'विशिष्ट स्थान वर्णन' }, placeholder: { en: 'E.g., In front of Gate No. 2', hi: 'उदा. गेट नंबर 2 के सामने', mr: 'उदा. गेट क्र. 2 च्या समोर' }, required: false, colSpan: 1 },
  //       ]
  //     },

  //     // STEP 3: COMPLAINT DETAILS
  //     {
  //       id: 'complaint-details',
  //       title: { en: 'Complaint Details', hi: 'शिकायत विवरण', mr: 'तक्रार तपशील' },
  //       fields: [
  //         {
  //           id: 'complaintType',
  //           type: 'select',
  //           label: { en: 'Nature of Complaint', hi: 'शिकायत का प्रकार', mr: 'तक्रारीचे स्वरूप' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'broken_cover', label: { en: 'Broken Manhole Cover', hi: 'टूटा हुआ मैनहोल ढक्कन', mr: 'तुटलेले मॅनहोल झाकण' } },
  //             { value: 'missing_cover', label: { en: 'Missing/Stolen Cover', hi: 'गायब/चोरी हुआ ढक्कन', mr: 'गहाळ/चोरीला गेलेले झाकण' } },
  //             { value: 'uneven_level', label: { en: 'Uneven Level (Risk)', hi: 'असमान स्तर (जोखिम)', mr: 'असमान पातळी (धोका)' } },
  //             { value: 'overflowing', label: { en: 'Overflowing Sewer', hi: 'बहता हुआ सीवर', mr: 'ओव्हरफ्लो होणारे गटर' } },
  //             { value: 'choked', label: { en: 'Blocked/Choked Line', hi: 'अवरुद्ध/चोक लाइन', mr: 'तुंबलेली लाईन' } }
  //           ]
  //         },
  //         {
  //           id: 'urgencyLevel',
  //           type: 'select',
  //           label: { en: 'Urgency Level', hi: 'तात्कालिकता स्तर', mr: 'तात्काळ पातळी' },
  //           required: true,
  //           colSpan: 1,
  //           options: [
  //             { value: 'Normal', label: { en: 'Normal', hi: 'सामान्य', mr: 'सामान्य' } },
  //             { value: 'High', label: { en: 'High (Risk of Accident)', hi: 'उच्च (दुर्घटना का जोखिम)', mr: 'उच्च (अपघाताचा धोका)' } },
  //             { value: 'Critical', label: { en: 'Critical (Road Blocked)', hi: 'गंभीर (सड़क अवरुद्ध)', mr: 'गंभीर (रस्ता अडवला)' } }
  //           ]
  //         },
  //         { id: 'complaintDescription', type: 'textarea', label: { en: 'Detailed Description', hi: 'विस्तृत विवरण', mr: 'तपशीलवार वर्णन' }, required: true, colSpan: 1 }
  //       ]
  //     },

  //     // STEP 4: DECLARATION
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
  //       id: 'sitePhoto',
  //       label: { en: 'Photo of Manhole/Site', hi: 'मैनहोल/स्थल की तस्वीर', mr: 'मॅनहोल/जागेचा फोटो' },
  //       description: { en: 'Upload a clear photo showing the damage/issue', hi: 'क्षति/समस्या दिखाने वाली स्पष्ट तस्वीर अपलोड करें', mr: 'नुकसान/समस्या दर्शविणारा स्पष्ट फोटो अपलोड करा' },
  //       required: true,
  //       acceptedFormats: ['.jpg', '.jpeg', '.png'],
  //       maxSize: 5
  //     },
  //     {
  //       id: 'applicantID',
  //       label: { en: 'Applicant ID Proof', hi: 'आवेदक पहचान प्रमाण', mr: 'अर्जदार ओळख पुरावा' },
  //       description: { en: 'Aadhaar Card / Voter ID', hi: 'आधार कार्ड / वोटर आईडी', mr: 'आधार कार्ड / मतदार ओळखपत्र' },
  //       required: false,
  //       acceptedFormats: ['.pdf', '.jpg', '.jpeg'],
  //       maxSize: 2
  //     }
  //   ]
  // },
'8255': {
  serviceId: '8255',

  steps: [
    // ------------------------------------------------------
    // STEP 1: Complainant Details
    // ------------------------------------------------------
    {
      id: 'complainant-details',
      title: { en: 'Complainant Details', hi: 'शिकायतकर्ता विवरण', mr: 'तक्रारदाराची माहिती' },
      fields: [
        {
          id: 'complainantFullName',
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
          id: 'complainantAddress',
          type: 'textarea',
          label: { en: 'Address (optional)', hi: 'पता (वैकल्पिक)', mr: 'पत्ता (ऐच्छिक)' },
          placeholder: { en: 'Optional address', hi: 'वैकल्पिक पत्ता', mr: 'ऐच्छिक पत्ता' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Location Details
    // ------------------------------------------------------
    {
      id: 'location-details',
      title: { en: 'Location Details', hi: 'लोकेशन विवरण', mr: 'लोकेशन तपशील' },
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
          label: { en: 'Area / Locality', hi: 'क्षेत्र / इलाका', mr: 'परिसर / भाग' },
          placeholder: { en: 'Enter area/locality', hi: 'क्षेत्र लिखें', mr: 'परिसर लिहा' },
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
          placeholder: { en: 'e.g. Near school/chowk', hi: 'उदा: शाळेजवळ/चौकाजवळ', mr: 'उदा: शाळेजवळ/चौकाजवळ' },
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
    // STEP 3: Issue Details
    // ------------------------------------------------------
    {
      id: 'issue-details',
      title: { en: 'Issue Details', hi: 'समस्या विवरण', mr: 'समस्या तपशील' },
      fields: [
        {
          id: 'coverType',
          type: 'select',
          label: { en: 'Cover Type', hi: 'कव्हर प्रकार', mr: 'कव्हर प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'manhole', label: { en: 'Manhole Cover', hi: 'मॅनहोल कव्हर', mr: 'मॅनहोल कव्हर' } },
            { value: 'sewer', label: { en: 'Sewer Cover', hi: 'सीवर कव्हर', mr: 'सीवर कव्हर' } },
            { value: 'storm_water', label: { en: 'Storm Water Cover', hi: 'स्टॉर्म वॉटर कव्हर', mr: 'स्टॉर्म वॉटर कव्हर' } }
          ]
        },
        {
          id: 'issueType',
          type: 'select',
          label: { en: 'Issue Type', hi: 'समस्या प्रकार', mr: 'समस्या प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'missing', label: { en: 'Cover Missing', hi: 'कव्हर गायब', mr: 'कव्हर गायब' } },
            { value: 'broken', label: { en: 'Cover Broken', hi: 'कव्हर तुटले', mr: 'कव्हर तुटले' } },
            { value: 'loose', label: { en: 'Cover Loose / Moving', hi: 'कव्हर सैल', mr: 'कव्हर सैल' } },
            { value: 'sunken', label: { en: 'Cover Sunken (Level mismatch)', hi: 'कव्हर खाली बसले', mr: 'कव्हर खाली बसले' } },
            { value: 'open', label: { en: 'Chamber Open', hi: 'चेंबर उघडे', mr: 'चेंबर उघडे' } },
            { value: 'noise', label: { en: 'Noise / Vibration', hi: 'आवाज/कंपन', mr: 'आवाज/कंपन' } },
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
            { value: 'high', label: { en: 'High (Accident risk)', hi: 'उच्च (अपघाताचा धोका)', mr: 'उच्च (अपघाताचा धोका)' } },
            { value: 'medium', label: { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम' } },
            { value: 'low', label: { en: 'Low', hi: 'कमी', mr: 'कमी' } }
          ]
        },
        {
          id: 'issueDescription',
          type: 'textarea',
          label: { en: 'Issue Description', hi: 'समस्या विवरण', mr: 'समस्येचे वर्णन' },
          placeholder: { en: 'Describe the issue in 1-2 lines', hi: '1-2 पंक्तियों में लिखें', mr: '1-2 ओळींमध्ये लिहा' },
          required: true,
          colSpan: 1
        },
      
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
      id: 'photoProof',
      label: { en: 'Photo of Issue', hi: 'समस्या का फोटो', mr: 'समस्येचा फोटो' },
      description: { en: 'Clear photo showing the manhole/sewer cover issue', hi: 'समस्या स्पष्ट दिसेल असा फोटो', mr: 'समस्या स्पष्ट दिसेल असा फोटो' },
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxSize: 10
    },
    {
      id: 'additionalPhoto',
      label: { en: 'Additional Photo (optional)', hi: 'अतिरिक्त फोटो (वैकल्पिक)', mr: 'अतिरिक्त फोटो (ऐच्छिक)' },
      description: { en: 'Upload if available', hi: 'उपलब्ध असल्यास अपलोड करा', mr: 'उपलब्ध असल्यास अपलोड करा' },
      required: false,
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxSize: 10
    }
  ]
},

  //providing drainage connection
// '7175': {
//   serviceId: '7175',
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
//       id: 'providing-drainage-connection-details',
//       title: {
//         en: 'Providing Drainage Connections Details',
//         hi: 'जल मल निकासी कनेक्शन प्रदान विवरण',
//         mr: 'जल मल निःसारण जोडणी देणे तपशील'
//       },
//       fields: [
        
//         {
//           id: 'zone',
//           type: 'select',
//           label: {
//             en: 'Zone',
//             hi: 'ज़ोन',
//             mr: 'क्षेत्र / झोन'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: '',      label: { en: 'Select Zone', hi: 'ज़ोन चुनें', mr: 'झोन निवडा' } },
//             { value: 'zone1', label: { en: 'Zone 1',      hi: 'ज़ोन 1',    mr: 'झोन 1' } },
//             { value: 'zone2', label: { en: 'Zone 2',      hi: 'ज़ोन 2',    mr: 'झोन 2' } },
//             { value: 'zone3', label: { en: 'Zone 3',      hi: 'ज़ोन 3',    mr: 'झोन 3' } }
//             // Replace with actual zone list
//           ]
//         },
        
        
//         {
//           id: 'propertyNumber',
//           type: 'text',
//           label: {
//             en: 'Property Number',
//             hi: 'संपत्ति क्रमांक',
//             mr: 'मालमत्ता क्रमांक'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'propertyUsage',
//           type: 'select',
//           label: {
//             en: 'Property Usage',
//             hi: 'संपत्ति उपयोग',
//             mr: 'मालमत्ता वापर'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: '',           label: { en: '--- Select ---', hi: '--- चुनें ---', mr: '--- निवडा ---' } },
//             { value: 'residential',label: { en: 'Residential',    hi: 'आवासीय',      mr: 'निवासी' } },
//             { value: 'commercial', label: { en: 'Commercial',     hi: 'व्यावसायिक',  mr: 'व्यावसायिक' } },
//             { value: 'industrial', label: { en: 'Industrial',     hi: 'औद्योगिक',    mr: 'औद्योगिक' } },
//             { value: 'other',      label: { en: 'Other',          hi: 'अन्य',        mr: 'इतर' } }
//           ]
//         },
//         {
//           id: 'connectionSizeInches',
//           type: 'text',
//           label: {
//             en: 'Connection Size (in Inches)',
//             hi: 'जोड़णी आकार (इंच में)',
//             mr: 'जोडणी आकार (इंच मध्ये)'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'constructionDate',
//           type: 'date',
//           label: {
//             en: 'Construction Date',
//             hi: 'निर्माण दिनांक',
//             mr: 'बांधकाम दिनांक'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'houseAssessmentDate',
//           type: 'date',
//           label: {
//             en: 'House / Flat Assessment Date',
//             hi: 'घर / फ्लैट कर मूल्यांकन दिनांक',
//             mr: 'घर / सदनिकेची कर आकारणी दिनांक'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'houseMapDate',
//           type: 'date',
//           label: {
//             en: 'House / Flat Map Date',
//             hi: 'घर / फ्लैट नकाशा दिनांक',
//             mr: 'घर / सदनिकेचा नकाशा दिनांक'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'currentWaterTaxAmount',
//           type: 'number',
//           label: {
//             en: 'Current Water Tax Amount',
//             hi: 'चालू पानी कर राशि',
//             mr: 'चालू पाणीपट्टी रक्कम'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'currentTaxPaidDate',
//           type: 'date',
//           label: {
//             en: 'Current Tax Paid Date',
//             hi: 'चालू कर भुगतान दिनांक',
//             mr: 'चालू कर रक्कम भरणा दिनांक'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'septicLichpitCount',
//           type: 'number',
//           label: {
//             en: 'Septic Lichpit Count',
//             hi: 'सेप्टिक लीचपिट की संख्या',
//             mr: 'सेप्टिक लीचपिट ची संख्या'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'isToiletAvailable',
//           type: 'select',
//           label: {
//             en: 'Is Toilet Available?',
//             hi: 'क्या शौचालय उपलब्ध है?',
//             mr: 'शौचालय उपलब्ध आहे का?'
//           },
//           required: true,
//           colSpan: 1,
//           options: [
//             { value: '',   label: { en: '--- Select ---', hi: '--- चुनें ---', mr: '--- निवडा ---' } },
//             { value: 'yes',label: { en: 'Yes',           hi: 'हाँ',          mr: 'होय' } },
//             { value: 'no', label: { en: 'No',            hi: 'नहीं',        mr: 'नाही' } }
//           ]
//         },
//         {
//           id: 'totalResidentialPeople',
//           type: 'number',
//           label: {
//             en: 'Total Residential People Count',
//             hi: 'कुल रहिवासी लोगों की संख्या',
//             mr: 'एकूण रहिवाशी लोकांची संख्या'
//           },
//           required: true,
//           colSpan: 1
//         },
//         {
//           id: 'totalRenterCount',
//           type: 'number',
//           label: {
//             en: 'Total Renter Count (if any)',
//             hi: 'कुल किरायेदारों की संख्या (यदि कोई हो)',
//             mr: 'भाडेकरू असल्यास त्यांची संख्या'
//           },
//           required: false,
//           colSpan: 1
//         },
//         {
//           id: 'connectionSizeFeet',
//           type: 'text',
//           label: {
//             en: 'Connection Size (in Feet)',
//             hi: 'जोड़णी आकार (फुट में)',
//             mr: 'जोडणी आकार (फुटा मध्ये)'
//           },
//           required: true,
//           colSpan: 1
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
//     }
//   ],
//   documents: [
//     {
//       id: 'applicationPrescribedFormat',
//       label: {
//         en: 'Upload Application in Prescribed Format',
//         hi: 'विहित नमूने में आवेदन अपलोड करें',
//         mr: 'विहित नमुन्यातील अर्ज अपलोड करा'
//       },
//       description: {
//         en: 'Upload the application in the prescribed format. Allowed formats: .pdf, .jpg, .jpeg, .bmp (max 5 MB).',
//         hi: 'विहित नमूने में आवेदन अपलोड करें। स्वीकार्य फॉर्मेट: .pdf, .jpg, .jpeg, .bmp (अधिकतम 5 MB)।',
//         mr: 'विहित नमुन्यातील अर्ज अपलोड करा. स्वीकार्य फॉर्मेट: .pdf, .jpg, .jpeg, .bmp (कमाल 5 MB).'
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
//       maxSize: 5
//     },
//     {
//       id: 'taxNoDuesCertificate',
//       label: {
//         en: 'Upload Tax No Dues Certificate',
//         hi: 'थकबाकी नसल्याचा कर दाखला अपलोड करा',
//         mr: 'थकबाकी नसल्याचा दाखला अपलोड करा'
//       },
//       description: {
//         en: 'Upload tax no dues certificate. Allowed formats: .pdf, .jpg, .jpeg, .bmp (max 5 MB).',
//         hi: 'थकबाकी न होने का कर प्रमाणपत्र अपलोड करें। स्वीकार्य फॉर्मेट: .pdf, .jpg, .jpeg, .bmp (अधिकतम 5 MB)।',
//         mr: 'थकबाकी नसल्याचा कर दाखला अपलोड करा. स्वीकार्य फॉर्मेट: .pdf, .jpg, .jpeg, .bmp (कमाल 5 MB).'
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
//       maxSize: 5
//     },
//     {
//       id: 'propertyOwnershipDocuments',
//       label: {
//         en: 'Upload Documents of Property Ownership',
//         hi: 'संपत्ति मालिकी के दस्तावेज अपलोड करें',
//         mr: 'जागा मालकीचे कागदपत्रे अपलोड करा'
//       },
//       description: {
//         en: 'Upload property ownership related documents. Allowed formats: .pdf, .jpg, .jpeg, .bmp (max 5 MB).',
//         hi: 'संपत्ति स्वामित्व से संबंधित दस्तावेज अपलोड करें। स्वीकार्य फॉर्मेट: .pdf, .jpg, .jpeg, .bmp (अधिकतम 5 MB)।',
//         mr: 'जागेच्या मालकीशी संबंधित कागदपत्रे अपलोड करा. स्वीकार्य फॉर्मेट: .pdf, .jpg, .jpeg, .bmp (कमाल 5 MB).'
//       },
//       required: true,
//       acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
//       maxSize: 5
//     }
//   ]
// },
'7175': {
  serviceId: '7175',

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
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 2: Property / Location (Property No -> Auto-Fetch)
    // NOTE:
    // 1) propertyNo select केल्यावर ward/zone/owner/address auto-fill (read-only)
    // 2) premisesOccupancyType == 'rented' => ownerNoc & rentAgreement docs should be REQUIRED in UI
    // ------------------------------------------------------
    {
      id: 'property-location',
      title: { en: 'Property / Location Details', hi: 'संपत्ति / स्थान विवरण', mr: 'मालमत्ता / लोकेशन तपशील' },
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
          id: 'premisesOccupancyType',
          type: 'select',
          label: { en: 'Premises Type', hi: 'स्थल प्रकार', mr: 'ठिकाणाचा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'owned', label: { en: 'Owned', hi: 'स्वामित्व', mr: 'स्वतःचे' } },
            { value: 'rented', label: { en: 'Rented', hi: 'किराये पर', mr: 'भाड्याने' } }
          ]
        }
      ]
    },

    // ------------------------------------------------------
    // STEP 3: Drainage / Sewer Connection Request (Citizen-friendly)
    // NOTE (Conditional UI Rules):
    // 1) connectionType == 'reconnection' => oldConnectionRefNo field can be shown (optional)
    // 2) roadCuttingRequired == 'yes' => roadCuttingDetails field can be shown (optional)
    // 3) useType == 'commercial' or 'mixed' => tradeLicenseNo field can be shown (optional)
    // ------------------------------------------------------
    {
      id: 'connection-request',
      title: { en: 'Drainage / Sewer Connection Request', hi: 'ड्रेनेज / सीवर कनेक्शन अनुरोध', mr: 'नवीन ड्रेनेज/सीवर कनेक्शन मागणी' },
      fields: [
        {
          id: 'connectionType',
          type: 'select',
          label: { en: 'Connection Type', hi: 'कनेक्शन प्रकार', mr: 'कशासाठी कनेक्शन हवं?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'new', label: { en: 'New Connection', hi: 'नया कनेक्शन', mr: 'पहिल्यांदा नवीन कनेक्शन' } },
            { value: 'reconnection', label: { en: 'Re-connection', hi: 'री-कनेक्शन', mr: 'जुनं बंद झालेलं कनेक्शन पुन्हा सुरू करायचं' } },
            { value: 'additional', label: { en: 'Additional Connection', hi: 'अतिरिक्त कनेक्शन', mr: 'आधी कनेक्शन आहे, अजून एक कनेक्शन हवं' } }
          ]
        },
        {
          id: 'useType',
          type: 'select',
          label: { en: 'Use Type', hi: 'उपयोग प्रकार', mr: 'हे कनेक्शन कुठल्या ठिकाणासाठी?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'residential', label: { en: 'Residential', hi: 'आवासीय', mr: 'घर / फ्लॅट' } },
            { value: 'commercial', label: { en: 'Commercial', hi: 'वाणिज्यिक', mr: 'दुकान / ऑफिस' } },
            { value: 'mixed', label: { en: 'Mixed', hi: 'मिश्रित', mr: 'घर + दुकान (दोन्ही)' } }
          ]
        },
        {
          id: 'noOfUnits',
          type: 'number',
          label: { en: 'No. of Units (optional)', hi: 'यूनिट संख्या (वैकल्पिक)', mr: 'फ्लॅट/दुकान किती आहेत? (ऐच्छिक)' },
          placeholder: { en: 'Optional', hi: 'वैकल्पिक', mr: 'उदा: 1, 2, 10 (माहित नसेल तर सोडा)' },
          required: false,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'existingArrangement',
          type: 'select',
          label: { en: 'Current Wastewater Arrangement', hi: 'वर्तमान व्यवस्था', mr: 'सध्या सांडपाणी कुठे सोडता?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'septic_tank', label: { en: 'Septic Tank', hi: 'सेप्टिक टँक', mr: 'सेप्टिक टँक मध्ये' } },
            { value: 'soak_pit', label: { en: 'Soak Pit', hi: 'सोख पिट', mr: 'सोख पिट मध्ये' } },
            { value: 'open_drain', label: { en: 'Open Drain', hi: 'खुली नाली', mr: 'उघड्या नालीत' } },
            { value: 'already_connected_issue', label: { en: 'Already Connected (Issue)', hi: 'आधीच कनेक्शन आहे (समस्या)', mr: 'आधीच कनेक्शन आहे पण त्रास आहे' } },
            { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
          ]
        },
        {
          id: 'approxDistanceToSewerLineMeters',
          type: 'number',
          label: {
            en: 'Approx. distance to nearest sewer line (meters) (optional)',
            hi: 'नजदीकी सीवर लाइन दूरी (मीटर) (वैकल्पिक)',
            mr: 'मुख्य सीवर लाईन किती लांब आहे? (मीटर, ऐच्छिक)'
          },
          placeholder: { en: 'If not sure, leave blank', hi: 'यदि पता न हो तो खाली छोड़ें', mr: 'माहित नसेल तर रिकामं ठेवा' },
          required: false,
          colSpan: 1,
          validation: { min: 0 }
        },
        {
          id: 'roadCuttingRequired',
          type: 'select',
          label: { en: 'Road Cutting Required?', hi: 'रस्ता खोदकाम लागेल का?', mr: 'पाईप टाकण्यासाठी रस्ता/फुटपाथ खोदावा लागेल का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } },
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } }
          ]
        },
        {
          id: 'roadCuttingDetails',
          type: 'textarea',
          label: { en: 'Road Cutting Details (optional)', hi: 'रस्ता कटिंग तपशील (वैकल्पिक)', mr: 'खोदकाम किती लांबीचं आहे? (ऐच्छिक)' },
          placeholder: { en: 'If yes, mention road/length etc.', hi: 'यदि हाँ, रोड/लंबाई लिखें', mr: 'उदा: मुख्य रस्ता 5 मी, फुटपाथ 10 मी' },
          required: false, // conditionally show/ask in UI if roadCuttingRequired == 'yes'
          colSpan: 1
        },
        {
          id: 'oldConnectionRefNo',
          type: 'text',
          label: { en: 'Old Connection Ref No (optional)', hi: 'पुराना कनेक्शन संदर्भ नं (वैकल्पिक)', mr: 'जुनं कनेक्शन क्रमांक (असल्यास)' },
          placeholder: { en: 'If reconnection', hi: 'री-कनेक्शन असल्यास', mr: 'फक्त “पुन्हा सुरू” कनेक्शन असल्यास' },
          required: false, // conditionally show/ask in UI if connectionType == 'reconnection'
          colSpan: 1,
          validation: { maxLength: 50 }
        },
        {
          id: 'tradeLicenseNo',
          type: 'text',
          label: { en: 'Trade License No (optional)', hi: 'ट्रेड लायसन्स नं (वैकल्पिक)', mr: 'दुकानाचा ट्रेड लायसन्स क्रमांक (असल्यास)' },
          placeholder: { en: 'If commercial/mixed use', hi: 'वाणिज्यिक असल्यास', mr: 'फक्त दुकान/ऑफिस असेल तर' },
          required: false, // conditionally show/ask in UI if useType == 'commercial' or 'mixed'
          colSpan: 1,
          validation: { maxLength: 50 }
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
      label: { en: 'Ownership / Premises Proof', hi: 'स्वामित्व / स्थल पुरावा', mr: 'मालकी / ठिकाण पुरावा' },
      description: { en: 'Property tax receipt / Property card / 7/12 etc.', hi: 'कर पावती / प्रॉपर्टी कार्ड / 7/12 इ.', mr: 'कर पावती / मालमत्ता कार्ड / 7/12 इ.' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'drainageSketch',
      label: { en: 'Drainage Layout / Sketch', hi: 'ड्रेनेज लेआउट / स्केच', mr: 'ड्रेनेज लेआउट / स्केच' },
      description: {
        en: 'Simple sketch showing pipe route from premises to nearest sewer line.',
        hi: 'पाइप रूट दर्शवणारा साधा स्केच.',
        mr: 'घर/दुकानातून मुख्य सीवर लाईनपर्यंत पाईपचा रूट दाखवणारा साधा स्केच.'
      },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 15
    },
    {
      id: 'noDuesCertificate',
      label: { en: 'No Dues Certificate (if applicable)', hi: 'नो ड्यूज प्रमाणपत्र (लागू असल्यास)', mr: 'नो ड्यूज प्रमाणपत्र (लागू असल्यास)' },
      description: { en: 'Upload if required by ULB.', hi: 'ULB ने मागितल्यास अपलोड करा.', mr: 'ULB ने मागितल्यास अपलोड करा.' },
      required: false, // set true if your ULB process mandates this
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'undertaking',
      label: { en: 'Undertaking', hi: 'हमीपत्र', mr: 'हमीपत्र' },
      description: { en: 'Standard undertaking for compliance.', hi: 'मानक हमीपत्र.', mr: 'मानक हमीपत्र.' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'rentAgreement',
      label: { en: 'Rent Agreement (if rented)', hi: 'किराया करार (यदि भाड्याने)', mr: 'भाडेकरार (भाड्याने असल्यास)' },
      description: { en: 'Upload if premises is rented.', hi: 'यदि भाड्याने असेल तर अपलोड करा.', mr: 'ठिकाण भाड्याने असल्यास अपलोड करा.' },
      required: false, // conditionally required in UI if premisesOccupancyType == 'rented'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'ownerNoc',
      label: { en: 'Owner NOC (if rented)', hi: 'मालक NOC (यदि भाड्याने)', mr: 'मालक NOC (भाड्याने असल्यास)' },
      description: { en: 'Upload if premises is rented.', hi: 'यदि भाड्याने असेल तर अपलोड करा.', mr: 'ठिकाण भाड्याने असल्यास अपलोड करा.' },
      required: false, // conditionally required in UI if premisesOccupancyType == 'rented'
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }

    // OPTIONAL (If your ULB requires road cutting permission upload)
    // {
    //   id: 'roadCuttingPermission',
    //   label: { en: 'Road Cutting Permission (if required)', hi: 'रस्ता कटिंग परवानगी (लागू असल्यास)', mr: 'रस्ता कटिंग परवानगी (लागू असल्यास)' },
    //   description: { en: 'Upload if road cutting is required/approved.', hi: 'लागू असल्यास अपलोड करा.', mr: 'लागू असल्यास अपलोड करा.' },
    //   required: false, // conditionally required in UI if roadCuttingRequired == 'yes'
    //   acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    //   maxSize: 10
    // }
  ]
},



  
};