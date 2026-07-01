export interface RTSServiceDetail {
  id: string;
  sla: { mr: string; hi: string; en: string };
  fees: { mr: string; hi: string; en: string };
  officer: { mr: string; hi: string; en: string };
  documents: { mr: string[]; hi: string[]; en: string[] };
}

export const rtsServiceDetails: Record<string, RTSServiceDetail> = {
  // --- Town Planning ---
  "7200": {
    id: "7200",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "नगररचनाकार", hi: "नगर नियोजक", en: "Town Planner" },
    documents: {
      mr: [
        "योग्य प्रकारे भरलेले अर्ज",
        "कर पावती चालू वर्षाची",
        "मंजूर नकाशाची प्रत",
        "7/12 / खरेदी प्रत",
        "भाडे करार (जागा भाड्याची असल्यास)"
      ],
      hi: [
        "उचित रूप से भरा हुआ आवेदन",
        "चालू वर्ष की टैक्स रसीद",
        "स्वीकृत मानचित्र की प्रति",
        "7/12 / बिक्री विलेख प्रति",
        "किराया नामा (यदि जगह किराए पर हो)"
      ],
      en: [
        "Properly filled application form",
        "Current year tax receipt",
        "Copy of approved plan/map",
        "7/12 extract or purchase deed copy",
        "Rent agreement (if premises on rent)"
      ]
    }
  },
  "7201": {
    id: "7201",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "नगररचनाकार", hi: "नगर नियोजक", en: "Town Planner" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "रस्ता पुनर्स्थापन करार"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "सड़क बहाली अनुबंध"],
      en: ["Properly filled application form", "Road restoration agreement"]
    }
  },
  "7207": {
    id: "7207",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "नगररचनाकार", hi: "नगर नियोजक", en: "Town Planner" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "7/12 चा उतारा / सिटी सर्व्हेचा उतारा"],
      hi: ["निर्धारित प्रारूप में आवेदन", "7/12 का उद्धरण / सिटी सर्वे का उद्धरण"],
      en: ["Application in prescribed format", "7/12 extract / City Survey extract"]
    }
  },
  "7208": {
    id: "7208",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "नगररचनाकार", hi: "नगर नियोजक", en: "Town Planner" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "7/12 चा उतारा / सिटी सर्व्हेचा उतारा", "मोजणी नकाशा / सिटी सर्व्हे नकाशा"],
      hi: ["निर्धारित प्रारूप में आवेदन", "7/12 का उद्धरण / सिटी सर्वे का उद्धरण", "मापन मानचित्र / सिटी सर्वे मानचित्र"],
      en: ["Application in prescribed format", "7/12 extract / City Survey extract", "Measurement map / City Survey map"]
    }
  },
  "7209": {
    id: "7209",
    sla: { mr: "60 दिवस", hi: "60 दिन", en: "60 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "नगररचनाकार", hi: "नगर नियोजक", en: "Town Planner" },
    documents: {
      mr: [
        "विहीत नमुन्यातील अर्ज",
        "वास्तुविशारदाचा दाखला",
        "मालकी हक्काची कागदपत्रे",
        "बांधकाम आराखडा नकाशा",
        "प्रती",
        "मंजुर रेखांकनाची प्रत"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन",
        "वास्तुकार का प्रमाण पत्र",
        "स्वामित्व के दस्तावेज",
        "भवन निर्माण योजना मानचित्र",
        "प्रतियां",
        "स्वीकृत लेआउट की प्रति"
      ],
      en: [
        "Application in prescribed format",
        "Architect certificate",
        "Ownership documents",
        "Building construction plan map",
        "Copies",
        "Copy of approved layout"
      ]
    }
  },
  "7210": {
    id: "7210",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "सहा. नगररचनाकार", hi: "सहायक नगर नियोजक", en: "Assistant Town Planner" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "बांधकाम आरंभ प्रमाणपत्र"],
      hi: ["निर्धारित प्रारूप में आवेदन", "भवन निर्माण प्रारंभ प्रमाणपत्र"],
      en: ["Application in prescribed format", "Commencement certificate"]
    }
  },
  "7211": {
    id: "7211",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "सहा. नगररचनाकार", hi: "सहायक नगर नियोजक", en: "Assistant Town Planner" },
    documents: {
      mr: [
        "विहीत नमुन्यातील अर्ज",
        "बांधकाम आरंभ प्रमाणपत्र",
        "जोते प्रमाणपत्र",
        "घरमालक/वास्तुविशारद यांचे पुर्णत्वाचे स्वयं घोषणापत्र"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन",
        "भवन निर्माण प्रारंभ प्रमाणपत्र",
        "प्लिंथ प्रमाण पत्र",
        "मकान मालिक/वास्तुकार का पूर्णता स्व-घोषणा पत्र"
      ],
      en: [
        "Application in prescribed format",
        "Commencement certificate",
        "Plinth certificate",
        "Self-declaration certificate of completion by Owner/Architect"
      ]
    }
  },

  // --- Trade License ---
  "7190": {
    id: "7190",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },
  "7191": {
    id: "7191",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },
  "7192": {
    id: "7192",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },
  "7193": {
    id: "7193",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },
  "7194": {
    id: "7194",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },
  "7195": {
    id: "7195",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },
  "7196": {
    id: "7196",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },
  "7197": {
    id: "7197",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज"],
      hi: ["उचित रूप से भरा हुआ आवेदन"],
      en: ["Properly filled application form"]
    }
  },
  "7198": {
    id: "7198",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज"],
      hi: ["उचित रूप से भरा हुआ आवेदन"],
      en: ["Properly filled application form"]
    }
  },
  "7199": {
    id: "7199",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "अधिक्षक (कर व बाजार वसुली विभाग)", hi: "अधीक्षक (कर और बाजार वसूली विभाग)", en: "Superintendent (Tax and Market Recovery Dept)" },
    documents: {
      mr: ["योग्य प्रकारे भरलेले अर्ज", "कोणतीही थकबाकी नसल्याचे प्रमाणपत्र"],
      hi: ["उचित रूप से भरा हुआ आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Properly filled application form", "No dues certificate"]
    }
  },

  // --- Fire Department ---
  "7202": {
    id: "7202",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "अधिनियम 2006 अग्निशमन सेवा फीनुसार दर", hi: "अधिनियम 2006 अग्निशमन सेवा शुल्क के अनुसार दर", en: "As per Fire Prevention Act 2006 Fee Schedule" },
    officer: { mr: "सहा. अग्निशमन अधिकारी", hi: "सहायक अग्निशमन अधिकारी", en: "Assistant Fire Officer" },
    documents: {
      mr: [
        "विहीत नमुन्यातील अर्ज",
        "थकबाकी नसल्याची दाखला",
        "वास्तुशिल्पकार यांचा अर्ज",
        "आग प्रतिबंधक उपाययोजनाबाबत रुपरेषा",
        "कॅपिटेशन फि"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन",
        "कोई बकाया नहीं होने का प्रमाण पत्र",
        "वास्तुकार का आवेदन",
        "अग्नि सुरक्षा उपायों की रूपरेखा",
        "कैपिटेशन शुल्क"
      ],
      en: [
        "Application in prescribed format",
        "No dues certificate",
        "Architect application/letter",
        "Fire prevention scheme layout",
        "Capitation fee receipt"
      ]
    }
  },
  "7203": {
    id: "7203",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "अधिनियम 2006 अग्निशमन सेवा फीनुसार दर", hi: "अधिनियम 2006 अग्निशमन सेवा शुल्क के अनुसार दर", en: "As per Fire Prevention Act 2006 Fee Schedule" },
    officer: { mr: "सहा. अग्निशमन अधिकारी", hi: "सहायक अग्निशमन अधिकारी", en: "Assistant Fire Officer" },
    documents: {
      mr: [
        "विहीत नमुन्यातील अर्ज",
        "थकबाकी नसल्याची दाखला",
        "वास्तुशिल्पकार यांचा अर्ज",
        "अग्निशमन यंत्रणा उभारणी केल्याचे प्रमाणपत्र",
        "लायसन्स एजन्सी यांचे नमुना अ प्रमाणपत्र",
        "विकासक/सोसायटी यांचे हमीपत्र"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन",
        "कोई बकाया नहीं होने का प्रमाण पत्र",
        "वास्तुकार का आवेदन",
        "अग्निशमन प्रणाली स्थापना का प्रमाण पत्र",
        "लाइसेंस प्राप्त एजेंसी का प्रारूप 'क' प्रमाण पत्र",
        "डेवलपर/सोसायटी का वचन पत्र"
      ],
      en: [
        "Application in prescribed format",
        "No dues certificate",
        "Architect application/letter",
        "Fire-fighting system installation certificate",
        "Form A certificate from licensed agency",
        "Undertaking from Developer/Society to maintain fire systems"
      ]
    }
  },

  // --- Birth, Death & Marriage ---
  "7204": {
    id: "7204",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर - 10 रु.", hi: "नगर निगम स्तर पर निर्धारित दर - 10 रु.", en: "Municipal Corporation Rates - 10 Rs." },
    officer: { mr: "वैद्यकिय आरोग्य विभाग (उपनिबंधक)", hi: "चिकित्सा स्वास्थ्य विभाग (उप-रजिस्ट्रार)", en: "Medical Health Department (Deputy Registrar)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7205": {
    id: "7205",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर - 10 रु.", hi: "नगर निगम स्तर पर निर्धारित दर - 10 रु.", en: "Municipal Corporation Rates - 10 Rs." },
    officer: { mr: "वैद्यकिय आरोग्य विभाग (उपनिबंधक)", hi: "चिकित्सा स्वास्थ्य विभाग (उप-रजिस्ट्रार)", en: "Medical Health Department (Deputy Registrar)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7121": {
    id: "7121",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वैद्यकिय आरोग्य विभाग (निबंधक)", hi: "चिकित्सा स्वास्थ्य विभाग (रजिस्ट्रार)", en: "Medical Health Department (Registrar)" },
    documents: {
      mr: [
        "विहीत नमुन्यातील अर्ज",
        "वास्तवाचा पुरावा",
        "वयाचा पुरावा",
        "विवाहासाठी उपस्थित साक्षीदाराचे स्वयं घोषणापत्र",
        "९० दिवसानंतर नोंदणी असल्यास स्वयं घोषणापत्र"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन",
        "निवास का प्रमाण",
        "आयु का प्रमाण",
        "विवाह में उपस्थित गवाहों का स्व-घोषणा पत्र",
        "90 दिनों के बाद पंजीकरण होने पर स्व-घोषणा पत्र"
      ],
      en: [
        "Application in prescribed format",
        "Proof of residence",
        "Proof of age",
        "Self-declaration from wedding witnesses",
        "Self-declaration if registration is after 90 days"
      ]
    }
  },

  // --- Property Tax ---
  "7176": {
    id: "7176",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "भोगवटा प्रमाणपत्र"],
      hi: ["निर्धारित प्रारूप में आवेदन", "भोगवटा प्रमाण पत्र (Occupancy Certificate)"],
      en: ["Application in prescribed format", "Occupancy Certificate"]
    }
  },
  "7177": {
    id: "7177",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7178": {
    id: "7178",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7179": {
    id: "7179",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7180": {
    id: "7180",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7181": {
    id: "7181",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7182": {
    id: "7182",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7183": {
    id: "7183",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला", "मालकी हक्काची कागदपत्रे (खरेदीखत/बक्षीसपत्र इ.)"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र", "स्वामित्व दस्तावेज (बिक्री विलेख/उपहार विलेख आदि)"],
      en: ["Application in prescribed format", "No dues certificate", "Ownership documents (Purchase/Gift deed etc.)"]
    }
  },
  "7184": {
    id: "7184",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7271": {
    id: "7271",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर - 25 रु.", hi: "नगर निगम स्तर पर निर्धारित दर - 25 रु.", en: "Municipal Corporation Rates - 25 Rs." },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7186": {
    id: "7186",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "विनामुल्य", hi: "नि: शुल्क", en: "Free" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7187": {
    id: "7187",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला", "दस्ताएवजाची प्रत (खरेदीखत, बक्षिसपत्र, वाटणीपत्र इ.)"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र", "दस्तावेज़ की प्रति (बिक्री विलेख, उपहार विलेख, विभाजन विलेख आदि)"],
      en: ["Application in prescribed format", "No dues certificate", "Copy of Deed/document (Sale deed, Gift deed, Partition deed etc.)"]
    }
  },
  "7188": {
    id: "7188",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला", "वारसा हक्क प्रमाणपत्र"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र", "उत्तराधिकार प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate", "Inheritance / Legal heir certificate"]
    }
  },
  "7189": {
    id: "7189",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "वरिष्ठ लिपीक (मालमत्ता कर विभाग)", hi: "वरिष्ठ लिपिक (संपत्ति कर विभाग)", en: "Senior Clerk (Property Tax Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "मालकी हक्काची कागदपत्रे", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "स्वामित्व के दस्तावेज", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "Ownership documents", "No dues certificate"]
    }
  },

  // --- Water Supply ---
  "7174": {
    id: "7174",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "प्रशासकिय ठराव क्र. 31 दि. 10-12-2011 अन्वये निश्चित दर", hi: "प्रशासनिक संकल्प संख्या 31 दिनांक 10-12-2011 के अनुसार दर", en: "As per administrative resolution no. 31 dated 10-12-2011" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "जागा मालकी कागदपत्रे", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "स्वामित्व दस्तावेज़", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "Property ownership documents", "No dues certificate"]
    }
  },
  "7175": {
    id: "7175",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "प्रशासकिय ठराव क्र. 31 दि. 10-12-2011 अन्वये निश्चित दर", hi: "प्रशासनिक संकल्प संख्या 31 दिनांक 10-12-2011 के अनुसार दर", en: "As per administrative resolution no. 31 dated 10-12-2011" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "जागा मालकी कागदपत्रे", "जागा मालकी कागदपत्रे (खरेदी छायांकित प्रत)", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "स्वामित्व दस्तावेज़", "स्वामित्व दस्तावेज़ (बिक्री विलेख छायाप्रति)", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "Property ownership documents", "Ownership documents (photocopy of deed)", "No dues certificate"]
    }
  },
  "7162": {
    id: "7162",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7163": {
    id: "7163",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7164": {
    id: "7164",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7165": {
    id: "7165",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7166": {
    id: "7166",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7167": {
    id: "7167",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "No dues certificate"]
    }
  },
  "7168": {
    id: "7168",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "शैक्षणिक अर्हतेबाबतचे प्रमाणपत्र", "थकबाकी नसल्याचा दाखला"],
      hi: ["निर्धारित प्रारूप में आवेदन", "शैक्षणिक योग्यता प्रमाण पत्र", "कोई बकाया नहीं होने का प्रमाण पत्र"],
      en: ["Application in prescribed format", "Educational qualification certificates", "No dues certificate"]
    }
  },
  "7155": {
    id: "7155",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7170": {
    id: "7170",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7171": {
    id: "7171",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7172": {
    id: "7172",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "7173": {
    id: "7173",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "महानगरपालिका स्तरावर निश्चित केलेले दर", hi: "नगर निगम स्तर पर निर्धारित दर", en: "Rates determined at Municipal Corporation level" },
    officer: { mr: "कनिष्ठ अभियंता (पाणीपुरवठा विभाग)", hi: "कनिष्ठ अभियंता (जल आपूर्ति विभाग)", en: "Junior Engineer (Water Supply Dept)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },

  // --- Education ---
  "8273": {
    id: "8273",
    sla: { mr: "3 दिवस", hi: "3 दिन", en: "3 Days" },
    fees: { mr: "२५ रुपये", hi: "25 रुपये", en: "25 Rs." },
    officer: { mr: "संबंधित शाळेचे मुख्याध्यापक", hi: "संबंधित स्कूल के प्रधानाध्यापक", en: "Concerned School Headmaster" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "8274": {
    id: "8274",
    sla: { mr: "15 दिवस", hi: "15 दिन", en: "15 Days" },
    fees: { mr: "विनामुल्य", hi: "नि: शुल्क", en: "Free" },
    officer: { mr: "संबंधित शाळेचे मुख्याध्यापक", hi: "संबंधित स्कूल के प्रधानाध्यापक", en: "Concerned School Headmaster" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },
  "8275": {
    id: "8275",
    sla: { mr: "7 दिवस", hi: "7 दिन", en: "7 Days" },
    fees: { mr: "२५ रुपये", hi: "25 रुपये", en: "25 Rs." },
    officer: { mr: "संबंधित शाळेचे मुख्याध्यापक", hi: "संबंधित स्कूल के प्रधानाध्यापक", en: "Concerned School Headmaster" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज"],
      hi: ["निर्धारित प्रारूप में आवेदन"],
      en: ["Application in prescribed format"]
    }
  },

  // --- Nursing Homes & Halls ---
  "8270": {
    id: "8270",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "३५०० रुपये (५ खाटा)", hi: "3500 रुपये (5 बेड)", en: "3500 Rs. (5 Beds)" },
    officer: { mr: "वैद्यकीय आरोग्य अधिकारी", hi: "चिकित्सा स्वास्थ्य अधिकारी", en: "Medical Health Officer" },
    documents: {
      mr: [
        "रुग्णालयाचा नकाशा",
        "अग्निशमन प्रमाणपत्र",
        "एएनएम/जीएनएम यांचे प्रमाणपत्र",
        "इलेक्ट्रीक ऑडीट",
        "अँब्युलंस (MOU)",
        "रेट बोर्ड दर्शनिय भागात लावणे",
        "MMC रजिस्ट्रेशन प्रमाणपत्र"
      ],
      hi: [
        "अस्पताल का नक्शा/मानचित्र",
        "अग्निशमन एनओसी प्रमाणपत्र",
        "एएनएम/जीएनएम प्रमाण पत्र",
        "इलेक्ट्रिकल ऑडिट",
        "एम्बुलेंस (MOU)",
        "विशिष्ट स्थानों पर रेट बोर्ड लगाना",
        "एमएमसी पंजीकरण प्रमाणपत्र"
      ],
      en: [
        "Hospital plan/map",
        "Fire department NOC",
        "ANM/GNM certificates",
        "Electrical safety audit report",
        "Ambulance service MoU",
        "Display rate board prominently",
        "MMC registration certificate"
      ]
    }
  },
  "8271": {
    id: "8271",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "२५% वाढीव शुल्कासह शुल्क आकारणे", hi: "25% अतिरिक्त शुल्क के साथ शुल्क", en: "Fee with 25% additional charge" },
    officer: { mr: "वैद्यकीय आरोग्य अधिकारी", hi: "चिकित्सा स्वास्थ्य अधिकारी", en: "Medical Health Officer" },
    documents: {
      mr: [
        "विहीत नमुन्यात अर्ज - मागील वर्षाचे प्रमाणपत्र",
        "MMC रजिस्ट्रेशन प्रमाणपत्र",
        "रुग्णालयाचा नकाशा",
        "अग्निशमन प्रमाणपत्र",
        "एएनएम/जीएनएम यांचे प्रमाणपत्र",
        "इलेक्ट्रीक ऑडीट",
        "अँब्युलंस (MOU)"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन - पिछले वर्ष का प्रमाण पत्र",
        "एमएमसी पंजीकरण प्रमाणपत्र",
        "अस्पताल का नक्शा/मानचित्र",
        "अग्निशमन एनओसी प्रमाणपत्र",
        "एएनएम/जीएनएम प्रमाण पत्र",
        "इलेक्ट्रिकल ऑडिट",
        "एम्बुलेंस (MOU)"
      ],
      en: [
        "Application in prescribed format with previous license copy",
        "MMC registration certificate",
        "Hospital plan/map",
        "Fire department NOC",
        "ANM/GNM certificates",
        "Electrical safety audit report",
        "Ambulance service MoU"
      ]
    }
  },
  "8272": {
    id: "8272",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "निरंक", hi: "नि: शुल्क", en: "Free" },
    officer: { mr: "वैद्यकीय आरोग्य अधिकारी", hi: "चिकित्सा स्वास्थ्य अधिकारी", en: "Medical Health Officer" },
    documents: {
      mr: ["संचालकाचे संमतीपत्र", "पदवीची सत्यप्रत आणि मुळ दाखला"],
      hi: ["निदेशक का सहमति पत्र", "डिग्री की सत्यापित प्रति और मूल प्रमाण पत्र"],
      en: ["Consent letter from Director/Owner", "Certified copy of degree and original license"]
    }
  },
  "8266": {
    id: "8266",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "१५० रु. ते ३००० रुपये पर्यंत", hi: "150 रु. से 3000 रुपये तक", en: "From 150 Rs. to 3000 Rs." },
    officer: { mr: "अधिक्षक (मालमत्ता कर व बाजार परवाना विभाग)", hi: "अधीक्षक (संपत्ति कर और बाजार लाइसेंस विभाग)", en: "Superintendent (Property Tax & Market License)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "शासन वेळोवेळी विहीत करील अशी आवश्यक कागदपत्रे"],
      hi: ["निर्धारित प्रारूप में आवेदन", "सरकार द्वारा समय-समय पर निर्धारित आवश्यक दस्तावेज"],
      en: ["Application in prescribed format", "Documents mandated by Govt from time to time"]
    }
  },
  "8267": {
    id: "8267",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "१५० रु. ते ३००० रुपये पर्यंत", hi: "150 रु. से 3000 रुपये तक", en: "From 150 Rs. to 3000 Rs." },
    officer: { mr: "अधिक्षक (मालमत्ता कर व बाजार परवाना विभाग)", hi: "अधीक्षक (संपत्ति कर और बाजार लाइसेंस विभाग)", en: "Superintendent (Property Tax & Market License)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "शासन वेळोवेळी विहीत करील अशी आवश्यक कागदपत्रे"],
      hi: ["निर्धारित प्रारूप में आवेदन", "सरकार द्वारा समय-समय पर निर्धारित आवश्यक दस्तावेज"],
      en: ["Application in prescribed format", "Documents mandated by Govt from time to time"]
    }
  },
  "8268": {
    id: "8268",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "२००० रु.", hi: "2000 रु.", en: "2000 Rs." },
    officer: { mr: "अधिक्षक (मालमत्ता कर व बाजार परवाना विभाग)", hi: "अधीक्षक (संपत्ति कर और बाजार लाइसेंस विभाग)", en: "Superintendent (Property Tax & Market License)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "शासन वेळोवेळी विहीत करील अशी आवश्यक कागदपत्रे"],
      hi: ["निर्धारित प्रारूप में आवेदन", "सरकार द्वारा समय-समय पर निर्धारित आवश्यक दस्तावेज"],
      en: ["Application in prescribed format", "Documents mandated by Govt from time to time"]
    }
  },
  "8269": {
    id: "8269",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "२००० रु.", hi: "2000 रु.", en: "2000 Rs." },
    officer: { mr: "अधिक्षक (मालमत्ता कर व बाजार परवाना विभाग)", hi: "अधीक्षक (संपत्ति कर और बाजार लाइसेंस विभाग)", en: "Superintendent (Property Tax & Market License)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "शासन वेळोवेळी विहीत करील अशी आवश्यक कागदपत्रे"],
      hi: ["निर्धारित प्रारूप में आवेदन", "सरकार द्वारा समय-समय पर निर्धारित आवश्यक दस्तावेज"],
      en: ["Application in prescribed format", "Documents mandated by Govt from time to time"]
    }
  },

  // --- Hawkers ---
  "8278": {
    id: "8278",
    sla: { mr: "30 दिवस", hi: "30 दिन", en: "30 Days" },
    fees: { mr: "शासनाच्या सूचनांनुसार निश्चित केलेले शुल्क", hi: "सरकारी निर्देशों के अनुसार निर्धारित शुल्क", en: "Fees as per Govt notifications" },
    officer: { mr: "शहर प्रकल्प अधिकारी (NULM)", hi: "शहर परियोजना अधिकारी (NULM)", en: "City Project Officer (NULM)" },
    documents: {
      mr: ["विहीत नमुन्यातील अर्ज", "शासन वेळोवेळी विहीत करील अशी आवश्यक कागदपत्रे"],
      hi: ["निर्धारित प्रारूप में आवेदन", "सरकार द्वारा समय-समय पर निर्धारित आवश्यक दस्तावेज"],
      en: ["Application in prescribed format", "Documents mandated by Govt from time to time"]
    }
  },

  // --- OFC ---
  "8277": {
    id: "8277",
    sla: { mr: "60 ते 90 दिवस", hi: "60 से 90 दिन", en: "60 to 90 Days" },
    fees: { mr: "Schedule IV नुसार लांबी व रुंदी प्रमाणे दर निश्चित शुल्क", hi: "Schedule IV के अनुसार लंबाई और चौड़ाई के अनुसार निर्धारित शुल्क", en: "Fees as per length & width under Schedule IV guidelines" },
    officer: { mr: "कार्यकारी अभियंता, बांधकाम विभाग", hi: "अधिशाषी अभियंता, निर्माण विभाग", en: "Executive Engineer, Construction Dept" },
    documents: {
      mr: [
        "विहीत नमुन्यातील अर्ज",
        "नगर विकास शासन निर्णय दि. १९-१२-२०२२ मधील Schedule III नुसार आवश्यक कागदपत्रे",
        "शासन वेळोवेळी विहीत करील अशी आवश्यक कागदपत्रे"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन",
        "नगर विकास सरकारी संकल्प दिनांक 19-12-2022 के Schedule III के अनुसार आवश्यक दस्तावेज",
        "सरकार द्वारा समय-समय पर निर्धारित आवश्यक दस्तावेज"
      ],
      en: [
        "Application in prescribed format",
        "Documents as per Schedule III of UD resolution dated 19-12-2022",
        "Documents mandated by Govt from time to time"
      ]
    }
  },

  // --- Tree Cutting ---
  "8276": {
    id: "8276",
    sla: { mr: "45 दिवस", hi: "45 दिन", en: "45 Days" },
    fees: { mr: "२००० रुपये", hi: "2000 रुपये", en: "2000 Rs." },
    officer: { mr: "सहा. आयुक्त तथा वृक्ष अधिकारी", hi: "सहायक आयुक्त तथा वृक्ष अधिकारी", en: "Assistant Commissioner & Tree Officer" },
    documents: {
      mr: [
        "विहीत नमुन्यातील अर्ज",
        "जागेच्या मालकी हक्कासंबंधी आवश्यक कागदपत्रे",
        "मंजुर बांधकाम नकाशा (असल्यास)",
        "तोडावयाच्या वृक्षाचे फोटो"
      ],
      hi: [
        "निर्धारित प्रारूप में आवेदन",
        "स्वामित्व का दस्तावेज",
        "स्वीकृत निर्माण नक्शा (यदि हो)",
        "काटे जाने वाले वृक्ष का फोटो"
      ],
      en: [
        "Application in prescribed format",
        "Land/property ownership documents",
        "Approved construction plan copy (if applicable)",
        "Photographs of the tree to be cut"
      ]
    }
  },

  // --- Civic Amenities ---
  "9001": {
    id: "9001",
    sla: { mr: "5 दिवस", hi: "5 दिन", en: "5 Days" },
    fees: { mr: "स्थानिक स्तरावर निश्चित केलेले शुल्क / मोफत", hi: "स्थानीय स्तर पर निर्धारित शुल्क / नि: शुल्क", en: "Locally determined fees / Free" },
    officer: { mr: "सहायक आयुक्त / विभाग प्रमुख", hi: "सहायक आयुक्त / विभाग प्रमुख", en: "Assistant Commissioner / Dept Head" },
    documents: {
      mr: ["पुराव्यासह अर्ज (उदा. जीओ-टँग केलेले फोटो)"],
      hi: ["साक्ष्य के साथ आवेदन (जैसे जियो-टैग किया गया फोटो)"],
      en: ["Application with proof (e.g., Geo-tagged photographs)"]
    }
  },
  "9002": {
    id: "9002",
    sla: { mr: "5 दिवस", hi: "5 दिन", en: "5 Days" },
    fees: { mr: "स्थानिक स्तरावर निश्चित केलेले शुल्क / मोफत", hi: "स्थानीय स्तर पर निर्धारित शुल्क / नि: शुल्क", en: "Locally determined fees / Free" },
    officer: { mr: "सहायक आयुक्त / विभाग प्रमुख", hi: "सहायक आयुक्त / विभाग प्रमुख", en: "Assistant Commissioner / Dept Head" },
    documents: {
      mr: ["पुराव्यासह अर्ज (उदा. जीओ-टँग केलेले फोटो)"],
      hi: ["साक्ष्य के साथ आवेदन (जैसे जियो-टैग किया गया फोटो)"],
      en: ["Application with proof (e.g., Geo-tagged photographs)"]
    }
  },
  "8255": {
    id: "8255",
    sla: { mr: "1 दिवस", hi: "1 दिन", en: "1 Day" },
    fees: { mr: "स्थानिक स्तरावर निश्चित केलेले शुल्क / मोफत", hi: "स्थानीय स्तर पर निर्धारित शुल्क / नि: शुल्क", en: "Locally determined fees / Free" },
    officer: { mr: "सहायक आयुक्त / विभाग प्रमुख", hi: "सहायक आयुक्त / विभाग प्रमुख", en: "Assistant Commissioner / Dept Head" },
    documents: {
      mr: ["पुराव्यासह अर्ज (उदा. जीओ-टँग केलेले फोटो)"],
      hi: ["साक्ष्य के साथ आवेदन (जैसे जियो-टैग किया गया फोटो)"],
      en: ["Application with proof (e.g., Geo-tagged photographs)"]
    }
  }
};
