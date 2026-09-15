/**
 * Localizes department names and service names for RTS MIS Dashboard based on current locale.
 */

const DEPARTMENT_LOCALIZATIONS: Record<string, { mr: string; hi: string }> = {
  propertytax: { mr: 'मालमत्ता कर', hi: 'संपत्ति कर' },
  propertytaxdepartment: { mr: 'मालमत्ता कर', hi: 'संपत्ति कर' },
  waterconnection: { mr: 'जलजोडणी', hi: 'जल संयोजन' },
  watersupply: { mr: 'पाणी पुरवठा', hi: 'जल आपूर्ति' },
  tradelicense: { mr: 'व्यावसायिक परवाना', hi: 'व्यवसाय लाइसेंस' },
  townplanning: { mr: 'नगर रचना', hi: 'नगर नियोजन' },
  firedepartment: { mr: 'अग्निशमन विभाग', hi: 'अग्निशमन विभाग' },
  healthdepartment: { mr: 'आरोग्य विभाग', hi: 'स्वास्थ्य विभाग' },
  publicworksdepartment: { mr: 'सार्वजनिक बांधकाम विभाग', hi: 'लोक निर्माण विभाग' },
  educationdepartment: { mr: 'शिक्षण विभाग', hi: 'शिक्षा विभाग' },
};

