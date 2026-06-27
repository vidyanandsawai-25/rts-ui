// @ts-nocheck
import { ServiceFormConfig , createAddressFieldsWithCity,createApplicantInformationFields, declarationField, } from "./formTypes";
 
export const marriageFormConfigs: Record<string, ServiceFormConfig> = {
'7121': {
    serviceId: '7121',
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
        id: 'groom-details',
        title: { en: 'Bridegroom Details', hi: 'वर का विवरण', mr: 'वराचा तपशील' },
        fields: [
          // SPLIT GROOM NAME
          {
            id: 'groomFirstName',
            type: 'text',
            label: { en: 'Groom First Name', hi: 'वर का पहला नाम', mr: 'वराचे पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'groomMiddleName',
            type: 'text',
            label: { en: 'Groom Middle Name', hi: 'वर का मध्य नाम', mr: 'वराचे मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'groomLastName',
            type: 'text',
            label: { en: 'Groom Last Name', hi: 'वर का उपनाम', mr: 'वराचे आडनाव' },
            required: true,
            colSpan: 1
          },
          
          // Compact Row: Age (2) + DOB (4) + Aadhaar (6)
          {
            id: 'groomAge',
            type: 'number',
            label: { en: 'Age', hi: 'आयु', mr: 'वय' },
            required: true,
            validation: { min: 21, max: 120 },
            colSpan: 1
          },
          {
            id: 'groomDateOfBirth',
            type: 'date',
            label: { en: 'Date of Birth', hi: 'जन्म तिथि', mr: 'जन्म तारीख' },
            required: true,
            colSpan: 1
          },
          {
            id: 'groomAadhaar',
            type: 'text',
            label: { en: 'Aadhaar Number', hi: 'आधार नंबर', mr: 'आधार नंबर' },
            required: true,
            colSpan: 1,
            validation: { pattern: '^[0-9]{12}$', maxLength: 12 }
          },

          // SPLIT GROOM FATHER NAME
          {
            id: 'groomFatherFirstName',
            type: 'text',
            label: { en: "Father's First Name", hi: 'पिता का पहला नाम', mr: 'वडिलांचे पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'groomFatherMiddleName',
            type: 'text',
            label: { en: "Father's Middle Name", hi: 'पिता का मध्य नाम', mr: 'वडिलांचे मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'groomFatherLastName',
            type: 'text',
            label: { en: "Father's Last Name", hi: 'पिता का उपनाम', mr: 'वडिलांचे आडनाव' },
            required: true,
            colSpan: 1
          },

          // SPLIT GROOM MOTHER NAME
          {
            id: 'groomMotherFirstName',
            type: 'text',
            label: { en: "Mother's First Name", hi: 'माता का पहला नाम', mr: 'आईचे पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'groomMotherMiddleName',
            type: 'text',
            label: { en: "Mother's Middle Name", hi: 'माता का मध्य नाम', mr: 'आईचे मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'groomMotherLastName',
            type: 'text',
            label: { en: "Mother's Last Name", hi: 'माता का उपनाम', mr: 'आईचे आडनाव' },
            required: true,
            colSpan: 1
          },

          ...createAddressFieldsWithCity('groomParent'),
          
          {
            id: 'groomOccupation',
            type: 'text',
            label: { en: 'Occupation', hi: 'व्यवसाय', mr: 'व्यवसाय' },
            required: false,
            colSpan: 1
          },
          {
            id: 'groomReligion',
            type: 'select',
            label: { en: 'Religion', hi: 'धर्म', mr: 'धर्म' },
            required: true,
            colSpan: 1,
            options: [
              { value: 'hindu', label: { en: 'Hindu', hi: 'हिंदू', mr: 'हिंदू' } },
              { value: 'muslim', label: { en: 'Muslim', hi: 'मुस्लिम', mr: 'मुस्लिम' } },
              { value: 'christian', label: { en: 'Christian', hi: 'ईसाई', mr: 'ख्रिश्चन' } },
              { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
            ]
          }
        ]
      },
      {
        id: 'bride-details',
        title: { en: 'Bride Details', hi: 'वधू का विवरण', mr: 'वधूचा तपशील' },
        fields: [
          // SPLIT BRIDE NAME
          {
            id: 'brideFirstName',
            type: 'text',
            label: { en: 'Bride First Name', hi: 'वधू का पहला नाम', mr: 'वधूचे पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'brideMiddleName',
            type: 'text',
            label: { en: 'Bride Middle Name', hi: 'वधू का मध्य नाम', mr: 'वधूचे मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'brideLastName',
            type: 'text',
            label: { en: 'Bride Last Name', hi: 'वधू का उपनाम', mr: 'वधूचे आडनाव' },
            required: true,
            colSpan: 1
          },

          // Compact Row
          {
            id: 'brideAge',
            type: 'number',
            label: { en: 'Age', hi: 'आयु', mr: 'वय' },
            required: true,
            validation: { min: 18, max: 120 },
            colSpan: 1
          },
          {
            id: 'brideDateOfBirth',
            type: 'date',
            label: { en: 'Date of Birth', hi: 'जन्म तिथि', mr: 'जन्म तारीख' },
            required: true,
            colSpan: 1
          },
          {
            id: 'brideAadhaar',
            type: 'text',
            label: { en: 'Aadhaar Number', hi: 'आधार नंबर', mr: 'आधार नंबर' },
            required: true,
            colSpan: 1,
            validation: { pattern: '^[0-9]{12}$', maxLength: 12 }
          },

          // SPLIT BRIDE FATHER NAME
          {
            id: 'brideFatherFirstName',
            type: 'text',
            label: { en: "Father's First Name", hi: 'पिता का पहला नाम', mr: 'वडिलांचे पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'brideFatherMiddleName',
            type: 'text',
            label: { en: "Father's Middle Name", hi: 'पिता का मध्य नाम', mr: 'वडिलांचे मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'brideFatherLastName',
            type: 'text',
            label: { en: "Father's Last Name", hi: 'पिता का उपनाम', mr: 'वडिलांचे आडनाव' },
            required: true,
            colSpan: 1
          },

          // SPLIT BRIDE MOTHER NAME
          {
            id: 'brideMotherFirstName',
            type: 'text',
            label: { en: "Mother's First Name", hi: 'माता का पहला नाम', mr: 'आईचे पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'brideMotherMiddleName',
            type: 'text',
            label: { en: "Mother's Middle Name", hi: 'माता का मध्य नाम', mr: 'आईचे मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'brideMotherLastName',
            type: 'text',
            label: { en: "Mother's Last Name", hi: 'माता का उपनाम', mr: 'आईचे आडनाव' },
            required: true,
            colSpan: 1
          },

          ...createAddressFieldsWithCity('brideParent'),
          
          {
            id: 'brideOccupation',
            type: 'text',
            label: { en: 'Occupation', hi: 'व्यवसाय', mr: 'व्यवसाय' },
            required: false,
            colSpan: 1
          },
          {
            id: 'brideReligion',
            type: 'select',
            label: { en: 'Religion', hi: 'धर्म', mr: 'धर्म' },
            required: true,
            colSpan: 1,
            options: [
              { value: 'hindu', label: { en: 'Hindu', hi: 'हिंदू', mr: 'हिंदू' } },
              { value: 'muslim', label: { en: 'Muslim', hi: 'मुस्लिम', mr: 'मुस्लिम' } },
              { value: 'christian', label: { en: 'Christian', hi: 'ईसाई', mr: 'ख्रिश्चन' } },
              { value: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
            ]
          }
        ]
      },
      {
        id: 'marriage-details',
        title: { en: 'Marriage Details', hi: 'विवाह का विवरण', mr: 'विवाहाचा तपशील' },
        fields: [
          {
            id: 'marriageDate',
            type: 'date',
            label: { en: 'Date of Marriage', hi: 'विवाह की तारीख', mr: 'विवाहाची तारीख' },
            required: true,
            colSpan: 1
          },
          {
            id: 'marriagePlace',
            type: 'text',
            label: { en: 'Place of Marriage', hi: 'विवाह का स्थान', mr: 'विवाह ठिकाण' },
            placeholder: { en: 'Hall/Temple name', hi: 'हॉल/मंदिर का नाम', mr: 'हॉल/मंदिर नाव' },
            required: true,
            colSpan: 1
          },
          ...createAddressFieldsWithCity('marriage'),
          
        

          // SPLIT WITNESS 1 NAME
          {
            id: 'witness1FirstName',
            type: 'text',
            label: { en: 'Witness 1 First Name', hi: 'गवाह 1 पहला नाम', mr: 'साक्षीदार 1 पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'witness1MiddleName',
            type: 'text',
            label: { en: 'Witness 1 Middle Name', hi: 'गवाह 1 मध्य नाम', mr: 'साक्षीदार 1 मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'witness1LastName',
            type: 'text',
            label: { en: 'Witness 1 Last Name', hi: 'गवाह 1 उपनाम', mr: 'साक्षीदार 1 आडनाव' },
            required: true,
            colSpan: 1
          },

          // SPLIT WITNESS 2 NAME
          {
            id: 'witness2FirstName',
            type: 'text',
            label: { en: 'Witness 2 First Name', hi: 'गवाह 2 पहला नाम', mr: 'साक्षीदार 2 पहिले नाव' },
            required: true,
            colSpan: 1
          },
          {
            id: 'witness2MiddleName',
            type: 'text',
            label: { en: 'Witness 2 Middle Name', hi: 'गवाह 2 मध्य नाम', mr: 'साक्षीदार 2 मधले नाव' },
            required: false,
            colSpan: 1
          },
          {
            id: 'witness2LastName',
            type: 'text',
            label: { en: 'Witness 2 Last Name', hi: 'गवाह 2 उपनाम', mr: 'साक्षीदार 2 आडनाव' },
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
        id: 'signatures',
        label: { 
          en: 'Signature with Date (Groom, Bride, Priest & Witnesses)', 
          hi: 'दिनांक सहित हस्ताक्षर (वर, वधू, पुजारी और गवाह)', 
          mr: 'दिनांकासह स्वाक्षरी (वर, वधू, भटजी आणि साक्षीदार)' 
        },
        description: { 
          en: 'Upload signed document with date', 
          hi: 'दिनांक के साथ हस्ताक्षरित दस्तावेज़ अपलोड करें', 
          mr: 'दिनांकासह स्वाक्षरी केलेले कागदपत्र अपलोड करा' 
        },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'ageProof',
        label: { 
          en: 'Age Proof (Groom, Bride & Witnesses)', 
          hi: 'आयु प्रमाण (वर, वधू और गवाह)', 
          mr: 'वय पुरावा (वर, वधू आणि साक्षीदार)' 
        },
        description: { 
          en: 'School LC / Birth Certificate / Passport', 
          hi: 'स्कूल एलसी / जन्म प्रमाण पत्र / पासपोर्ट', 
          mr: 'शाळा सोडल्याचा दाखला / जन्म दाखला / पासपोर्ट' 
        },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'addressProof',
        label: { 
          en: 'Address Proof (Groom, Bride & Witnesses)', 
          hi: 'पता प्रमाण (वर, वधू और गवाह)', 
          mr: 'पत्ता पुरावा (वर, वधू आणि साक्षीदार)' 
        },
        description: { 
          en: 'Aadhaar / Ration Card / Electricity Bill', 
          hi: 'आधार / राशन कार्ड / बिजली बिल', 
          mr: 'आधार / रेशन कार्ड / वीज बिल' 
        },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'couplePhoto',
        label: { 
          en: 'Photo of Groom & Bride', 
          hi: 'वर और वधू की फोटो', 
          mr: 'वर आणि वधूचा फोटो' 
        },
        description: { 
          en: 'Combined photo or passport photos', 
          hi: 'संयुक्त फोटो या पासपोर्ट फोटो', 
          mr: 'एकत्रित फोटो किंवा पासपोर्ट फोटो' 
        },
        required: true,
        acceptedFormats: ['.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'marriageCard',
        label: { 
          en: 'Marriage Card', 
          hi: 'विवाह पत्रिका', 
          mr: 'लग्नपत्रिका' 
        },
        description: { 
          en: 'Original wedding invitation card', 
          hi: 'मूल विवाह निमंत्रण कार्ड', 
          mr: 'मूळ लग्नपत्रिका' 
        },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'priestCertificate',
        label: { 
          en: 'Certificate of Priest', 
          hi: 'पुजारी का प्रमाण पत्र', 
          mr: 'भटजींचे प्रमाणपत्र' 
        },
        description: { 
          en: 'Certificate from the priest who conducted the marriage', 
          hi: 'विवाह संपन्न कराने वाले पुजारी का प्रमाण पत्र', 
          mr: 'विवाह लावून देणाऱ्या भटजींचे प्रमाणपत्र' 
        },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'propertyTaxReceipt',
        label: { 
          en: 'Current Year Property Tax Receipt', 
          hi: 'चालू वर्ष की संपत्ति कर रसीद', 
          mr: 'चालू वर्षाची मालमत्ता कर पावती' 
        },
        description: { 
          en: 'Paid receipt of property tax', 
          hi: 'संपत्ति कर की भुगतान रसीद', 
          mr: 'मालमत्ता कर भरल्याची पावती' 
        },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'waterTaxReceipt',
        label: { 
          en: 'Current Year Water Tax Receipt', 
          hi: 'चालू वर्ष की जल कर रसीद', 
          mr: 'चालू वर्षाची पाणीपट्टी पावती' 
        },
        description: { 
          en: 'Paid receipt of water tax', 
          hi: 'जल कर की भुगतान रसीद', 
          mr: 'पाणीपट्टी भरल्याची पावती' 
        },
        required: true,
        acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      },
      {
        id: 'groupPhoto',
        label: { 
          en: 'Group Photo at Marriage', 
          hi: 'विवाह के समय की समूह फोटो', 
          mr: 'लग्नाच्या वेळीचा ग्रुप फोटो' 
        },
        description: { 
          en: 'Photo showing couple with guests/family', 
          hi: 'मेहमानों/परिवार के साथ जोड़े की फोटो', 
          mr: 'पाहुणे/कुटुंबासोबत जोडप्याचा फोटो' 
        },
        required: true,
        acceptedFormats: ['.jpg', '.jpeg', '.bmp'],
        maxSize: 5
      }
    ]
  },
}