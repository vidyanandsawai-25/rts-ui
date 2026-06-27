// @ts-nocheck
import {
  ServiceFormConfig,
  declarationField,
  createApplicantInformationFields,
  requiredIf,
} from "./formTypes";

export const educationFormConfigs: Record<string, ServiceFormConfig> = {
  // School Certificate - 8273
  "8273": {
    serviceId: "8273",
    steps: [
      // ---------------- Applicant ----------------
      {
        id: "applicant-information",
        title: {
          en: "Applicant Information",
          hi: "आवेदक की जानकारी",
          mr: "आवेदकाची माहिती",
        },
        fields: [
          ...createApplicantInformationFields(),

          {
            id: "relationshipToStudent",
            type: "select",
            label: {
              en: "Relationship to Student",
              hi: "छात्र से संबंध",
              mr: "विद्यार्थ्याशी नाते",
            },
            required: true,
            colSpan: 1,
            options: [
              {
                value: "self",
                label: {
                  en: "Self (Student)",
                  hi: "स्वयं (छात्र)",
                  mr: "स्वतः (विद्यार्थी)",
                },
              },
              { value: "parent", label: { en: "Parent", hi: "अभिभावक", mr: "पालक" } },
              { value: "guardian", label: { en: "Guardian", hi: "संरक्षक", mr: "संरक्षक" } },
            ],
          },

          {
            id: "guardianFullName",
            type: "text",
            label: {
              en: "Parent/Guardian Full Name",
              hi: "अभिभावक का पूरा नाम",
              mr: "पालक/संरक्षक पूर्ण नाव",
            },
            // if your UI supports showIf, you can enable it; otherwise keep required true
            // showIf: { field: "relationshipToStudent", doesNotEqual: "self" },
            required: true,
            colSpan: 1,
          },
        ],
      },

      // ---------------- Student Details ----------------
      {
        id: "student-details",
        title: { en: "Student Details", hi: "छात्र विवरण", mr: "विद्यार्थी तपशील" },
        fields: [
          {
            id: "rollNumber",
            type: "text",
            label: { en: "Roll Number", hi: "रोल नंबर", mr: "रोल नंबर" },
            required: false,
            colSpan: 1,
          },

          {
            id: "studentName",
            type: "text",
            label: { en: "Student Full Name", hi: "छात्र का पूरा नाम", mr: "विद्यार्थ्याचे पूर्ण नाव" },
            required: true,
            colSpan: 1,
          },
          {
            id: "dateOfBirth",
            type: "date",
            label: { en: "Date of Birth", hi: "जन्म तिथि", mr: "जन्म तारीख" },
            required: true,
            colSpan: 1,
          },
          {
            id: "gender",
            type: "select",
            label: { en: "Gender", hi: "लिंग", mr: "लिंग" },
            required: true,
            colSpan: 1,
            options: [
              { value: "male", label: { en: "Male", hi: "पुरुष", mr: "पुरुष" } },
              { value: "female", label: { en: "Female", hi: "महिला", mr: "महिला" } },
              { value: "other", label: { en: "Other", hi: "अन्य", mr: "इतर" } },
            ],
          },
          {
            id: "motherName",
            type: "text",
            label: { en: "Mother's Name", hi: "माता का नाम", mr: "आईचे नाव" },
            required: true,
            colSpan: 1,
          },
          {
            id: "fatherName",
            type: "text",
            label: { en: "Father's Name", hi: "पिता का नाम", mr: "वडिलांचे नाव" },
            required: true,
            colSpan: 1,
          },

          {
            id: "aadharLast4",
            type: "text",
            label: {
              en: "Aadhaar Last 4 Digits (optional)",
              hi: "आधार अंतिम 4 अंक (वैकल्पिक)",
              mr: "आधार शेवटचे 4 अंक (ऐच्छिक)",
            },
            required: false,
            colSpan: 1,
            validation: { maxLength: 4 },
          },
        ],
      },

      // ---------------- School Details ----------------
      {
        id: "school-details",
        title: { en: "School Details", hi: "स्कूल विवरण", mr: "शाळा तपशील" },
        fields: [
          {
            id: "schoolName",
            type: "text",
            label: { en: "School Name", hi: "स्कूल का नाम", mr: "शाळेचे नाव" },
            required: true,
            colSpan: 1,
          },

          {
            id: "lastStandardStudied",
            type: "text",
            label: { en: "Last Standard/Class Studied", hi: "अंतिम कक्षा/वर्ग", mr: "शेवटचा इयत्ता/वर्ग" },
            placeholder: { en: "E.g., 10th Standard", hi: "उदा., 10वीं कक्षा", mr: "उदा., 10वी इयत्ता" },
            required: true,
            colSpan: 1,
          },

          {
            id: "yearOfLeaving",
            type: "text",
            label: { en: "Year of Leaving", hi: "छोड़ने का वर्ष", mr: "सोडण्याचे वर्ष" },
            placeholder: { en: "E.g., 2023", hi: "उदा., 2023", mr: "उदा., 2023" },
            required: true,
            colSpan: 1,
            validation: { maxLength: 4 },
          },

          {
            id: "certificateType",
            type: "select",
            label: { en: "Certificate Type", hi: "प्रमाणपत्र प्रकार", mr: "प्रमाणपत्र प्रकार" },
            required: true,
            colSpan: 1,
            options: [
              { value: "leaving", label: { en: "Leaving Certificate", hi: "लीविंग प्रमाणपत्र", mr: "शाळा सोडल्याचा दाखला" } },
              { value: "duplicate", label: { en: "Duplicate Certificate", hi: "डुप्लिकेट प्रमाणपत्र", mr: "डुप्लिकेट प्रमाणपत्र" } },
              { value: "migration", label: { en: "Migration Certificate", hi: "स्थानांतरण प्रमाणपत्र", mr: "स्थलांतर प्रमाणपत्र" } },
            ],
          },

          // ✅ Only for Leaving
          {
            id: "lastAttendanceDate",
            type: "date",
            label: { en: "Last Attendance Date", hi: "अंतिम उपस्थिति तिथि", mr: "शेवटची उपस्थिती तारीख" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "leaving" },
            customValidate: requiredIf(
              { field: "certificateType", equals: "leaving" },
              "Last Attendance Date is required"
            ),
          },

          // ✅ Only for Migration
          {
            id: "boardOrUniversity",
            type: "text",
            label: { en: "Board / University", hi: "बोर्ड / विश्वविद्यालय", mr: "बोर्ड / विद्यापीठ" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "migration" },
            customValidate: requiredIf(
              { field: "certificateType", equals: "migration" },
              "Board / University is required"
            ),
          },
        ],
      },

      // ---------------- Certificate Details ----------------
      {
        id: "certificate-details",
        title: { en: "Certificate Details", hi: "प्रमाणपत्र विवरण", mr: "प्रमाणपत्र तपशील" },
        fields: [
          // ---------- Leaving ----------
          {
            id: "reasonForLeaving",
            type: "select",
            label: { en: "Reason for Leaving", hi: "छोड़ने का कारण", mr: "शाळा सोडण्याचे कारण" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "leaving" },
            customValidate: requiredIf({ field: "certificateType", equals: "leaving" }, "Reason for leaving is required"),
            options: [
              { value: "transfer", label: { en: "Transfer", hi: "स्थानांतरण", mr: "बदली" } },
              { value: "higherStudies", label: { en: "Higher Studies", hi: "उच्च शिक्षा", mr: "उच्च शिक्षण" } },
              { value: "familyShift", label: { en: "Family Shift", hi: "परिवार स्थानांतरण", mr: "कुटुंब स्थलांतर" } },
              { value: "other", label: { en: "Other", hi: "अन्य", mr: "इतर" } },
            ],
          },
          {
            id: "pendingDuesCleared",
            type: "select",
            label: { en: "Any Pending Dues Cleared?", hi: "क्या बकाया साफ है?", mr: "थकबाकी क्लिअर आहे का?" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "leaving" },
            customValidate: requiredIf({ field: "certificateType", equals: "leaving" }, "Please select Pending Dues Cleared"),
            options: [
              { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
              { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } },
            ],
          },

          // ---------- Duplicate ----------
          {
            id: "duplicateReason",
            type: "select",
            label: { en: "Reason for Duplicate", hi: "डुप्लिकेट का कारण", mr: "डुप्लिकेटचे कारण" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "duplicate" },
            customValidate: requiredIf({ field: "certificateType", equals: "duplicate" }, "Reason for duplicate is required"),
            options: [
              { value: "lost", label: { en: "Lost", hi: "खो गया", mr: "हरवले" } },
              { value: "damaged", label: { en: "Damaged", hi: "क्षतिग्रस्त", mr: "खराब झाले" } },
              { value: "misplaced", label: { en: "Misplaced", hi: "गुम हो गया", mr: "ठेवले तेथे सापडत नाही" } },
              { value: "other", label: { en: "Other", hi: "अन्य", mr: "इतर" } },
            ],
          },
          {
            id: "originalCertificateNumber",
            type: "text",
            label: { en: "Original Certificate No. (if known)", hi: "मूल प्रमाणपत्र नंबर (यदि ज्ञात)", mr: "मूळ प्रमाणपत्र क्रमांक (माहित असल्यास)" },
            required: false,
            colSpan: 1,
            showIf: { field: "certificateType", equals: "duplicate" },
          },
          {
            id: "policeComplaintFiled",
            type: "select",
            label: { en: "Police Complaint Filed?", hi: "पुलिस शिकायत की है?", mr: "पोलीस तक्रार केली आहे का?" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "duplicate" },
            customValidate: requiredIf({ field: "certificateType", equals: "duplicate" }, "Please select Police Complaint Filed"),
            options: [
              { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
              { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } },
            ],
          },
          {
            id: "affidavitProvided",
            type: "select",
            label: { en: "Affidavit Provided?", hi: "शपथपत्र दिया है?", mr: "शपथपत्र दिले आहे का?" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "duplicate" },
            customValidate: requiredIf({ field: "certificateType", equals: "duplicate" }, "Please select Affidavit Provided"),
            options: [
              { value: "yes", label: { en: "Yes", hi: "हाँ", mr: "होय" } },
              { value: "no", label: { en: "No", hi: "नहीं", mr: "नाही" } },
            ],
          },

          // ---------- Migration ----------
          {
            id: "lastExamPassed",
            type: "text",
            label: { en: "Last Exam Passed", hi: "अंतिम परीक्षा उत्तीर्ण", mr: "शेवटची उत्तीर्ण परीक्षा" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "migration" },
            customValidate: requiredIf({ field: "certificateType", equals: "migration" }, "Last Exam Passed is required"),
          },
          {
            id: "seatOrRegNo",
            type: "text",
            label: { en: "Seat No / Registration No", hi: "सीट नं / पंजीकरण नं", mr: "सीट नं / नोंदणी नं" },
            colSpan: 1,
            showIf: { field: "certificateType", equals: "migration" },
            customValidate: requiredIf({ field: "certificateType", equals: "migration" }, "Seat No / Registration No is required"),
          },
          {
            id: "destinationInstituteName",
            type: "text",
            label: { en: "Destination Institute (optional)", hi: "गंतव्य संस्था (वैकल्पिक)", mr: "जाण्याची संस्था (ऐच्छिक)" },
            required: false,
            colSpan: 1,
            showIf: { field: "certificateType", equals: "migration" },
          },
        ],
      },

      // ---------------- Declaration ----------------
      {
        id: "declaration",
        title: { en: "Declaration", hi: "घोषणा", mr: "घोषणापत्र" },
        fields: [...declarationField()],
      },
    ],

    documents: [
      {
        id: "studentIdProof",
        label: { en: "Student ID Proof", hi: "छात्र पहचान प्रमाण", mr: "विद्यार्थी ओळख पुरावा" },
        description: { en: "Aadhaar Card/Birth Certificate", hi: "आधार कार्ड/जन्म प्रमाणपत्र", mr: "आधार कार्ड/जन्म दाखला" },
        required: true,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
      {
        id: "lastMarksheet",
        label: { en: "Last Marksheet/Report Card", hi: "अंतिम मार्कशीट/रिपोर्ट कार्ड", mr: "शेवटची मार्कशीट/रिपोर्ट कार्ड" },
        description: { en: "Previous year marksheet or progress report", hi: "पिछले वर्ष की मार्कशीट या प्रगति रिपोर्ट", mr: "मागील वर्षाची मार्कशीट किंवा प्रगती अहवाल" },
        required: true,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
      {
        id: "parentIdProof",
        label: { en: "Parent/Guardian ID Proof", hi: "माता-पिता/अभिभावक पहचान प्रमाण", mr: "पालक ओळख पुरावा" },
        description: { en: "Aadhaar/PAN/Voter ID", hi: "आधार/पैन/वोटर आईडी", mr: "आधार/पॅन/मतदार ओळखपत्र" },
        required: true,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },

      // Optional docs for duplicate use-case (you can enforce required in UI later if needed)
      {
        id: "policeComplaintCopy",
        label: { en: "Police Complaint / FIR Copy", hi: "पुलिस शिकायत / एफआईआर कॉपी", mr: "पोलीस तक्रार / FIR कॉपी" },
        description: { en: "Upload if police complaint/FIR is filed", hi: "यदि एफआईआर/शिकायत की है तो अपलोड करें", mr: "FIR/तक्रार केली असल्यास अपलोड करा" },
        required: false,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
      {
        id: "affidavitCopy",
        label: { en: "Affidavit (Notarized)", hi: "शपथपत्र (नोटरी)", mr: "शपथपत्र (नोटरी)" },
        description: { en: "Upload for duplicate certificate request", hi: "डुप्लिकेट के लिए अपलोड करें", mr: "डुप्लिकेटसाठी अपलोड करा" },
        required: false,
        acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png"],
        maxSize: 5,
      },
    ],
  },
};