const SERVICE_LOCALIZATIONS: Record<string, { mr: string; hi: string }> = {
  // Property Tax Services
  'new property tax assessment': { mr: 'नव्याने कर आकारणी', hi: 'नया संपत्ति कर निर्धारण' },
  're-assessment of property tax': { mr: 'पुनः कर आकारणी', hi: 'संपत्ति कर पुनर्मूल्यांकन' },
  're assessment of property tax': { mr: 'पुनः कर आकारणी', hi: 'संपत्ति कर पुनर्मूल्यांकन' },
  'preparation of tax demand notice': { mr: 'कराचे मागणी पत्र तयार करणे', hi: 'कर मांग नोटिस तैयार करना' },
  'avail property tax exemption': { mr: 'कर माफी मिळणे', hi: 'संपत्ति कर छूट प्राप्त करना' },
  'tax exemption for non-resident properties': { mr: 'रहिवास नसल्यास मालमत्तांना करात सुट मिळणे', hi: 'अनिवासी संपत्तियों के लिए कर छूट' },
  'tax exemption for nonresident properties': { mr: 'रहिवास नसल्यास मालमत्तांना करात सुट मिळणे', hi: 'अनिवासी संपत्तियों के लिए कर छूट' },
  'property tax self-assessment': { mr: 'स्वयंमुल्यांकन', hi: 'संपत्ति कर स्व-मूल्यांकन' },
  'property tax self assessment': { mr: 'स्वयंमुल्यांकन', hi: 'संपत्ति कर स्व-मूल्यांकन' },
  'registration of objection on tax assessment': { mr: 'आक्षेप नोंदविणे', hi: 'कर निर्धारण पर आपत्ति दर्ज करना' },
  'sub-division of property': { mr: 'उपविभागामध्ये मालमत्ता विभाजन', hi: 'संपत्ति का उप-विभाजन' },
  'sub division of property': { mr: 'उपविभागामध्ये मालमत्ता विभाजन', hi: 'संपत्ति का उप-विभाजन' },
  're-assessment after demolition and reconstruction': { mr: 'मालमत्ता पाडणे व पुनःबांधणी कर आकारणे', hi: 'विध्वंस और पुनर्निर्माण के बाद पुनर्मूल्यांकन' },
  're assessment after demolition and reconstruction': { mr: 'मालमत्ता पाडणे व पुनःबांधणी कर आकारणे', hi: 'विध्वंस और पुनर्निर्माण के बाद पुनर्मूल्यांकन' },
  'issuance of property tax assessment copy (8a)': { mr: 'मालमत्ता कर उतारा देणे', hi: 'संपत्ति कर मूल्यांकन प्रति (8A) जारी करना' },
  'issuance of no dues certificate': { mr: 'थकबाकी नसल्याचा दाखला देणे', hi: 'बकाया नहीं प्रमाणपत्र जारी करना' },
  'property transfer registration certificate': { mr: 'मालमत्ता हस्तांतरण नोंद प्रमाणपत्र देणे', hi: 'संपत्ति हस्तांतरण पंजीकरण प्रमाण पत्र' },
  'change of ownership name': { mr: 'मालकी हक्कात बदल करणे', hi: 'स्वामित्व का नाम बदलना' },

  // Water Connection Services
  'provision of new water tap connection': { mr: 'नळ जोडणी देणे', hi: 'नया नल कनेक्शन' },
  'new water tap connection': { mr: 'नळ जोडणी देणे', hi: 'नया नल कनेक्शन' },
  'changing the water connection size': { mr: 'नळ जोडणी आकारामध्ये बदल करणे', hi: 'नल कनेक्शन का आकार बदलना' },
  'temporary / permanent disconnection of water connection': { mr: 'तात्पुरते/कायमस्वरूपी नळ जोडणी खंडीत करणे', hi: 'अस्थायी/स्थायी जल कनेक्शन विच्छेद' },
  'reconnection of water tap': { mr: 'पुनः जोडणी करणे', hi: 'नल पुनः संयोजन' },
  'water bill no dues certificate': { mr: 'थकबाकी नसल्याचा दाखला', hi: 'जल देयक बकाया नहीं प्रमाणपत्र' },
  'complaint regarding faulty water meter': { mr: 'नादुरुस्त मीटर तक्रार करणे', hi: 'खराब जल मीटर संबंधी शिकायत' },
  'complaint regarding unauthorized water tap connection': { mr: 'अनधिकृत नळ जोडणी तक्रार', hi: 'अनाधिकृत नल कनेक्शन शिकायत' },
  'complaint regarding water quality': { mr: 'पाण्याची गुणवत्ता तक्रार', hi: 'जल गुणवत्ता संबंधी शिकायत' },
  'providing drainage connections': { mr: 'जलनिःसारण जोडणी देणे', hi: 'जल निकासी कनेक्शन प्रदान करना' },
  'issuance of plumber license': { mr: 'प्लंबर परवाना', hi: 'प्लंबर लाइसेंस जारी करना' },
  'renewal of plumber license': { mr: 'प्लंबर परवाना नुतनीकरण करणे', hi: 'प्लंबर लाइसेंस का नवीनीकरण' },

  // Trade License Services
  'obtaining new trade license': { mr: 'नविन परवाना मिळणे', hi: 'नया व्यापार लाइसेंस प्राप्त करना' },
  'renewal of trade license': { mr: 'परवान्याचे नुतनीकरण', hi: 'व्यापार लाइसेंस का नवीनीकरण' },
  'transfer of trade license': { mr: 'परवाना हस्तांतर', hi: 'व्यापार लाइसेंस का हस्तांतरण' },
  'duplicate copy of trade license': { mr: 'परवाना दुय्यम प्रत', hi: 'व्यापार लाइसेंस की दूसरी प्रति' },
  'change of business name / establishment / address': { mr: 'व्यवसायाचे नाव बदलणे/प्रतिष्ठानात/पत्यात बदल', hi: 'व्यवसाय नाम / प्रतिष्ठान / पता बदलना' },
  'change of license holder / partner name': { mr: 'परवाना धारक/भागीदाराचे नाव बदलणे', hi: 'लाइसेंस धारक / भागीदार का नाम बदलना' },
  'change in number of partners (increase/decrease)': { mr: 'भागीदाराच्या संख्येत बदल (वाढ/कमी)', hi: 'भागीदारों की संख्या में परिवर्तन (वृद्धि/कमी)' },
  'notice on renewal of expired license': { mr: 'कालबाह्य परवानासाठी नुतनीकरण सुचना', hi: 'समाप्त लाइसेंस के नवीनीकरण पर नोटिस' },
  'issuance of lodging house license': { mr: 'लॉजिंग हाऊस परवाना देणे', hi: 'लॉजिंग हाउस लाइसेंस जारी करना' },
  'renewal of lodging house license': { mr: 'लॉजिंग हाऊस परवान्याचे नुतनीकरण करणे', hi: 'लॉजिंग हाउस लाइसेंस का नवीनीकरण' },
  'issuance of marriage hall / auditorium license': { mr: 'मंगल कार्यालय/सभागृह वगैरे परवाना देणे', hi: 'विवाह भवन / सभागार लाइसेंस जारी करना' },
  'renewal of marriage hall / auditorium license': { mr: 'मंगल कार्यालय/सभागृह वगैरे परवान्याचे नुतनीकरण करणे', hi: 'विवाह भवन / सभागार लाइसेंस का नवीनीकरण' },

  // Other Common Services
  'birth certificate': { mr: 'जन्म प्रमाणपत्र देणे', hi: 'जन्म प्रमाण पत्र जारी करना' },
  'death certificate': { mr: 'मृत्यु प्रमाणपत्र देणे', hi: 'मृत्यु प्रमाण पत्र जारी करना' },
  'marriage registration certificate': { mr: 'विवाह नोंदणी प्रमाणपत्र देणे', hi: 'विवाह पंजीकरण प्रमाण पत्र जारी करना' },
  'tree felling permission': { mr: 'वृक्षतोड परवानगी देणे', hi: 'पेड़ काटने की अनुमति' },
  'issuance of fire safety noc': { mr: 'अग्निशमन नाहरकत दाखला देणे', hi: 'अग्निशमन एनओसी जारी करना' },
  'issuance of final fire exemption certificate': { mr: 'अग्निशमन अंतिम नाहरकत दाखला देणे', hi: 'अंतिम अग्निशमन छूट प्रमाण पत्र जारी करना' },
  'maintaining cleanliness': { mr: 'शहरात स्वच्छता राखणे', hi: 'शहर में स्वच्छता बनाए रखना' },
};

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function localizeDepartmentName(name: string, locale: string): string {
  if (!name || locale === 'en') return name;
  const key = normalizeKey(name);
  const match = DEPARTMENT_LOCALIZATIONS[key];
  if (match) {
    return locale === 'mr' ? match.mr : locale === 'hi' ? match.hi : name;
  }
  return name;
}

export function localizeServiceName(name: string, locale: string): string {
  if (!name || locale === 'en') return name;
  const key = name.trim().toLowerCase();
  const directMatch = SERVICE_LOCALIZATIONS[key];
  if (directMatch) {
    return locale === 'mr' ? directMatch.mr : locale === 'hi' ? directMatch.hi : name;
  }
  const normKey = normalizeKey(name);
  for (const [k, v] of Object.entries(SERVICE_LOCALIZATIONS)) {
    if (normalizeKey(k) === normKey) {
      return locale === 'mr' ? v.mr : locale === 'hi' ? v.hi : name;
    }
  }
  return name;
}
