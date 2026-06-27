// @ts-nocheck
import { ServiceFormConfig , createAddressFieldsWithCity , createApplicantInformationFields, declarationField } from "./formTypes";

export const nocFormConfigs: Record<string, ServiceFormConfig> = {

// Trade Business Non Revocation NOC Certificate - 7200
  '7200': {
  serviceId: '7200',
  steps: [
    {
        id: "applicant-information",
        title: {
          en: "Applicant Information",
          hi: "आवेदक की जानकारी",
          mr: "आवेदकाची माहिती",
        },
        fields: createApplicantInformationFields(),
      },
// ------------------------------------------------------
    //  STEP 2 – OWNER DETAILS
    // ------------------------------------------------------
    {
      id: 'owner-details',
      title: {
        en: 'Owner Details',
        hi: 'मालिक का विवरण',
        mr: 'मालकाचा तपशील'
      },
      fields: [

        {
          id: 'ownerFirstName',
          type: 'text',
          label: { en: 'Owner First Name', hi: 'मालिक का पहला नाम', mr: 'मालकाचे पहिले नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'ownerMiddleName',
          type: 'text',
          label: { en: 'Owner Middle Name', hi: 'मालिक का मध्यम नाम', mr: 'मालकाचे मधले नाव' },
          required: false,
          colSpan: 1
        },
        {
          id: 'ownerLastName',
          type: 'text',
          label: { en: 'Owner Last Name', hi: 'मालिक का अंतिम नाम', mr: 'मालकाचे आडनाव' },
          required: false,
          colSpan: 1
        },

        {
          id: 'ownerMobile',
          type: 'tel',
          label: { en: 'Owner Mobile Number', hi: 'मालिक का मोबाइल', mr: 'मालकाचा मोबाईल' },
          required: true,
          validation: { pattern: '^[0-9]{10}$', maxLength: 10 },
          colSpan: 1
        },

        {
          id: 'ownerEmail',
          type: 'email',
          label: { en: 'Owner Email', hi: 'मालिक का ईमेल', mr: 'मालकाचा ईमेल' },
          required: false,
          colSpan: 1
        },

        {
          id: 'ownerAadhar',
          type: 'text',
          label: { en: 'Owner Aadhar Number', hi: 'मालिक का आधार नंबर', mr: 'मालकाचा आधार क्रमांक' },
          required: true,
          validation: { pattern: '^[0-9]{12}$', maxLength: 12 },
          colSpan: 1
        },

        {
          id: 'panNumber',
          type: 'text',
          label: { en: 'Owner PAN Number', hi: 'मालिक का पैन नंबर', mr: 'मालकाचा पॅन क्रमांक' },
          required: false,
          validation: { pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', maxLength: 10 },
          colSpan: 1
        },

        ...createAddressFieldsWithCity('Owner')

      ]
    },

    // 2. BUSINESS / TRADE ACTIVITY & NEW BUSINESS PROPOSAL
    {
      id: 'business-activity',
      title: {
        en: 'Business Activity & Licensing Details',
        hi: 'व्यवसाय गतिविधि एवं लाइसेंस विवरण',
        mr: 'व्यवसाय क्रियाकलाप व परवाना तपशील'
      },
      fields: [
        {
          id: 'businessName',
          type: 'text',
          label: { en: 'Business / Trade Name', hi: 'व्यवसाय / व्यापार का नाम', mr: 'व्यवसाय / व्यापाराचे नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'workers',
          type: 'number',
          label: { en: 'Number of Employees', hi: 'कर्मचारियों की संख्या', mr: 'कामगारांची संख्या' },
          required: true,
          colSpan: 1
        },
         {
          id: 'propertyTaxNo',
          type: 'text',
          label: {
            en: 'Property Tax Assessment Number',
            hi: 'मालमत्ता कर आकडेवारी क्रमांक',
            mr: 'मालमत्ता कर मूल्यांकन क्र.'
          },
          required: true,
          colSpan: 1
        },
        {
          id: 'propertyTaxReceiptNo',
          type: 'text',
          label: {
            en: 'Property Tax Receipt Number',
            hi: 'मालमत्ता कर पावती क्रमांक',
            mr: 'मालमत्ता कर पावती क्रमांक'
          },
          required: true,
          colSpan: 1
        },
        {
          id: 'businessAddress',
          type: 'textarea',
          label: { en: 'Business Address', hi: 'सामान का प्रकृति', mr: 'मालाचा प्रकार' },
          required: true,
          colSpan: 1
        },
        {
          id: 'activityType',
          type: 'select',
          label: { en: 'Type of Activity', hi: 'गतिविधि का प्रकार', mr: 'क्रियाकलाप प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'food', label: { en: 'Food', hi: 'खाद्य', mr: 'अन्न' } },
            { value: 'chemical', label: { en: 'Chemical', hi: 'रासायनिक', mr: 'रासायनिक' } },
            { value: 'retail', label: { en: 'Retail', hi: 'खुदरा', mr: 'किरकोळ' } },
            { value: 'industrial', label: { en: 'Industrial', hi: 'औद्योगिक', mr: 'औद्योगिक' } }
          ]
        },
        {
          id: 'licenseCategory',
          type: 'select',
          label: { en: 'Licensing Category', hi: 'लाइसेंस श्रेणी', mr: 'परवाना श्रेणी' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'general', label: { en: 'General', hi: 'सामान्य', mr: 'सामान्य' } },
            { value: 'special', label: { en: 'Special', hi: 'विशेष', mr: 'विशेष' } },
            { value: 'hazardous', label: { en: 'Hazardous', hi: 'जोखिमयुक्त', mr: 'जोखीमयुक्त' } }
          ]
        },
        {
          id: 'specialCategory',
          type: 'text',
          label: {
            en: 'Specify License Category (if Special)',
            hi: 'मालमत्ता कर पावती क्रमांक',
            mr: 'मालमत्ता कर पावती क्रमांक'
          },
          required: true,
          colSpan: 1
        },
        {
          id: 'newBusinessProposal',
          type: 'select',
          label: { en: 'New Business Proposal?', hi: 'नया व्यवसाय प्रस्ताव?', mr: 'नवीन व्यवसाय प्रस्ताव?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        
        {
          id: 'workingHours',
          type: 'text',
          label: { en: 'Working Hours', hi: 'कार्य समय', mr: 'कामकाजाची वेळ' },
          required: true,
          colSpan: 1
        },
        {
          id: 'fssaiLicense',
          type: 'text',
          label: {
            en: 'FSSAI License No. (For Food Trade)',
            hi: 'एफएसएसएआई लाइसेंस (खाद्य व्यवसाय)',
            mr: 'FSSAI परवाना क्र. (अन्न व्यवसाय)'
          },
          required: false,
          colSpan: 1
        }
      ]
    },

    // 3. STORAGE, FIRE SAFETY & HAZARD DETAILS
    {
      id: 'storage-safety',
      title: {
        en: 'Storage, Safety & Hazard Details',
        hi: 'भंडारण, सुरक्षा एवं जोखिम विवरण',
        mr: 'साठवण, सुरक्षा व जोखीम तपशील'
      },
      fields: [
        {
  id: 'natureOfGoods',
  type: 'select',
  label: {
    en: 'Nature of Goods Stored / Traded',
    hi: 'सामान का प्रकार',
    mr: 'मालाचा प्रकार'
  },
  required: true,
  colSpan: 1,
  options: [
    {
      value: 'food_grains',
      label: { en: 'Food Grains', hi: 'अनाज', mr: 'धान्य' }
    },
    {
      value: 'perishable_goods',
      label: { en: 'Perishable Goods', hi: 'नाशवंत वस्तू', mr: 'नाशवंत माल' }
    },
    {
      value: 'non_perishable_goods',
      label: { en: 'Non-Perishable Goods', hi: 'अविनाशी वस्तू', mr: 'अविनाशी माल' }
    },
    {
      value: 'textiles',
      label: { en: 'Textiles / Cloth', hi: 'कपड़ा', mr: 'कापड' }
    },
    {
      value: 'electronics',
      label: { en: 'Electronics', hi: 'इलेक्ट्रॉनिक्स', mr: 'इलेक्ट्रॉनिक्स' }
    },
    {
      value: 'machinery',
      label: { en: 'Machinery / Equipment', hi: 'यंत्रसामग्री', mr: 'यंत्रसामग्री' }
    },
    {
      value: 'chemicals',
      label: { en: 'Chemicals', hi: 'रसायने', mr: 'रसायने' }
    },
    {
      value: 'construction_material',
      label: { en: 'Construction Material', hi: 'बांधकाम साहित्य', mr: 'बांधकाम साहित्य' }
    },
    {
      value: 'fertilizers',
      label: { en: 'Fertilizers', hi: 'खते', mr: 'खते' }
    },
    {
      value: 'hazardous_goods',
      label: { en: 'Hazardous Goods', hi: 'धोकादायक वस्तू', mr: 'धोकादायक माल' }
    },
    {
      value: 'mixed_goods',
      label: { en: 'Mixed / Multiple Goods', hi: 'मिश्रित माल', mr: 'मिश्र माल' }
    },
    {
      value: 'others',
      label: { en: 'Others', hi: 'इतर', mr: 'इतर' }
    }
  ]
},

        {
          id: 'flammableGoods',
          type: 'select',
          label: { en: 'Flammable/Explosive Goods?', hi: 'ज्वलनशील / विस्फोटक सामग्री?', mr: 'ज्वलनशील / विस्फोटक साहित्य?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'flammableGoodsDetail',
          type: 'textarea',
          label: { en: 'Flammable Material Details', hi: 'ज्वलनशील सामग्री विवरण', mr: 'ज्वलनशील साहित्य तपशील' },
          required: false,
          colSpan: 1
        }
      ]
    },

    // 4. COMPLIANCE, APPROVALS & DOCUMENTS
    {
      id: 'compliance-approvals',
      title: {
        en: 'Compliance & Approval Details',
        hi: 'अनुपालन एवं स्वीकृति विवरण',
        mr: 'अनुपालन व मंजुरी तपशील'
      },
      fields: [
        {
          id: 'fireNocUpdated',
          type: 'select',
          label: { en: 'Fire NOC Up-to-date?', hi: 'अग्नि एनओसी अद्यतन?', mr: 'अग्नि एनओसी अद्ययावत?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'policeNocSubmitted',
          type: 'select',
          label: { en: 'Police NOC Submitted?', hi: 'पुलिस अनापत्ति प्रस्तुत?', mr: 'पोलीस अनापत्ती सादर?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        }
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

  // DOCUMENTS

  documents: [
    {
      id: 'ownershipProofDoc',
      label: { en: 'Ownership / Rent Agreement', hi: 'स्वामित्व / किराया अनुबंध', mr: 'मालकी / भाडे करार' },
      description: { en: 'Ownership or tenancy proof', hi: 'स्वामित्व या किरायेदारी प्रमाण', mr: 'मालकी किंवा भाडे पुरावा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'propertyTaxReceiptDoc',
      label: { en: 'Latest Property Tax Receipt', hi: 'नवीनतम मालमत्ता कर पावती', mr: 'नवीनतम मालमत्ता कर पावती' },
      description: { en: 'Recent paid tax receipt', hi: 'ताजा कर पावती', mr: 'नवीनतम कर पावती' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
          id: 'proposedPlan',
          label: { en: 'Proposed Plan (Architect Signed)', hi: 'प्रस्तावित नक्शा (आर्किटेक्ट हस्ताक्षर)', mr: 'प्रस्तावित नकाशा (आर्किटेक्ट स्वाक्षरी)' },
          description: {
            en: 'Architect-signed proposed layout plan for new business establishments',
            hi: 'नए व्यवसाय हेतु आर्किटेक्ट द्वारा हस्ताक्षरित प्रस्तावित नक्शा',
            mr: 'नवीन व्यवसायासाठी आर्किटेक्ट स्वाक्षरी केलेला प्रस्तावित नकाशा'
          },
          required: true,
          acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
          maxSize: 10
        },
    {
      id: 'fireNoc',
      label: { en: 'Fire NOC Certificate', hi: 'अग्नि एनओसी प्रमाणपत्र', mr: 'अग्नि एनओसी प्रमाणपत्र' },
      description: { en: 'Valid fire NOC', hi: 'वैध अग्नि एनओसी', mr: 'वैध अग्नि एनओसी' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'policeNoc',
      label: { en: 'Police No-Objection Certificate', hi: 'पुलिस अनापत्ति प्रमाणपत्र', mr: 'पोलीस अनापत्ती प्रमाणपत्र' },
      description: { en: 'Police NOC for restricted trades', hi: 'प्रतिबंधित व्यापार हेतु पुलिस प्रमाणपत्र', mr: 'प्रतिबंधित व्यवसायासाठी पोलिस प्रमाणपत्र' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'ownerIdProofDoc',
      label: { en: 'Owner ID Proof', hi: 'मालिक का पहचान प्रमाण', mr: 'मालकाचा ओळख पुरावा' },
      description: { en: 'Valid ID proof of business owner', hi: 'व्यवसाय मालिक का वैध पहचान पत्र', mr: 'व्यवसाय मालकाचा वैध ओळखपत्र' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    }
  ]
},


// Mandap No-Damage Certificate - 7201
'7201': {
  serviceId: '7201',
  steps: [
    // 1. APPLICANT, OWNER & EVENT DETAILS
    {
        id: "applicant-information",
        title: {
          en: "Applicant Information",
          hi: "आवेदक की जानकारी",
          mr: "आवेदकाची माहिती",
        },
        fields: createApplicantInformationFields(),
      },
// ------------------------------------------------------
    //  STEP 2 – OWNER DETAILS
    // ------------------------------------------------------
    {
      id: 'owner-details',
      title: {
        en: 'Owner Details',
        hi: 'मालिक का विवरण',
        mr: 'मालकाचा तपशील'
      },
      fields: [

        {
          id: 'ownerFirstName',
          type: 'text',
          label: { en: 'Owner First Name', hi: 'मालिक का पहला नाम', mr: 'मालकाचे पहिले नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'ownerMiddleName',
          type: 'text',
          label: { en: 'Owner Middle Name', hi: 'मालिक का मध्यम नाम', mr: 'मालकाचे मधले नाव' },
          required: false,
          colSpan: 1
        },
        {
          id: 'ownerLastName',
          type: 'text',
          label: { en: 'Owner Last Name', hi: 'मालिक का अंतिम नाम', mr: 'मालकाचे आडनाव' },
          required: false,
          colSpan: 1
        },

        {
          id: 'ownerMobile',
          type: 'tel',
          label: { en: 'Owner Mobile Number', hi: 'मालिक का मोबाइल', mr: 'मालकाचा मोबाईल' },
          required: true,
          validation: { pattern: '^[0-9]{10}$', maxLength: 10 },
          colSpan: 1
        },

        {
          id: 'ownerEmail',
          type: 'email',
          label: { en: 'Owner Email', hi: 'मालिक का ईमेल', mr: 'मालकाचा ईमेल' },
          required: false,
          colSpan: 1
        },

        {
          id: 'ownerAadhar',
          type: 'text',
          label: { en: 'Owner Aadhar Number', hi: 'मालिक का आधार नंबर', mr: 'मालकाचा आधार क्रमांक' },
          required: true,
          validation: { pattern: '^[0-9]{12}$', maxLength: 12 },
          colSpan: 1
        },

        {
          id: 'panNumber',
          type: 'text',
          label: { en: 'Owner PAN Number', hi: 'मालिक का पैन नंबर', mr: 'मालकाचा पॅन क्रमांक' },
          required: false,
          validation: { pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', maxLength: 10 },
          colSpan: 1
        },

        ...createAddressFieldsWithCity('Owner')

      ]
    },

 
    {
        id: 'event-dates',
        title: { en: 'Event & Permission Info', hi: 'कार्यक्रम और अनुमति जानकारी', mr: 'कार्यक्रम आणि परवानगी माहिती' },
        fields: [
          { id: 'mandalName', type: 'text', label: { en: 'Mandal Name (Reg. Charity Comm.)', hi: 'मंडल का नाम (धर्मादाय आयुक्त)', mr: 'मंडळाचे मा. धर्मादाय आयुक्तांकडील नोंदवलेले नाव' }, required: false, colSpan: 1 },
          { id: 'registrationNo', type: 'text', label: { en: 'Registration Number', hi: 'पंजीकरण संख्या', mr: 'मंडळाचा नोंदणी क्रमांक' }, required: false, colSpan: 1 },
          { id: 'registrationYear', type: 'number', label: { en: 'Registration Year', hi: 'पंजीकरण वर्ष', mr: 'नोंदणी वर्ष' }, required: false, colSpan: 1, validation: { min: 1900, max: 2100 } },
          { id: 'chairmanName', type: 'text', label: { en: 'Name of Chairman/Secretary', hi: 'अध्यक्ष / सचिव का नाम', mr: 'अध्यक्ष / सचिव यांचे नाव' }, required: false, colSpan: 1 },
          { id: 'contactNo', type: 'tel', label: { en: 'Contact No. (President/Secretary)', hi: 'संपर्क क्रमांक', mr: 'अध्यक्ष / सचिव संपर्क क्रमांक' }, required: false, colSpan: 1, validation: { pattern: '^[0-9]{10}$', maxLength: 10 } },
          {
          id: 'eventType',
          type: 'select',
          label: { en: 'Type of Event', hi: 'कार्यक्रम का प्रकार', mr: 'कार्यक्रमाचा प्रकार' },
          required: true, colSpan: 1,
          options: [
            { value: 'marriage', label: { en: 'Marriage', hi: 'विवाह', mr: 'लग्न' } },
            { value: 'festival', label: { en: 'Festival', hi: 'त्योहार', mr: 'सण' } },
            { value: 'cultural', label: { en: 'Cultural Program', hi: 'सांस्कृतिक कार्यक्रम', mr: 'सांस्कृतिक कार्यक्रम' } },
            { value: 'political', label: { en: 'Political Rally', hi: 'राजनीतिक सभा', mr: 'राजकीय सभा' } },
            { value: 'exhibition', label: { en: 'Exhibition', hi: 'प्रदर्शनी', mr: 'प्रदर्शनी' } },
            { value: 'commercial', label: { en: 'Commercial Event', hi: 'व्यावसायिक कार्यक्रम', mr: 'व्यावसायिक कार्यक्रम' } }
          ]
        },
        {
          id: 'eventStartDate',
          type: 'date',
          label: { en: 'Event Start Date', hi: 'कार्यक्रम प्रारंभ तिथि', mr: 'कार्यक्रम सुरूवात तारीख' },
          required: true, colSpan: 1
        },
        {
          id: 'eventEndDate',
          type: 'date',
          label: { en: 'Event End Date', hi: 'कार्यक्रम समाप्त तिथि', mr: 'कार्यक्रम समाप्ती तारीख' },
          required: true, colSpan: 1
        },
 
        // Mandap Location
        {
            id: 'placeOwnership',
            type: 'select',
            label: { en: 'Ownership of Tent Place', hi: 'टेंट जगह का स्वामित्व', mr: 'मंडप उभारायच्या जागेची मालकी' },
            required: true,
            colSpan: 1,
            options: [
              { value: 'Private', label: { en: 'Private', hi: 'निजी', mr: 'खाजगी' } },
              { value: 'Municipal', label: { en: 'Municipal/Council', hi: 'नगर निगम', mr: 'महापालिका/परिषद' } },
              { value: 'Public', label: { en: 'Public Road', hi: 'सार्वजनिक सड़क', mr: 'सार्वजनिक रस्ता' } }
            ]
          },
          {
            id: 'zoneNo',
            type: 'select',
            label: { en: 'Zone', hi: 'ज़ोन', mr: 'झोन' },
            required: true,
            colSpan: 1,
            options: [
              { value: 'East', label: { en: 'East Zone', hi: 'पूर्व ज़ोन', mr: 'पूर्व झोन' } },
              { value: 'West', label: { en: 'West Zone', hi: 'पश्चिम ज़ोन', mr: 'पश्चिम झोन' } },
              { value: 'North', label: { en: 'North Zone', hi: 'उत्तर ज़ोन', mr: 'उत्तर झोन' } },
              { value: 'South', label: { en: 'South Zone', hi: 'दक्षिण ज़ोन', mr: 'दक्षिण झोन' } }
            ]
          },
          { id: 'wardArea', type: 'text', label: { en: 'Ward Area', hi: 'वार्ड क्षेत्र', mr: 'प्रभाग क्षेत्र' }, required: true, colSpan: 1 },
          { id: 'plotNo', type: 'text', label: { en: 'Plot No', hi: 'प्लॉट नंबर', mr: 'प्लॉट क्रमांक' }, required: true, colSpan: 1 },
          { id: 'pandolAddress', type: 'textarea', label: { en: 'Pandol / Stage Address', hi: 'मंडप / मंच का पता', mr: 'मंडप / स्टेजचा पत्ता' }, required: true, colSpan: 1 },
        ]
      },

    // 2. STRUCTURAL DETAILS OF MANDAP
    {
      id: 'structural-details',
      title: {
        en: 'Mandap Structural Details',
        hi: 'मंडप संरचना विवरण',
        mr: 'मंडप संरचना तपशील'
      },
      fields: [
        {
          id: 'mandapType',
          type: 'select',
          label: { en: 'Mandap Type', hi: 'मंडप का प्रकार', mr: 'मंडप प्रकार' },
          required: true, colSpan: 1,
          options: [
            { value: 'temporary', label: { en: 'Temporary Mandap', hi: 'अस्थायी मंडप', mr: 'तात्पुरता मंडप' } },
            { value: 'stage', label: { en: 'Stage / Platform', hi: 'स्टेज / मंच', mr: 'स्टेज / व्यासपीठ' } },
            { value: 'shamiyana', label: { en: 'Shamiyana / Tent', hi: 'शामियाना / तंबू', mr: 'शामियाना / तंबू' } }
          ]
        },
        {
          id: 'mandapArea',
          type: 'number',
          label: { en: 'Mandap Area (sq.ft.)', hi: 'मंडप क्षेत्र (वर्ग फुट)', mr: 'मंडप क्षेत्र (चौरस फूट)' },
          required: true, colSpan: 1
        },
        
          { id: 'areaSqFt', type: 'number', label: { en: 'Area (Sq Ft)', hi: 'क्षेत्रफल (वर्ग फुट)', mr: 'क्षेत्रफळ (चौ. फु.)' }, required: true, colSpan: 1 },
          { id: 'volunteers', type: 'number', label: { en: 'No. of Volunteers', hi: 'स्वयंसेवकों की संख्या', mr: 'स्वयंसेवक संख्या' }, required: true, colSpan: 1 },
        {
          id: 'numberOfPillars',
          type: 'number',
          label: { en: 'No. of Pillars / Support Beams', hi: 'स्तंभों / सपोर्ट बीम की संख्या', mr: 'स्तंभ / आधार बीम संख्या' },
          required: true, colSpan: 1
        },
        {
          id: 'beamMaterial',
          type: 'text',
          label: { en: 'Material Used (Wood/Iron/Steel/Aluminum)', hi: 'सामग्री (लकड़ी/लोहे/स्टील)', mr: 'साहित्य (लाकूड/लोखंड/स्टील)' },
          required: true, colSpan: 1
        },
        {
          id: 'structuralEngineerName',
          type: 'text',
          label: { en: 'Structural Engineer / Fabricator Name', hi: 'संरचना अभियंता का नाम', mr: 'संरचना अभियंता / फॅब्रिकेटरचे नाव' },
          required: true, colSpan: 1
        },
        {
          id: 'mandapHeight',
          type: 'number',
          label: { en: 'Mandap Height (feet)', hi: 'मंडप ऊंचाई (फीट)', mr: 'मंडप उंची (फूट)' },
          required: true,
          colSpan: 1
        },
        {
          id: 'windLoadResistance',
          type: 'select',
          label: { en: 'Wind Load Resistance Tested?', hi: 'पवन भार प्रतिरोध जाँचा?', mr: 'वारा भार प्रतिरोध तपासले?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'fireExtinguishersAvailable',
          type: 'select',
          label: { en: 'Fire Extinguishers Available?', hi: 'अग्निशामक उपलब्ध?', mr: 'अग्निशामक उपलब्ध?' },
          required: true, colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'extinguisherCount',
          type: 'number',
          label: { en: 'Number of Extinguishers', hi: 'अग्निशामकों की संख्या', mr: 'अग्निशामकांची संख्या' },
          required: false,
          colSpan: 1
        },
 
        // Electrical Safety
        {
          id: 'electricalLoad',
          type: 'number',
          label: { en: 'Electrical Load Installed (kW)', hi: 'स्थापित विद्युत भार (kW)', mr: 'स्थापित विद्युत भार (kW)' },
          required: true, colSpan: 1
        },
        {
          id: 'earthingProvided',
          type: 'select',
          label: { en: 'Earthing Provided?', hi: 'अर्थिंग प्रदान?', mr: 'अर्थिंग उपलब्ध?' },
          required: true, colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
 
        // Public Safety
        {
          id: 'crowdCapacity',
          type: 'number',
          label: { en: 'Expected Crowd Capacity', hi: 'अपेक्षित भीड़ क्षमता', mr: 'अपेक्षित गर्दी क्षमता' },
          required: true, colSpan: 1
        },
        {
          id: 'emergencyExits',
          type: 'number',
          label: { en: 'Number of Emergency Exits', hi: 'आपातकालीन निकास की संख्या', mr: 'आपत्कालीन बाहेर पडण्याची संख्या' },
          required: true, colSpan: 1
        },
        {
          id: 'generatorUsed',
          type: 'select',
          label: { en: 'Generator to be Used?', hi: 'जेनरेटर का उपयोग?', mr: 'जनरेटर वापरणार?' },
          required: true, colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        }
      ]
    },
 
    // // 3. PUBLIC SAFETY DETAILS
    // {
    //   id: 'safety-details',
    //   title: {
    //     en: 'Fire, Electrical & Public Safety',
    //     hi: 'अग्नि, विद्युत एवं सार्वजनिक सुरक्षा',
    //     mr: 'अग्नि, विद्युत व सार्वजनिक सुरक्षा'
    //   },
    //   fields: [
    //     // Fire Safety Equipment
    //     {
    //       id: 'fireExtinguishersAvailable',
    //       type: 'select',
    //       label: { en: 'Fire Extinguishers Available?', hi: 'अग्निशामक उपलब्ध?', mr: 'अग्निशामक उपलब्ध?' },
    //       required: true, colSpan: 1,
    //       options: [
    //         { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
    //         { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
    //       ]
    //     },
    //     {
    //       id: 'extinguisherCount',
    //       type: 'number',
    //       label: { en: 'Number of Extinguishers', hi: 'अग्निशामकों की संख्या', mr: 'अग्निशामकांची संख्या' },
    //       required: false,
    //       colSpan: 1
    //     },
 
    //     // Electrical Safety
    //     {
    //       id: 'electricalLoad',
    //       type: 'number',
    //       label: { en: 'Electrical Load Installed (kW)', hi: 'स्थापित विद्युत भार (kW)', mr: 'स्थापित विद्युत भार (kW)' },
    //       required: true, colSpan: 1
    //     },
    //     {
    //       id: 'earthingProvided',
    //       type: 'select',
    //       label: { en: 'Earthing Provided?', hi: 'अर्थिंग प्रदान?', mr: 'अर्थिंग उपलब्ध?' },
    //       required: true, colSpan: 1,
    //       options: [
    //         { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
    //         { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
    //       ]
    //     },
 
    //     // Public Safety
    //     {
    //       id: 'crowdCapacity',
    //       type: 'number',
    //       label: { en: 'Expected Crowd Capacity', hi: 'अपेक्षित भीड़ क्षमता', mr: 'अपेक्षित गर्दी क्षमता' },
    //       required: true, colSpan: 1
    //     },
    //     {
    //       id: 'emergencyExits',
    //       type: 'number',
    //       label: { en: 'Number of Emergency Exits', hi: 'आपातकालीन निकास की संख्या', mr: 'आपत्कालीन बाहेर पडण्याची संख्या' },
    //       required: true, colSpan: 1
    //     },
    //     {
    //       id: 'generatorUsed',
    //       type: 'select',
    //       label: { en: 'Generator to be Used?', hi: 'जेनरेटर का उपयोग?', mr: 'जनरेटर वापरणार?' },
    //       required: true, colSpan: 1,
    //       options: [
    //         { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
    //         { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
    //       ]
    //     }
    //   ]
    // },

    {
        id: 'contractors',
        title: { en: 'Contractors Info', hi: 'ठेकेदार जानकारी', mr: 'कंत्राटदार माहिती' },
        fields: [
          // Pandol Contractor
          { id: 'contractorAddress', type: 'textarea', label: { en: 'Pandol Contractor Address', hi: 'मंडप ठेकेदार का पता', mr: 'मंडप कंत्राटदाराचा पत्ता' }, required: true, colSpan: 1 },
          { id: 'contractorContact', type: 'tel', label: { en: 'Pandol Contractor Contact', hi: 'मंडप ठेकेदार संपर्क', mr: 'मंडप कंत्राटदार संपर्क' }, required: true, colSpan: 1, validation: { pattern: '^[0-9]{10}$', maxLength: 10 } },
          
          // Decorator / Electric
          { id: 'decoratorName', type: 'text', label: { en: 'Decorator/Electrical Name', hi: 'डेकोरेटर/इलेक्ट्रिकल नाम', mr: 'डेकोरेटर / इलेक्ट्रिकल कंत्राटदाराचे नाव' }, required: true, colSpan: 1 },
          { id: 'decoratorAddress', type: 'textarea', label: { en: 'Decorator/Electrical Address', hi: 'डेकोरेटर/इलेक्ट्रिकल पता', mr: 'डेकोरेटर / इलेक्ट्रिकल कंत्राटदाराचा पत्ता' }, required: true, colSpan: 1 },
          { id: 'decoratorContact', type: 'tel', label: { en: 'Decorator/Electrical Contact', hi: 'डेकोरेटर/इलेक्ट्रिकल संपर्क', mr: 'डेकोरेटर / इलेक्ट्रिकल कंत्राटदार संपर्क' }, required: true, colSpan: 1, validation: { pattern: '^[0-9]{10}$', maxLength: 10 } },
          
          // Sound System
          { id: 'soundName', type: 'text', label: { en: 'Sound/Speaker Contractor Name', hi: 'ध्वनि ठेकेदार का नाम', mr: 'लाऊडस्पीकर / ध्वनी प्रणाली कंत्राटदाराचे नाव' }, required: true, colSpan: 1 },
          { id: 'soundAddress', type: 'textarea', label: { en: 'Sound/Speaker Address', hi: 'ध्वनि ठेकेदार का पता', mr: 'ध्वनी प्रणाली कंत्राटदाराचा पत्ता' }, required: true, colSpan: 1 },
          { id: 'soundContact', type: 'tel', label: { en: 'Sound/Speaker Contact', hi: 'ध्वनि ठेकेदार संपर्क', mr: 'ध्वनी प्रणाली कंत्राटदार संपर्क' }, required: true, colSpan: 1, validation: { pattern: '^[0-9]{10}$', maxLength: 10 } },
          { 
            id: 'soundType', 
            type: 'select', 
            label: { en: 'Sound/Speaker Type', hi: 'ध्वनि प्रणाली का प्रकार', mr: 'लाऊडस्पीकर / ध्वनी प्रणालीचा प्रकार' }, 
            required: true, 
            colSpan: 1,
            options: [
              { value: 'DJ', label: { en: 'DJ System', hi: 'डीजे सिस्टम', mr: 'डीजे सिस्टम' } },
              { value: 'Loudspeaker', label: { en: 'Loudspeaker', hi: 'लाउडस्पीकर', mr: 'लाउडस्पीकर' } },
              { value: 'Traditional', label: { en: 'Traditional Instruments', hi: 'पारंपरिक वाद्ययंत्र', mr: 'पारंपारिक वाद्ये' } }
            ]
          },
        ]
      },
 
    // 4. GUARANTEE, UNDERTAKING & COMPLIANCE
    {
      id: 'undertaking',
      title: {
        en: 'Applicant Undertaking & Compliance',
        hi: 'आवेदक प्रतिज्ञा एवं अनुपालन',
        mr: 'अर्जदार प्रतिज्ञा व अनुपालन'
      },
      fields: [
        { id: 'policeStation', type: 'text', label: { en: 'Concerned Police Station', hi: 'संबंधित पुलिस स्टेशन', mr: 'संबंधित पोलीस स्टेशन' }, required: true, colSpan: 1 },
          { id: 'trafficPoliceStation', type: 'text', label: { en: 'Concerned Traffic Police Station', hi: 'संबंधित ट्रैफिक पुलिस स्टेशन', mr: 'संबंधित ट्रॅफिक पोलीस स्टेशन' }, required: true, colSpan: 1 },
          { id: 'fireStation', type: 'text', label: { en: 'Nearest Fire Station', hi: 'निकटतम फायर स्टेशन', mr: 'जवळचे अग्निशमन केंद्र' }, required: true, colSpan: 1 },
        {
          id: 'noDamageGuarantee',
          type: 'select',
          label: {
            en: 'Guarantee that No Damage Will Be Caused to Public Property',
            hi: 'सार्वजनिक संपत्ति को कोई नुकसान न होने की गारंटी',
            mr: 'सार्वजनिक संपत्तीला नुकसान न होण्याची हमी'
          },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'cleanlinessAssurance',
          type: 'select',
          label: {
            en: 'Assurance to Clean the Area After Event',
            hi: 'कार्यक्रम के बाद क्षेत्र की सफाई का आश्वासन',
            mr: 'कार्यक्रमानंतर परिसर स्वच्छ ठेवण्याचे आश्वासन'
          },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        }
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
 
  // DOCUMENTS
  documents: [
    {
      id: 'applicantIdProof',
      label: { en: 'Applicant ID Proof', hi: 'आवेदक का पहचान पत्र', mr: 'अर्जदाराचा ओळख पुरावा' },
      description: { en: 'Aadhaar / PAN / Driving License', hi: 'आधार / पैन / ड्राइविंग लाइसेंस', mr: 'आधार / PAN / ड्रायव्हिंग लायसन्स' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
        id: 'charityCert',
        label: { en: 'Charity Commissioner Certificate', hi: 'धर्मादाय आयुक्त प्रमाण पत्र', mr: 'मंडळ नोंदणी प्रमाणपत्र' },
        description: { en: 'Registration certificate copy', hi: 'पंजीकरण प्रमाण पत्र की प्रति', mr: 'नोंदणी प्रमाणपत्राची प्रत' },
        required: true,
        acceptedFormats: ['.pdf', '.jpg'],
        maxSize: 2
      },
    {
      id: 'landOwnerConsent',
      label: { en: 'Land / Property Owner Consent Letter', hi: 'भूमि/परिसर मालिक की सहमति पत्र', mr: 'जमीन/परिसर मालकाची संमती पत्र' },
      description: { en: 'Required if applicant is not the owner', hi: 'यदि आवेदक मालिक नहीं है', mr: 'जर अर्जदार मालक नसेल तर आवश्यक' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
   {
        id: 'locationMap',
        label: { en: 'Location Map', hi: 'स्थान मानचित्र', mr: 'स्थळदर्शक नकाशा' },
        description: { en: 'Map showing pandol location', hi: 'मंडप स्थान दिखाने वाला नक्शा', mr: 'मंडपाचे स्थान दर्शविणारा नकाशा' },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.png'],
        maxSize: 5
      },
    {
        id: 'lastFireNoc',
        label: { en: 'Last Year Fire NOC', hi: 'पिछले साल की फायर एनओसी', mr: 'मागील वर्षीचा अग्निशामक NOC' },
        description: { en: 'If applicable', hi: 'यदि लागू हो', mr: 'लागू असल्यास' },
        required: false,
        acceptedFormats: ['.pdf', '.jpg'],
        maxSize: 2
      },
      {
        id: 'lastTrafficNoc',
        label: { en: 'Last Year Traffic NOC', hi: 'पिछले साल की ट्रैफिक एनओसी', mr: 'मागील वर्षीचा वाहतूक NOC' },
        description: { en: 'If applicable', hi: 'यदि लागू हो', mr: 'लागू असल्यास' },
        required: false,
        acceptedFormats: ['.pdf', '.jpg'],
        maxSize: 2
      },
    {
      id: 'eventLayoutMap',
      label: { en: 'Mandap Layout Map (Top View + Entry/Exit)', hi: 'मंडप लेआउट नक्शा', mr: 'मंडप लेआउट नकाशा' },
      description: { en: 'Shows emergency exits, stage, crowd flow', hi: 'निकास, मंच एवं भीड़ प्रवाह दर्शाता है', mr: 'बाहेर पडणे, स्टेज व गर्दी प्रवाह दर्शवितो' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ]
},


  // Fire Extinguisher Certificate - 7202
  '7202': {
  serviceId: '7202',
  steps: [
    {
        id: "applicant-information",
        title: {
          en: "Applicant Information",
          hi: "आवेदक की जानकारी",
          mr: "आवेदकाची माहिती",
        },
        fields: createApplicantInformationFields(),
      },
    {
      id: 'basic info',
      title: { en: 'Owner & Premises details', hi: 'मालिक एवं परिसर विवरण', mr: 'मालकाचे व परिसर तपशील' },
      fields: [
        {
          id: 'ownerName',
          type: 'text',
          label: { en: 'Name of Owner', hi: 'मालिक का नाम', mr: 'मालकाचे नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'ownerMobile',
          type: 'tel',
          label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
          required: true,
          validation: { pattern: '^[0-9]{10}$', maxLength: 10 },
          colSpan: 1
        },
        {
          id: 'ownerEmail',
          type: 'email',
          label: { en: 'Email Address', hi: 'ईमेल पता', mr: 'ईमेल पत्ता' },
          required: false,
          colSpan: 1
        },
        {
          id: 'businessName',
          type: 'text',
          label: { en: 'Name of Industry / Business / Firm', hi: 'उद्योग/व्यवसाय/फर्म का नाम', mr: 'उद्योग/व्यवसाय/फर्मचे नाव' },
          required: true,
          colSpan: 1
        },
        ...createAddressFieldsWithCity('business'),
        {
          id: 'propertyTaxNo',
          type: 'text',
          label: { en: 'Property Tax Assessment No.', hi: 'मालमत्ता कर क्रमांक', mr: 'मालमत्ता कर क्रमांक' },
          required: true,
          colSpan: 1
        },
        {
          id: 'zoneWard',
          type: 'text',
          label: { en: 'Zone/Ward', hi: 'ज़ोन/वार्ड', mr: 'क्षेत्र/प्रभाग' },
          required: true,
          colSpan: 1
        },
        {
          id: 'propertyType',
          type: 'select',
          label: { en: 'Occupancy Type', hi: 'परिसर का उपयोग', mr: 'परिसराचा उपयोग' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'commercial', label: { en: 'Commercial', hi: 'व्यावसायिक', mr: 'व्यावसायिक' } },
            { value: 'industrial', label: { en: 'Industrial', hi: 'औद्योगिक', mr: 'औद्योगिक' } },
            { value: 'warehouse', label: { en: 'Warehouse/Storage', hi: 'गोदाम/भंडारण', mr: 'वेअरहाउस/साठवण' } },
            { value: 'office', label: { en: 'Office', hi: 'कार्यालय', mr: 'कार्यालय' } }
          ]
        }
      ]
    },
    {
      id: 'fire-building-info',
      title: { en: 'Fire Safety & Building Details', hi: 'अग्नि सुरक्षा एवं भवन विवरण', mr: 'अग्निसुरक्षा व इमारत तपशील' },
      fields: [
        {
          id: 'totalBuiltupArea',
          type: 'number',
          label: { en: 'Total Built-up Area (sq.m)', hi: 'कुल निर्मित क्षेत्र (वर्ग मी.)', mr: 'एकूण बिल्ट-अप क्षेत्र (चौ.मी.)' },
          required: true,
          validation: { min: 1 },
          colSpan: 1
        },
        {
          id: 'floors',
          type: 'number',
          label: { en: 'No. of Floors', hi: 'मंजिलों की संख्या', mr: 'मजल्यांची संख्या' },
          required: true,
          validation: { min: 1 },
          colSpan: 1
        },
        {
          id: 'workers',
          type: 'number',
          label: { en: 'No. of Workers/Employees', hi: 'कर्मचारियों की संख्या', mr: 'कामगार संख्या' },
          required: true,
          colSpan: 1
        },
        {
          id: 'extinguisherCountProposed',
          type: 'number',
          label: { en: 'Proposed No. of Fire Extinguishers', hi: 'प्रस्तावित अग्निशामक संख्या', mr: 'प्रस्तावित अग्निशामक संख्या' },
          required: true,
          colSpan: 1
        },
        {
          id: 'emergencyExitCountProposed',
          type: 'number',
          label: { en: 'Proposed No. of Emergency Exits', hi: 'प्रस्तावित आपातकालीन निकास संख्या', mr: 'प्रस्तावित आपातकालीन बाहेर पडण्यांची संख्या' },
          required: true,
          validation: { min: 1 },
          colSpan: 1
        },
        {
          id: 'musterPointProposed',
          type: 'textarea',
          label: { en: 'Proposed Assembly / Muster Point Details', hi: 'प्रस्तावित एकत्रीकरण स्थान विवरण', mr: 'प्रस्तावित एकत्र होण्याचे ठिकाण विवरण' },
          required: false,
          colSpan: 1
        },
        {
          id: 'flammableMaterialsProposed',
          type: 'select',
          label: { en: 'Any Highly Flammable Materials to be Stored?', hi: 'कोई अत्यधिक ज्वलनशील पदार्थ संग्रहित किए जाएंगे?', mr: 'काही ज्वलनशील पदार्थ साठवले जाणार आहेत का?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'flammableMaterialDetailsProposed',
          type: 'textarea',
          label: { en: 'Details of Flammable Materials (If Yes)', hi: 'ज्वलनशील पदार्थ विवरण (यदि हाँ)', mr: 'ज्वलनशील पदार्थ तपशील (जर होय)' },
          required: false,
          colSpan: 1
        },
        {
          id: 'buildingDetailsAsMap',
          type: 'textarea',
          label: { en: 'Details as per Approved/Proposed Map (Signed by Architect & Owner)', hi: 'स्वीकृत/प्रस्तावित नक्शे के अनुसार विवरण (आर्किटेक्ट व मालिक हस्ताक्षर)', mr: 'मान्य/प्रस्तावित नकाशानुसार तपशील (आ. व मालक स्वाक्षरी)' },
          required: true,
          colSpan: 1
        }
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
    {
      id: 'approvedBlueprint',
      label: { en: 'Approved Blueprint (Signed by Architect & Owner)', hi: 'स्वीकृत ब्लू प्रिंट (आर्किटेक्ट व मालिक हस्ताक्षर)', mr: 'मान्य ब्ल्यू प्रिंट (आ. व मालक स्वाक्षरी)' },
      description: { en: 'Approved building plan with signatures', hi: 'हस्ताक्षर सहित स्वीकृत नक्शा', mr: 'स्वाक्षरीसह मान्य नकाशा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'propertyTaxReceipt',
      label: { en: 'Property Tax Receipt / No Due Certificate', hi: 'मालमत्ता कर पावती / थकबाकी नसल्याचे प्रमाणपत्र', mr: 'मालमत्ता कर पावती / थकबाकी नसल्याचे प्रमाणपत्र' },
      description: { en: 'Receipt of latest property tax paid', hi: 'अद्यतन मालमत्ता कर पावती', mr: 'नवीनतम मालमत्ता कर पावती' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
      id: 'propertyProof',
      label: { en: 'P.R. Card / 7/12 / Ownership Proof', hi: 'पी.आर. कार्ड / ٧/१२ / मालकी हक्क पुरावा', mr: 'पी.आर. कार्ड / ७/१२ / मालकी पुरावा' },
      description: { en: 'Valid document proving ownership of the property', hi: 'परिसर का वैध स्वामित्व प्रमाण', mr: 'परिसराच्या मालकीचा वैध पुरावा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'ownerIdProofDoc',
      label: { en: 'Owner ID Proof', hi: 'मालिक का पहचान प्रमाण', mr: 'मालकाचा ओळख पुरावा' },
      description: { en: 'Valid ID proof of business owner', hi: 'व्यवसाय मालिक का वैध पहचान पत्र', mr: 'व्यवसाय मालकाचा वैध ओळखपत्र' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
      id: 'layoutPlan',
      label: { en: 'Layout Plan (Showing Extinguisher Location)', hi: 'अग्निशामक स्थान अंकित लेआउट नक्शा', mr: 'अग्निशामक स्थान चिन्हांकित लेआउट नकाशा' },
      description: { en: 'Plan showing actual installed fire extinguishers', hi: 'स्थापित अग्निशामक स्थान दर्शाने वाला नक्शा', mr: 'स्थापित अग्निशामक स्थान दाखविणारा नकाशा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'extinguisherCertificate',
      label: { en: 'Fire Extinguisher Installation Certificate', hi: 'अग्निशामक उपकरण स्थापना प्रमाणपत्र', mr: 'अग्निशामक उपकरण स्थापना प्रमाणपत्र' },
      description: { en: 'Certificate from licensed agency for extinguishers installed', hi: 'लाइसेंस प्राप्त एजेंसी द्वारा स्थापना प्रमाणपत्र', mr: 'परवाना प्राप्त एजन्सीकडून स्थापना प्रमाणपत्र' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'proposedMap',
      label: { en: 'Proposed Map (If applicable)', hi: 'प्रस्तावित नक्शा (यदि लागू हो)', mr: 'प्रस्तावित नकाशा (लागू असल्यास)' },
      description: { en: 'If updated maps are submitted for approval', hi: 'यदि अद्यतन नक्शा प्रस्तुत है', mr: 'अद्ययावत नकाशा सादर केल्यास' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ]
},


  // Final Fire Exemption Certificate - 7203
  '7203': {
  serviceId: '7203',
  steps: [
    {
        id: "applicant-information",
        title: {
          en: "Applicant Information",
          hi: "आवेदक की जानकारी",
          mr: "आवेदकाची माहिती",
        },
        fields: createApplicantInformationFields(),
      },
    {
      id: 'basic info',
      title: { en: 'Owner & Premises details', hi: 'मालिक एवं परिसर विवरण', mr: 'मालकाचे व परिसर तपशील' },
      fields: [
        
        {
          id: 'ownerName',
          type: 'text',
          label: { en: 'Name of Owner', hi: 'मालिक का नाम', mr: 'मालकाचे नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'ownerMobile',
          type: 'tel',
          label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
          required: true,
          validation: { pattern: '^[0-9]{10}$', maxLength: 10 },
          colSpan: 1
        },
        {
          id: 'ownerEmail',
          type: 'email',
          label: { en: 'Email Address', hi: 'ईमेल पता', mr: 'ईमेल पत्ता' },
          required: false,
          colSpan: 1
        },
        
        {
          id: 'businessName',
          type: 'text',
          label: { en: 'Name of Industry / Business / Firm', hi: 'उद्योग/व्यवसाय/फर्म का नाम', mr: 'उद्योग/व्यवसाय/फर्मचे नाव' },
          required: true,
          colSpan: 1
        },
        ...createAddressFieldsWithCity('business'),
        {
          id: 'propertyTaxNo',
          type: 'text',
          label: { en: 'Property Tax Assessment No.', hi: 'मालमत्ता कर क्रमांक', mr: 'मालमत्ता कर क्रमांक' },
          required: true,
          colSpan: 1
        },
        {
          id: 'zoneWard',
          type: 'text',
          label: { en: 'Zone/Ward', hi: 'ज़ोन/वार्ड', mr: 'क्षेत्र/प्रभाग' },
          required: true,
          colSpan: 1
        },
        {
          id: 'propertyType',
          type: 'select',
          label: { en: 'Occupancy Type', hi: 'परिसर का उपयोग', mr: 'परिसराचा उपयोग' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'commercial', label: { en: 'Commercial', hi: 'व्यावसायिक', mr: 'व्यावसायिक' } },
            { value: 'industrial', label: { en: 'Industrial', hi: 'औद्योगिक', mr: 'औद्योगिक' } },
            { value: 'warehouse', label: { en: 'Warehouse/Storage', hi: 'गोदाम/भंडारण', mr: 'वेअरहाउस/साठवण' } },
            { value: 'office', label: { en: 'Office', hi: 'कार्यालय', mr: 'कार्यालय' } }
          ]
        }
      ]
    },
    {
      id: 'fire-building-info',
      title: { en: 'Fire Safety & Building Details', hi: 'अग्नि सुरक्षा एवं भवन विवरण', mr: 'अग्निसुरक्षा व इमारत तपशील' },
      fields: [
        {
          id: 'totalBuiltupArea',
          type: 'number',
          label: { en: 'Total Built-up Area (sq.m)', hi: 'कुल निर्मित क्षेत्र (वर्ग मी.)', mr: 'एकूण बिल्ट-अप क्षेत्र (चौ.मी.)' },
          required: true,
          validation: { min: 1 },
          colSpan: 1
        },
        {
          id: 'floors',
          type: 'number',
          label: { en: 'No. of Floors', hi: 'मंजिलों की संख्या', mr: 'मजल्यांची संख्या' },
          required: true,
          validation: { min: 1 },
          colSpan: 1
        },
        {
          id: 'workers',
          type: 'number',
          label: { en: 'No. of Workers/Employees', hi: 'कर्मचारियों की संख्या', mr: 'कामगार संख्या' },
          required: true,
          colSpan: 1
        },
        {
          id: 'extinguisherCount',
          type: 'number',
          label: { en: 'No. of Fire Extinguishers Installed', hi: 'अग्निशामक यंत्रों की संख्या', mr: 'अग्निशामक यंत्रांची संख्या' },
          required: true,
          colSpan: 1
        },
        {
          id: 'extinguisherType',
          type: 'select',
          label: { en: 'Type of Extinguishers', hi: 'अग्निशामक यंत्र का प्रकार', mr: 'अग्निशामक यंत्राचा प्रकार' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'co2', label: { en: 'CO₂', hi: 'CO₂', mr: 'CO₂' } },
            { value: 'dcp', label: { en: 'DCP', hi: 'DCP', mr: 'DCP' } },
            { value: 'water', label: { en: 'Water', hi: 'पानी', mr: 'पाणी' } },
            { value: 'foam', label: { en: 'Foam', hi: 'फोम', mr: 'फोम' } }
          ]
        },
        {
          id: 'extinguisherDensity',
          type: 'number',
          label: { en: 'Fire Extinguishers Per 100 Sq.ft.', hi: 'प्रति 100 वर्ग फ़ीट अग्निशामक', mr: 'प्रति 100 चौरस फूट अग्निशामक' },
          required: false,
          colSpan: 1
        },
        {
          id: 'lastRefillDate',
          type: 'date',
          label: { en: 'Last Refill/Service Date', hi: 'आखिरी सर्विस तिथि', mr: 'शेवटची सर्विस तारीख' },
          required: true,
          colSpan: 1
        },
        {
          id: 'nextRefillDueDate',
          type: 'date',
          label: { en: 'Next Service Due Date', hi: 'अगली सर्विस नियत तिथि', mr: 'पुढील सर्विसची तारीख' },
          required: false,
          colSpan: 1
        },
        {
          id: 'installerAgency',
          type: 'text',
          label: { en: 'Installer/Service Agency Name', hi: 'स्थापना एजेंसी का नाम', mr: 'स्थापना एजन्सीचे नाव' },
          required: true,
          colSpan: 1
        },
        {
          id: 'serviceAgencyLicenseNo',
          type: 'text',
          label: { en: 'Service Agency License No.', hi: 'सेवा एजेंसी का लाइसेंस नंबर', mr: 'सेवा एजन्सीचा परवाना क्रमांक' },
          required: true,
          colSpan: 1
        },
        {
          id: 'emergencyExitCount',
          type: 'number',
          label: { en: 'No. of Emergency Exits', hi: 'आपातकालीन निकास की संख्या', mr: 'आपत्कालीन बाहेर पडण्यांची संख्या' },
          required: true,
          validation: { min: 1 },
          colSpan: 1
        },
        {
          id: 'exitSignage',
          type: 'select',
          label: { en: 'Exit Direction Signage Installed', hi: 'निकास दिशा संकेत उपलब्ध', mr: 'निर्गम दिशा सूचना उपलब्ध' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'illuminated', label: { en: 'Illuminated', hi: 'प्रकाशयुक्त', mr: 'प्रकाशयुक्त' } },
            { value: 'nonIlluminated', label: { en: 'Non-Illuminated', hi: 'अप्रकाशित', mr: 'अप्रकाशित' } },
            { value: 'no', label: { en: 'Not Installed', hi: 'स्थापित नहीं', mr: 'बसवलेले नाही' } }
          ]
        },
        {
          id: 'routeMarking',
          type: 'select',
          label: { en: 'Evacuation Route Marked', hi: 'निकासी मार्ग अंकित', mr: 'निर्गमन मार्ग चिन्हांकित' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'partial', label: { en: 'Partially', hi: 'आंशिक', mr: 'आंशिक' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'fireStaircaseAvailable',
          type: 'select',
          label: { en: 'Dedicated Fire Staircase', hi: 'अग्नि सीढ़ी उपलब्ध', mr: 'अग्नि जिना उपलब्ध' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'musterPoint',
          type: 'textarea',
          label: { en: 'Assembly / Muster Point Details', hi: 'एकत्रीकरण स्थान विवरण', mr: 'एकत्र होण्याचे ठिकाण विवरण' },
          required: false,
          colSpan: 1
        },
        {
          id: 'fireAlarmInstalled',
          type: 'select',
          label: { en: 'Fire Alarm System Installed?', hi: 'अग्नि अलार्म प्रणाली स्थापित?', mr: 'अग्नि अलार्म प्रणाली बसवलेली?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'hydrantSprinklerInstalled',
          type: 'select',
          label: { en: 'Hydrant / Sprinkler System Installed?', hi: 'हाइड्रेंट / स्प्रिंकलर प्रणाली स्थापित?', mr: 'हायड्रंट / स्प्रिंकलर प्रणाली बसवलेली?' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'earthingCertified',
          type: 'select',
          label: { en: 'Earthing System Certified?', hi: 'अर्थिंग प्रणाली प्रमाणित?', mr: 'अर्थिंग प्रणाली प्रमाणित?' },
          required: false,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'flammableMaterials',
          type: 'select',
          label: { en: 'Any Highly Flammable Materials Stored?', hi: 'कोई अत्यधिक ज्वलनशील पदार्थ संग्रहित?', mr: 'अत्यंत ज्वलनशील पदार्थ संग्रहित आहेत?' },
          required: true,
          colSpan: 1,
          options: [
            { value: 'yes', label: { en: 'Yes', hi: 'हाँ', mr: 'होय' } },
            { value: 'no', label: { en: 'No', hi: 'नहीं', mr: 'नाही' } }
          ]
        },
        {
          id: 'flammableMaterialDetails',
          type: 'textarea',
          label: { en: 'Details of Flammable Materials (If Yes)', hi: 'ज्वलनशील पदार्थ विवरण (यदि हाँ)', mr: 'ज्वलनशील पदार्थ तपशील (जर होय)' },
          required: false,
          colSpan: 1
        },
        {
          id: 'buildingDetailsAsMap',
          type: 'textarea',
          label: { en: 'Details as per Approved/Proposed Map (Signed by Architect & Owner)', hi: 'स्वीकृत/प्रस्तावित नक्शे के अनुसार विवरण (आर्किटेक्ट व मालिक हस्ताक्षर)', mr: 'मान्य/प्रस्तावित नकाशानुसार तपशील (आ. व मालक स्वाक्षरी)' },
          required: true,
          colSpan: 1
        }
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
    {
      id: 'approvedBlueprint',
      label: { en: 'Approved Blueprint (Signed by Architect & Owner)', hi: 'स्वीकृत ब्लू प्रिंट (आर्किटेक्ट व मालिक हस्ताक्षर)', mr: 'मान्य ब्ल्यू प्रिंट (आ. व मालक स्वाक्षरी)' },
      description: { en: 'Approved building plan with signatures', hi: 'हस्ताक्षर सहित स्वीकृत नक्शा', mr: 'स्वाक्षरीसह मान्य नकाशा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'propertyTaxReceipt',
      label: { en: 'Property Tax Receipt / No Due Certificate', hi: 'मालमत्ता कर पावती / थकबाकी नसल्याचे प्रमाणपत्र', mr: 'मालमत्ता कर पावती / थकबाकी नसल्याचे प्रमाणपत्र' },
      description: { en: 'Receipt of latest property tax paid', hi: 'अद्यतन मालमत्ता कर पावती', mr: 'नवीनतम मालमत्ता कर पावती' },
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
      id: 'propertyProof',
      label: { en: 'P.R. Card / 7/12 / Ownership Proof', hi: 'पी.आर. कार्ड / ٧/१२ / मालकी हक्क पुरावा', mr: 'पी.आर. कार्ड / ۷/۱۲ / मालकी पुरावा' },
      description: { en: 'Valid document proving ownership of the property', hi: 'परिसर का वैध स्वामित्व प्रमाण', mr: 'परिसराच्या मालकीचा वैध पुरावा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'layoutPlan',
      label: { en: 'Layout Plan (Showing Extinguisher Location)', hi: 'अग्निशामक स्थान अंकित लेआउट नक्शा', mr: 'अग्निशामक स्थान चिन्हांकित लेआउट नकाशा' },
      description: { en: 'Plan showing actual installed fire extinguishers', hi: 'स्थापित अग्निशामक स्थान दर्शाने वाला नक्शा', mr: 'स्थापित अग्निशामक स्थान दाखविणारा नकाशा' },
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
  id: 'sampleACertificateLicensingAgency',
  label: {
    en: 'Certificate from Licensing Agency',
    hi: 'परवाना देणार्‍या एजन्सीकडून नमुना प्रमाणपत्र',
    mr: 'परवाना देणार्‍या एजन्सीकडून नमुना प्रमाणपत्र'
  },
  description: {
    en: 'Upload Sample A Certificate issued by the licensed fire agency',
    hi: 'परवाना देणार्‍या एजन्सीकडून नमुना प्रमाणपत्र अपलोड करा',
    mr: 'परवाना देणार्‍या एजन्सीकडून नमुना प्रमाणपत्र अपलोड करा'
  },
  required: true,
  acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSize: 10
},
{
  id: 'developerSocietyGuaranteeFireFighting',
  label: {
    en: 'Guarantee of Developer/Society for Fire Fighting',
    hi: 'आग विझवण्यासाठी विकासक/सोसायटीची हमी',
    mr: 'आग विझवण्यासाठी विकासक/सोसायटीची हमी'
  },
  description: {
    en: 'Upload Guarantee Certificate from Developer/Society for fire-fighting compliance',
    hi: 'आग विझवण्यासाठी विकासक/सोसायटीची हमी अपलोड करा',
    mr: 'आग विझवण्यासाठी विकासक/सोसायटीची हमी अपलोड करा'
  },
  required: true,
  acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSize: 10
}
  ]
},

}
