
// src/data/departments.ts
export type SupportedLanguage = "en" | "hi" | "mr";

export type I18nText = {
  en: string;
  hi?: string;
  mr?: string;
};

export type Service = {
  id: string;
  name: I18nText;
  icon: string;
  color?: string;
};

export type Department = {
  id: string;
  name: I18nText;
  icon: string;
  image: string;
  services: Service[];
};

export const departments: Department[] = [
  // -------------------------------------------------
  // BIRTH–DEATH
  // -------------------------------------------------
  {
    id: "birth-death",
    name: { en: "Birth & Death", hi: "जन्म एवं मृत्यु", mr: "जन्म आणि मृत्यू" },
    icon: "HeartPulse",
    image:
      "https://images.unsplash.com/photo-1613587261040-f2faa7e5bf23?w=800",
    services: [
      {
        id: "7204",
        name: { en: "Birth Certificate", hi: "जन्म प्रमाणपत्र", mr: "जन्म प्रमाणपत्र" },
        icon: "Baby",
        color: "bg-blue-400",
      },
      {
        id: "7205",
        name: { en: "Death Certificate", hi: "मृत्यु प्रमाणपत्र", mr: "मृत्यू प्रमाणपत्र" },
        icon: "HeartOff",
        color: "bg-red-400",
      },
    ],
  },

  // -------------------------------------------------
  // EDUCATION
  // -------------------------------------------------
 {
  id: "education",
  name: { en: "Education", hi: "शिक्षा", mr: "शिक्षण" },
  icon: "GraduationCap",
  image: "https://images.unsplash.com/photo-1739249327281-e918124ac540?w=800",
  services: [
    {
      id: "8273", // Matches Config '8273'
      name: {
        en: "School Leaving / Duplicate Certificate",
        hi: "स्कूल छोड़ने / डुप्लीकेट प्रमाणपत्र",
        mr: "शाळा सोडल्याचा / दुय्यम प्रमाणपत्र",
      },
      icon: "School",
      color: "bg-indigo-400",
    },

    //Uncomment when configs are ready
    // {
    //   id: "8274", // No config yet -> Will show Default Form
    //   name: { en: "Migration Certificate", hi: "माइग्रेशन प्रमाणपत्र", mr: "स्थलांतर प्रमाणपत्र" },
    //   icon: "MoveRight",
    //   color: "bg-orange-400",
    // },
    // {
    //   id: "8275", // No config yet -> Will show Default Form
    //   name: { en: "Duplicate Marksheet", hi: "डुप्लीकेट मार्कशीट", mr: "दुय्यम गुणपत्रक" },
    //   icon: "Award",
    //   color: "bg-yellow-400",
    // },
    ],
  },

  // -------------------------------------------------
  // HEALTH
  // -------------------------------------------------
  {
    id: "health",
    name: { en: "Health", hi: "स्वास्थ्य", mr: "आरोग्य" },
    icon: "Activity",
    image:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800",
    services: [
      {
        id: "8270",
        name: {
          en: "New Nursing Home License",
          hi: "नया नर्सिंग होम लाइसेंस",
          mr: "नवीन नर्सिंग होम परवाना",
        },
        icon: "Hospital",
        color: "bg-emerald-400",
      },
      {
        id: "8271",
        name: {
          en: "Renew Nursing Home License",
          hi: "नर्सिंग होम लाइसेंस नवीनीकरण",
          mr: "नर्सिंग होम परवाना नूतनीकरण",
        },
        icon: "RefreshCw",
        color: "bg-rose-400",
      },
      {
        id: "8272",
        name: {
          en: "Update Licensee / Partner Name",
          hi: "लाइसेंसधारक / पार्टनर नाम अपडेट",
          mr: "परवाना धारक / भागीदार नाव अद्यतन",
        },
        icon: "UserCog",
        color: "bg-slate-400",
      },
    ],
  },

  // -------------------------------------------------
  // MARRIAGE CERTIFICATE
  // -------------------------------------------------
  {
    id: "marriage",
    name: { en: "Marriage Certificate", hi: "विवाह प्रमाणपत्र", mr: "विवाह प्रमाणपत्र" },
    icon: "HeartHandshake",
    image:
      "https://images.unsplash.com/photo-1700062069869-0c59ff21fa3b?w=800",
    services: [
      {
        id: "7121",
        name: {
          en: "Marriage Registration Certificate",
          hi: "विवाह पंजीकरण प्रमाणपत्र",
          mr: "विवाह नोंदणी प्रमाणपत्र",
        },
        icon: "Heart",
        color: "bg-pink-500",
      },
    ],
  },

  // -------------------------------------------------
  // NOC
  // -------------------------------------------------
  {
    id: "noc",
    name: { en: "NOC", hi: "एनओसी", mr: "एनओसी" },
    icon: "ShieldCheck",
    image:
      "https://images.unsplash.com/photo-1761671613933-159512988cb3?w=800",
    services: [
      {
        id: "7200",
        name: {
          en: "Trade / Business Non-Revocation NOC",
          hi: "व्यापार/व्यवसाय नॉन-रिवोकेशन एनओसी",
          mr: "व्यवसाय/व्यापार नॉन-रिवोकेशन एनओसी",
        },
        icon: "Shield",
        color: "bg-orange-400",
      },
      {
        id: "7201",
        name: {
          en: "Mandap No-Damage Certificate",
          hi: "मंडप नुकसान-रहित प्रमाणपत्र",
          mr: "मंडप नुकसान-रहित प्रमाणपत्र",
        },
        icon: "ShieldCheck",
        color: "bg-emerald-400",
      },
      {
        id: "7202",
        name: {
          en: "Fire Extinguisher Certificate",
          hi: "अग्निशामक प्रमाणपत्र",
          mr: "अग्निशामक प्रमाणपत्र",
        },
        icon: "Flame",
        color: "bg-red-400",
      },
      {
        id: "7203",
        name: {
          en: "Final Fire Exemption Certificate",
          hi: "अंतिम अग्नि छूट प्रमाणपत्र",
          mr: "अंतिम अग्नि सूट प्रमाणपत्र",
        },
        icon: "FireExtinguisher",
        color: "bg-cyan-400",
      },
    ],
  },

  // -------------------------------------------------
  // PROPERTY TAX
  // -------------------------------------------------
  {
    id: "property-tax",
    name: { en: "Property Tax", hi: "संपत्ति कर", mr: "मालमत्ता कर" },
    icon: "Home",
    image:
      "https://images.unsplash.com/photo-1689574666545-3f2f9afdf632?w=800",
    services: [
      {
        id: "7176",
        name: { en: "New Taxation", hi: "नया कर निर्धारण", mr: "नवीन करनिर्धारण" },
        icon: "Plus",
        color: "bg-green-500",
      },
      {
        id: "7177",
        name: { en: "Re-Taxation", hi: "पुनः कर निर्धारण", mr: "पुनः करनिर्धारण" },
        icon: "RefreshCcw",
        color: "bg-teal-400",
      },
      {
        id: "7178",
        name: {
          en: "Preparation of Tax Demand Letter",
          hi: "कर मांग पत्र तैयार करना",
          mr: "कर मागणी पत्र तयार करणे",
        },
        icon: "FileText",
        color: "bg-blue-400",
      },
      {
        id: "7271",
        name: {
          en: "Issuance of Property Tax Assessment Copy",
          hi: "संपत्ति कर मूल्यांकन प्रत जारी करना",
          mr: "मालमत्ता कर मूल्यांकन प्रत जारी करणे",
        },
        icon: "CreditCard",
        color: "bg-green-600",
      },
      {
        id: "7179",
        name: {
          en: "Avail Tax Exemption",
          hi: "कर में छूट प्राप्त करना",
          mr: "मालमत्ता करात सूट मिळवणे",
        },
        icon: "BadgePercent",
        color: "bg-purple-400",
      },

      {
        id: "7180",
        name: {
          en: "Tax Exemption for Non-Resident Properties",
          hi: "अनिवासी संपत्तियों के लिए कर छूट",
          mr: "अनिवासी मालमत्तांसाठी कर सूट",
        },
        icon: "HomeIcon",
        color: "bg-indigo-400",
      },
      // {
      //   id: "7181",
      //   name: { en: "New Tax Assessment", hi: "नया कर आकलन", mr: "नवीन कर मूल्यांकन" },
      //   icon: "Calculator",
      //   color: "bg-yellow-500",
      // },
      {
        id: "7182",
        name: { en: "Registration of Objection", hi: "आपत्ति दर्ज करना", mr: "हरकत नोंदणी" },
        icon: "AlertCircle",
        color: "bg-red-400",
      },
      {
        id: "7184",
        name: {
          en: "Property Demolition",
          hi: "संपत्ति तोड़फोड़",
          mr: "मालमत्ता पाडकाम",
        },
        icon: "Hammer",
        color: "bg-slate-500",
      },
      {
        id: "7186",
        name: { en: "No Dues Certificate", hi: "बकाया नहीं प्रमाणपत्र", mr: "थकबाकी नाही प्रमाणपत्र" },
        icon: "CheckCircle",
        color: "bg-emerald-400",
      },
      {
        id: "7187",
        name: {
          en: "Transfer of Property Certificate",
          hi: "संपत्ति हस्तांतरण प्रमाणपत्र",
          mr: "मालमत्ता हस्तांतरण प्रमाणपत्र",
        },
        icon: "ArrowRightLeft",
        color: "bg-cyan-500",
      },
    ],
  },

  // -------------------------------------------------
  // TOWN PLANNING
  // -------------------------------------------------
  {
    id: "town-planning",
    name: { en: "Town Planning", hi: "नगर नियोजन", mr: "नगर नियोजन" },
    icon: "LayoutGrid",
    image:
      "https://images.unsplash.com/photo-1650532924043-ace81d44a7f3?w=800",
    services: [
      {
        id: "7207",
        name: { en: "Issuance of Zone Certificate", hi: "ज़ोन प्रमाणपत्र जारी", mr: "झोन प्रमाणपत्र जारी" },
        icon: "MapPin",
        color: "bg-purple-500",
      },
      {
        id: "7208",
        name: { en: "Giving Part Map", hi: "भाग नक्शा देना", mr: "भाग नकाशा देणे" },
        icon: "Map",
        color: "bg-blue-400",
      },
      {
        id: "7209",
        name: { en: "Issuance of Construction Permit", hi: "निर्माण परवाना जारी", mr: "बांधकाम परवाना जारी" },
        icon: "Building",
        color: "bg-orange-500",
      },
      {
        id: "7210",
        name: { en: "Tillage Certificate", hi: "जुताई प्रमाणपत्र", mr: "नांगरणी प्रमाणपत्र" },
        icon: "Wheat",
        color: "bg-amber-400",
      },
      {
        id: "7211",
        name: { en: "Issuance of Occupancy Certificate", hi: "अधिवास (ओसी) प्रमाणपत्र जारी", mr: "वास्तव्य (ओसी) प्रमाणपत्र जारी" },
        icon: "Key",
        color: "bg-teal-500",
      },
      {
        id: "8277",
        name: { en: "Underground OFC Cable Permission", hi: "भूमिगत OFC केबल अनुमति", mr: "भूमिगत OFC केबल परवानगी" },
        icon: "Cable",
        color: "bg-gray-500",
      },
      {
        id: "9001",
        name: { en: "Filling Potholes on City Roads", hi: "शहर की सड़कों के गड्ढे भरना", mr: "शहर रस्त्यांवरील खड्डे भरणे" },
        icon: "Construction",
        color: "bg-yellow-600",
      },
      {
        id: "9002",
        name: { en: "Maintaining & Securing Sewer Covers", hi: "सीवर कवर्स का रखरखाव व सुरक्षा", mr: "सीवर कव्हर देखभाल व सुरक्षित करणे" },
        icon: "ShieldCheck",
        color: "bg-slate-600",
      },
      {
        id: "9003",
        name: { en: "Road Cutting Permission", hi: "सड़क कटिंग अनुमति", mr: "रस्ता कटिंग परवानगी" },
        icon: "",
        color: "bg-slate-600",
      },
      {
        id: "8279",
        name: { en: "Mobile Tower Permission", hi: "मोबाइल टॉवर अनुमति", mr: "मोबाईल टॉवर परवानगी" },
        icon: "",
        color: "bg-slate-600",
      },
    ],
  },

  // -------------------------------------------------
  // TRADE LICENSE
  // -------------------------------------------------
  {
    id: "trade-license",
    name: { en: "Trade License", hi: "व्यापार परवाना", mr: "व्यवसाय परवाना" },
    icon: "Briefcase",
    image:
      "https://images.unsplash.com/photo-1751759192037-a51efd95a480?w=800",
    services: [
      {
        id: "7190",
        name: { en: "New Trade License", hi: "नया व्यापार परवाना", mr: "नवीन व्यवसाय परवाना" },
        icon: "FilePlus",
        color: "bg-blue-500",
      },
      {
        id: "7191",
        name: { en: "Renew License", hi: "परवाना नवीनीकरण", mr: "परवाना नूतनीकरण" },
        icon: "RefreshCw",
        color: "bg-green-500",
      },
      {
        id: "7192",
        name: { en: "License Transfer", hi: "परवाना हस्तांतरण", mr: "परवाना हस्तांतरण" },
        icon: "ArrowRightLeft",
        color: "bg-orange-400",
      },
      {
        id: "7193",
        name: { en: "Secondary Copy of License", hi: "लाइसेंस की द्वितीय प्रति", mr: "परवान्याची दुय्यम प्रत" },
        icon: "Copy",
        color: "bg-gray-400",
      },
      {
        id: "7194",
        name: { en: "Change of Business Name", hi: "व्यवसाय नाम बदलना", mr: "व्यवसाय नाव बदलणे" },
        icon: "Edit",
        color: "bg-purple-400",
      },
      {
        id: "7195",
        name: { en: "Changing Occupations", hi: "पेशा/व्यवसाय बदलना", mr: "व्यवसाय बदलणे" },
        icon: "Repeat",
        color: "bg-pink-400",
      },
      {
        id: "7197",
        name: { en: "Change in Number of Partners", hi: "साझेदारों की संख्या बदलना", mr: "भागीदारांची संख्या बदलणे" },
        icon: "Users",
        color: "bg-cyan-400",
      },
      {
        id: "7198",
        name: { en: "Cancellation of License", hi: "लाइसेंस रद्द करना", mr: "परवाना रद्द करणे" },
        icon: "XCircle",
        color: "bg-red-500",
      },
      {
        id: "7199",
        name: { en: "Auto Renewal Of Trade License", hi: "व्यापार परवाना ऑटो नवीनीकरण", mr: "व्यवसाय परवाना स्वयं नूतनीकरण" },
        icon: "Bell",
        color: "bg-yellow-500",
      },
      {
        id: "8266",
        name: { en: "Licensing of Lodging Houses", hi: "लॉजिंग हाउस परवाना", mr: "लॉजिंग हाऊस परवाना" },
        icon: "Hotel",
        color: "bg-teal-400",
      },
      {
        id: "8267",
        name: { en: "Renew Lodging House License", hi: "लॉजिंग हाउस परवाना नवीनीकरण", mr: "लॉजिंग हाऊस परवाना नूतनीकरण" },
        icon: "RefreshCw",
        color: "bg-emerald-400",
      },
      {
        id: "8268",
        name: { en: "Licensing of Mangal Office / Auditorium", hi: "मंगल कार्यालय/ऑडिटोरियम परवाना", mr: "मंगल कार्यालय/सभागृह परवाना" },
        icon: "Building2",
        color: "bg-rose-400",
      },
      {
        id: "8269",
        name: { en: "Renew Mangal Office / Hall License", hi: "मंगल कार्यालय/हॉल परवाना नवीनीकरण", mr: "मंगल कार्यालय/हॉल परवाना नूतनीकरण" },
        icon: "RefreshCw",
        color: "bg-fuchsia-400",
      },
      {
        id: "8278",
        name: { en: "Hawker Registration Certificate", hi: "फेरीवाला पंजीकरण प्रमाणपत्र", mr: "फेरीवाला नोंदणी प्रमाणपत्र" },
        icon: "Store",
        color: "bg-orange-500",
      },
      {
        id: "7167",
        name: { en: "Plumbers license", hi: "प्लंबर लाइसेंस", mr: "प्लंबर परवाना" },
        icon: "Wrench",
      },
      {
        id: "7168",
        name: { en: "Plumber License Renewal", hi: "प्लंबर लाइसेंस नवीनीकरण", mr: "प्लंबर परवाना नूतनीकरण" },
        icon: "RefreshCw",
      },
      {
        id: "7169",
        name: {
          en: "Trade License Type Change Request",
          hi: "व्यापार परवाना प्रकार बदलने का अनुरोध",
          mr: "व्यवसाय (प्रकार) बदलणे – फील्ड टेबल",
        },
        icon: "",
      },
      {
        id: "7601",
        name: {
          en: "Movie Shooting License New and Renewal",
          hi: "फिल्म शूटिंग लाइसेंस (नया/नवीनीकरण)",
          mr: "चित्रपट शूटिंग परवाना नवीन आणि नूतनीकरण",
        },
        icon: "",
      },
    ],
  },

  // -------------------------------------------------
  // TREE
  // -------------------------------------------------
  {
    id: "tree",
    name: { en: "Tree", hi: "पेड़", mr: "झाड" },
    icon: "Trees",
    image:
      "https://images.unsplash.com/photo-1645753359575-c51cd95db8f9?w=800",
    services: [
      {
        id: "8276",
        name: {
          en: "Tree Felling Permission (Sec 8)",
          hi: "पेड़ कटाई अनुमति (धारा 8)",
          mr: "झाड तोड परवानगी (कलम 8)",
        },
        icon: "TreeDeciduous",
        color: "bg-green-600",
      },
    ],
  },

  // -------------------------------------------------
  // SANITATION
  // -------------------------------------------------
  {
    id: "sanitation",
    name: { en: "Sanitation", hi: "स्वच्छता", mr: "स्वच्छता" },
    icon: "Trash2",
    image:
      "https://images.unsplash.com/photo-1762805544550-f12a8ebceb2e?w=800",
    services: [
      {
        id: "8255",
        name: {
          en: "Maintaining Manhole / Sewer Covers",
          hi: "मैनहोल/सीवर कवर रखरखाव",
          mr: "मॅनहोल/सीवर कव्हर देखभाल",
        },
        icon: "ShieldCheck",
        color: "bg-gray-500",
      },
      {
        id: "7175",
        name: {
          en: "Providing drainage connections",
          hi: "ड्रेनेज कनेक्शन प्रदान करना",
          mr: "ड्रेनेज जोडणी प्रदान करणे",
        },
        icon: "Unplug",
      },
    ],
  },

  // -------------------------------------------------
  // WATER CONNECTION
  // -------------------------------------------------
  {
    id: "water",
    name: { en: "Water Connection", hi: "जल कनेक्शन", mr: "पाणी जोडणी" },
    icon: "Droplets",
    image:
      "https://images.unsplash.com/photo-1606214554814-e8a9f97bdbb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGRyb3AlMjBjbGVhbnxlbnwxfHx8fDE3NjMxOTgxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    services: [
      {
        id: "7162",
        name: { en: "Changing the connection size", hi: "कनेक्शन का आकार बदलना", mr: "जोडणीचा आकार बदलणे" },
        icon: "Settings",
      },
      {
        id: "7163",
        name: { en: "Temporary / permanent disconnection", hi: "अस्थायी / स्थायी विच्छेदन", mr: "तात्पुरते / कायम खंडन" },
        icon: "PowerOff",
      },
      {
        id: "7164",
        name: { en: "To Reconnect", hi: "पुनः कनेक्ट करना", mr: "पुन्हा जोडणी करणे" },
        icon: "Power",
      },
      {
        id: "7165",
        name: { en: "Change in use", hi: "उपयोग में बदलाव", mr: "वापरात बदल" },
        icon: "ArrowLeftRight",
      },
      {
        id: "7166",
        name: { en: "Preparation of water bill", hi: "पानी बिल की तैयारी", mr: "पाणी बिल तयारी" },
        icon: "Receipt",
      },
      {
        id: "7155",
        name: { en: "Certificate of no arrears", hi: "बकाया न होने का प्रमाणपत्र", mr: "थकबाकी नसल्याचे प्रमाणपत्र" },
        icon: "CheckCircle",
      },
      {
        id: "7170",
        name: { en: "Reporting faulty meters", hi: "दोषपूर्ण मीटर की रिपोर्ट करना", mr: "सदोष मीटर अहवाल देणे" },
        icon: "AlertTriangle",
      },
      {
        id: "7171",
        name: { en: "Reporting unauthorized tap connections", hi: "अनधिकृत नल कनेक्शन की रिपोर्ट करना", mr: "अनधिकृत नळ जोडणी अहवाल देणे" },
        icon: "AlertOctagon",
      },
      {
        id: "7172",
        name: { en: "Water pressure capacity complaint", hi: "पानी के दबाव क्षमता शिकायत", mr: "पाणी दाब क्षमता तक्रार" },
        icon: "Gauge",
      },
      {
        id: "7173",
        name: { en: "Water quality complaint", hi: "पानी की गुणवत्ता शिकायत", mr: "पाण्याची गुणवत्ता तक्रार" },
        icon: "Droplet",
      },
      {
        id: "7174",
        name: { en: "To provide a connection", hi: "कनेक्शन प्रदान करना", mr: "जोडणी प्रदान करणे" },
        icon: "Plug",
      },
    ],
  },
];
