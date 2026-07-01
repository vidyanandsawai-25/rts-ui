/**
 * rts-citizen.mock.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * MOCK DATA — Used only until real API is connected.
 *
 * Images: use local public paths (deployed on Next.js static serving)
 *   → /images/departments/{id}.svg
 *   → team can replace .svg with actual photos when ready
 *
 * ⚠️  DO NOT hardcode ULB-specific data here.
 *     All ULB info (name, logo, address) comes from fetchLoginBrandingAction().
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  DepartmentDTO,
  ServiceFieldGroupDTO,
  ServiceMetaDTO,
} from '@/types/rts-citizen.types';

// ── Helper: local department image path ──────────────────────────────────────
// Removed unused deptImg function

// ── MOCK DEPARTMENTS (replace with DB fetch) ─────────────────────────────────
export function getMockDepartments(): DepartmentDTO[] {
  return [
    {
      id: 'property-tax',
      name: { en: 'Property Tax', hi: 'संपत्ति कर', mr: 'मालमत्ता कर' },
      icon: 'Home',
      image: 'https://images.unsplash.com/photo-1689574666545-3f2f9afdf632?w=800',
      services: [
        { id: '7176', name: { en: 'New Tax Assessment', hi: 'नया कर निर्धारण', mr: 'नव्याने कर आकारणी करणे' }, icon: 'FilePlus', color: 'bg-indigo-400' },
        { id: '7177', name: { en: 'Reassessment of Tax', hi: 'कर पुनर्मूल्यांकन', mr: 'पुनः कर आकारणी करणे' }, icon: 'RefreshCw', color: 'bg-blue-400' },
        { id: '7178', name: { en: 'Generate Demand Bill', hi: 'मांग बिल बनाएं', mr: 'कराचे मागणीपत्र तयार करणे' }, icon: 'FileText', color: 'bg-green-400' },
        { id: '7179', name: { en: 'Tax Waiver Approval', hi: 'कर माफी', mr: 'कर माफी मिळणे' }, icon: 'Percent', color: 'bg-yellow-400' },
        { id: '7180', name: { en: 'Property Tax Exemption', hi: 'संपत्ति कर छूट', mr: 'मालमत्ता करामधून सूट मिळणे' }, icon: 'ShieldCheck', color: 'bg-teal-400' },
        { id: '7181', name: { en: 'Self Assessment of Property', hi: 'स्व-मूल्यांकन', mr: 'स्वयंमूल्यांकन करणे' }, icon: 'ClipboardCheck', color: 'bg-purple-400' },
        { id: '7182', name: { en: 'File Assessment Objections', hi: 'आपत्ति दर्ज करें', mr: 'आक्षेप नोंदविणे' }, icon: 'MessageSquareWarning', color: 'bg-red-400' },
        { id: '7183', name: { en: 'Property Sub-division / Partition', hi: 'संपत्ति उप-विभाजन', mr: 'उपविभागामध्ये मालमत्ता विभागणी करणे' }, icon: 'Scissors', color: 'bg-orange-400' },
        { id: '7184', name: { en: 'Assessment After Demolition', hi: 'विध्वंस के बाद मूल्यांकन', mr: 'मालमत्ता पाडून पुनर्बांधणी कर आकारणी करणे' }, icon: 'Hammer', color: 'bg-amber-400' },
        { id: '7271', name: { en: 'Property Tax Assessment Extract', hi: 'संपत्ति कर उद्धरण', mr: 'मालमत्ता कर उतारा देणे' }, icon: 'Download', color: 'bg-cyan-400' },
        { id: '7186', name: { en: 'No Dues Certificate (Property Tax)', hi: 'बकाया नहीं प्रमाणपत्र', mr: 'थकबाकी नसल्याचा दाखला देणे' }, icon: 'BadgeCheck', color: 'bg-emerald-400' },
        { id: '7187', name: { en: 'Property Transfer Registry via Deed', hi: 'दस्तावेज़ द्वारा हस्तांतरण', mr: 'दस्ताच्या आधारे मालमत्ता हस्तांतरण नोंद प्रमाणपत्र देणे' }, icon: 'Handshake', color: 'bg-slate-400' },
        { id: '7188', name: { en: 'Property Transfer via Inheritance', hi: 'उत्तराधिकार द्वारा हस्तांतरण', mr: 'वारसा हक्काने मालमत्ता हस्तांतरण नोंद प्रमाणपत्र देणे' }, icon: 'UserCheck', color: 'bg-zinc-400' },
      ],
    },
    {
      id: 'water-supply',
      name: { en: 'Water Supply', hi: 'जल आपूर्ति', mr: 'पाणीपुरवठा' },
      icon: 'Droplets',
      image: 'https://images.unsplash.com/photo-1606214554814-e8a9f97bdbb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGRyb3AlMjBjbGVhbnxlbnwxfHx8fDE3NjMxOTgxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      services: [
        { id: '7174', name: { en: 'New Water Connection', hi: 'नया पानी कनेक्शन', mr: 'नळ जोडणी देणे' }, icon: 'Droplets', color: 'bg-sky-400' },
        { id: '7175', name: { en: 'New Drainage Connection', hi: 'नया ड्रेनेज कनेक्शन', mr: 'जलनिस्सारण जोडणी देणे' }, icon: 'Waves', color: 'bg-blue-400' },
        { id: '7162', name: { en: 'Change Water Connection Size', hi: 'कनेक्शन आकार बदलें', mr: 'नळ जोडणी आकारामध्ये बदल करणे' }, icon: 'Settings', color: 'bg-teal-400' },
        { id: '7163', name: { en: 'Disconnect Water Connection', hi: 'पानी कनेक्शन बंद करें', mr: 'तात्पुरती / कायमस्वरूपी नळ जोडणी खंडित करणे' }, icon: 'X', color: 'bg-red-400' },
        { id: '7164', name: { en: 'Reconnection of Water Connection', hi: 'पुनः कनेक्शन', mr: 'पुनः जोडणी करणे' }, icon: 'PlugZap', color: 'bg-green-400' },
        { id: '7165', name: { en: 'Change of Usage Type', hi: 'उपयोग का प्रकार बदलें', mr: 'वापरामध्ये बदल करणे' }, icon: 'Activity', color: 'bg-orange-400' },
        { id: '7166', name: { en: 'Generate Water Bill', hi: 'पानी बिल बनाएं', mr: 'पाणी देयक तयार करणे' }, icon: 'Receipt', color: 'bg-indigo-400' },
        { id: '7167', name: { en: 'Issue Plumber License', hi: 'प्लंबर लाइसेंस', mr: 'प्लंबर परवाना देणे' }, icon: 'Wrench', color: 'bg-purple-400' },
        { id: '7168', name: { en: 'Plumber License Renewal', hi: 'प्लंबर लाइसेंस नवीनीकरण', mr: 'प्लंबर परवान्याचे नूतनीकरण करणे' }, icon: 'RefreshCw', color: 'bg-pink-400' },
        { id: '7155', name: { en: 'No Dues Certificate (Water)', hi: 'बकाया नहीं (पानी)', mr: 'थकबाकी नसल्याचा दाखला देणे' }, icon: 'BadgeCheck', color: 'bg-emerald-400' },
        { id: '7170', name: { en: 'Report Faulty Water Meter', hi: 'दोषपूर्ण मीटर रिपोर्ट', mr: 'नादुरुस्त मीटरबाबत तक्रार नोंदविणे' }, icon: 'AlertTriangle', color: 'bg-amber-400' },
        { id: '7171', name: { en: 'Report Illegal Water Connection', hi: 'अवैध पानी कनेक्शन रिपोर्ट', mr: 'अनधिकृत नळ जोडणीबाबत तक्रार नोंदविणे' }, icon: 'SearchCode', color: 'bg-red-500' },
        { id: '7172', name: { en: 'Report Low Water Pressure', hi: 'कम पानी दबाव रिपोर्ट', mr: 'पाण्याच्या दाबाबाबत तक्रार नोंदविणे' }, icon: 'ArrowDownCircle', color: 'bg-orange-500' },
        { id: '7173', name: { en: 'Report Bad Water Quality', hi: 'खराब पानी गुणवत्ता रिपोर्ट', mr: 'पाण्याच्या गुणवत्तेबाबत तक्रार नोंदविणे' }, icon: 'Info', color: 'bg-red-400' },
      ],
    },
    {
      id: 'trade-license',
      name: { en: 'Trade License', hi: 'व्यापार लाइसेंस', mr: 'व्यापार परवाना' },
      icon: 'Briefcase',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80',
      services: [
        { id: '7190', name: { en: 'New Trade License', hi: 'नया व्यापार लाइसेंस', mr: 'नवीन परवाना मिळणे' }, icon: 'FilePlus', color: 'bg-amber-400' },
        { id: '7191', name: { en: 'License Renewal', hi: 'लाइसेंस नवीनीकरण', mr: 'परवान्याचे नूतनीकरण' }, icon: 'RefreshCw', color: 'bg-yellow-400' },
        { id: '7192', name: { en: 'License Transfer', hi: 'लाइसेंस हस्तांतरण', mr: 'परवाना हस्तांतरण' }, icon: 'UserCheck', color: 'bg-lime-400' },
        { id: '7193', name: { en: 'Duplicate License Copy', hi: 'डुप्लिकेट लाइसेंस प्रति', mr: 'परवाना डुप्लिकेट प्रत देणे' }, icon: 'Copy', color: 'bg-green-400' },
        { id: '7194', name: { en: 'Change of Business/Establishment Name', hi: 'व्यवसाय का नाम बदलना', mr: 'व्यवसायाचे नाव बदलणे / प्रतिष्ठानाचे नाव बदलणे' }, icon: 'Edit3', color: 'bg-emerald-400' },
        { id: '7195', name: { en: 'Change of Business Type', hi: 'व्यवसाय बदलना', mr: 'व्यवसाय बदलणे' }, icon: 'RefreshCw', color: 'bg-teal-400' },
        { id: '7196', name: { en: 'Change of License Holder/Partner Name', hi: 'लाइसेंस धारक का नाम बदलना', mr: 'परवाना धारक / भागीदाराचे नाव बदलणे' }, icon: 'UserCheck', color: 'bg-cyan-400' },
        { id: '7197', name: { en: 'Add/Remove Partners', hi: 'भागीदारों को जोड़ना/हटाना', mr: 'भागीदारी संस्थेतील भागीदार वाढ / कमी करणे' }, icon: 'Users', color: 'bg-sky-400' },
        { id: '7198', name: { en: 'Cancel Trade License', hi: 'लाइसेंस रद्द करना', mr: 'परवाना रद्द करणे' }, icon: 'Trash2', color: 'bg-blue-400' },
        { id: '7199', name: { en: 'Notice for Renewal of Expired License', hi: 'समाप्त लाइसेंस नवीनीकरण सूचना', mr: 'कालबाह्य परवान्याच्या नूतनीकरणाबाबत सूचना देणे' }, icon: 'Bell', color: 'bg-indigo-400' },
      ],
    },
    {
      id: 'town-planning',
      name: { en: 'Town Planning', hi: 'नगर नियोजन / निर्माण', mr: 'नगररचना / बांधकाम' },
      icon: 'Building2',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80',
      services: [
        { id: '7200', name: { en: 'NOC for Trade / Business / Storage', hi: 'व्यापार / व्यवसाय / भंडारण के लिए एनओसी', mr: 'व्यापार / व्यवसाय / साठा करण्यासाठी ना-हरकत प्रमाणपत्र' }, icon: 'Building2', color: 'bg-blue-400' },
        { id: '7201', name: { en: 'NOC for Mandap', hi: 'मंडप के लिए एनओसी', mr: 'मंडपासाठी ना-हरकत प्रमाणपत्र' }, icon: 'Tent', color: 'bg-indigo-400' },
        { id: '7207', name: { en: 'Zone Certificate', hi: 'जोन प्रमाणपत्र', mr: 'झोन दाखला देणे' }, icon: 'Map', color: 'bg-purple-400' },
        { id: '7208', name: { en: 'Part Map Copy', hi: 'भाग मानचित्र प्रति', mr: 'भाग नकाशा देणे' }, icon: 'Copy', color: 'bg-pink-400' },
        { id: '7209', name: { en: 'Construction Permit', hi: 'निर्माण अनुमति', mr: 'बांधकाम परवाना देणे' }, icon: 'FileText', color: 'bg-rose-400' },
        { id: '7210', name: { en: 'Plinth Certificate', hi: 'प्लिंथ प्रमाणपत्र', mr: 'जोते प्रमाणपत्र देणे' }, icon: 'FileCheck', color: 'bg-red-400' },
        { id: '7211', name: { en: 'Occupancy Certificate', hi: 'भोगवटा प्रमाणपत्र', mr: 'भोगवटा प्रमाणपत्र देणे' }, icon: 'Home', color: 'bg-orange-400' },
      ],
    },
    {
      id: 'halls',
      name: { en: 'Nursing Home & Halls', hi: 'नर्सिंग होम व हॉल', mr: 'शुश्रूषा गृह / मंगल कार्यालय' },
      icon: 'HeartPulse',
      image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800',
      services: [
        { id: '8270', name: { en: 'Issue Nursing Home License', hi: 'नर्सिंग होम लाइसेंस', mr: 'महाराष्ट्र शुश्रूषा गृह नोंदणी अधिनियम, 1949 अंतर्गत शुश्रूषा गृह परवाना देणे' }, icon: 'Hospital', color: 'bg-emerald-400' },
        { id: '8271', name: { en: 'Nursing Home License Renewal', hi: 'नर्सिंग होम नवीनीकरण', mr: 'महाराष्ट्र शुश्रूषा गृह नोंदणी अधिनियम, 1949 अंतर्गत शुश्रूषा गृह परवान्याचे नूतनीकरण करणे' }, icon: 'RefreshCw', color: 'bg-rose-400' },
        { id: '8272', name: { en: 'Change Nursing Home Owner/Partner Name', hi: 'नाम बदलना', mr: 'महाराष्ट्र शुश्रूषा गृह नोंदणी अधिनियम, 1949 अंतर्गत परवानाधारक / भागीदाराचे नाव बदलणे' }, icon: 'UserCheck', color: 'bg-teal-400' },
        { id: '8266', name: { en: 'Issue Lodging House License', hi: 'लॉजिंग लाइसेंस', mr: 'लॉजिंग हाऊस परवाना देणे' }, icon: 'Hotel', color: 'bg-cyan-400' },
        { id: '8267', name: { en: 'Lodging House License Renewal', hi: 'लॉजिंग नवीनीकरण', mr: 'लॉजिंग हाऊस परवान्याचे नूतनीकरण करणे' }, icon: 'RefreshCcw', color: 'bg-sky-400' },
        { id: '8268', name: { en: 'Issue Banquet Hall/Auditorium License', hi: 'सभागृह लाइसेंस', mr: 'मंगल कार्यालय / सभागृह परवाना देणे' }, icon: 'Building2', color: 'bg-violet-400' },
        { id: '8269', name: { en: 'Banquet Hall/Auditorium License Renewal', hi: 'सभागृह नवीनीकरण', mr: 'मंगल कार्यालय / सभागृह परवान्याचे नूतनीकरण करणे' }, icon: 'RefreshCcw', color: 'bg-fuchsia-400' },
      ],
    },
    {
      id: 'birth-death',
      name: { en: 'Birth, Death & Marriage', hi: 'जन्म-मृत्यु-विवाह', mr: 'जन्म-मृत्यू-विवाह' },
      icon: 'HeartPulse',
      image: 'https://images.unsplash.com/photo-1613587261040-f2faa7e5bf23?w=800',
      services: [
        { id: '7204', name: { en: 'Birth Certificate', hi: 'जन्म प्रमाणपत्र', mr: 'जन्म प्रमाणपत्र देणे' }, icon: 'Baby', color: 'bg-blue-400' },
        { id: '7205', name: { en: 'Death Certificate', hi: 'मृत्यु प्रमाणपत्र', mr: 'मृत्यू प्रमाणपत्र देणे' }, icon: 'HeartOff', color: 'bg-red-400' },
        { id: '7121', name: { en: 'Marriage Registration Certificate', hi: 'विवाह पंजीकरण', mr: 'विवाह नोंदणी प्रमाणपत्र देणे' }, icon: 'Heart', color: 'bg-pink-400' },
      ],
    },
    {
      id: 'education',
      name: { en: 'Education', hi: 'शिक्षा', mr: 'शिक्षण' },
      icon: 'GraduationCap',
      image: 'https://images.unsplash.com/photo-1739249327281-e918124ac540?w=800',
      services: [
        { id: '8273', name: { en: 'Issue Leaving/Duplicate Leaving Certificate', hi: 'स्कूल छोड़ने का प्रमाणपत्र', mr: 'विद्यार्थ्यांचा शाळा सोडल्याचा दाखला व द्वितीय दाखला देणे' }, icon: 'School', color: 'bg-purple-400' },
        { id: '8274', name: { en: 'Issue Migration Certificate', hi: 'माइग्रेशन प्रमाणपत्र', mr: 'स्थलांतर दाखला देणे' }, icon: 'MoveRight', color: 'bg-orange-400' },
        { id: '8275', name: { en: 'Issue Duplicate Marksheet', hi: 'दुय्यम गुणपत्रक', mr: 'द्वितीय गुणपत्रक देणे' }, icon: 'Award', color: 'bg-yellow-400' },
      ],
    },
    {
      id: 'civic-amenities',
      name: { en: 'Civic Amenities', hi: 'नागरिक सुविधाएं', mr: 'नागरी सुविधा' },
      icon: 'ShieldCheck',
      image: 'https://images.unsplash.com/photo-1762805544550-f12a8ebceb2e?w=800',
      services: [
        { id: '9001', name: { en: 'ULB Area Pothole Repair Work', hi: 'सड़क गड्ढे मरम्मत', mr: 'महानगरपालिका / नगरपालिका / नगरपंचायत क्षेत्रातील रस्त्यावरील खड्डे बुजविणे' }, icon: 'Construction', color: 'bg-orange-400' },
        { id: '9002', name: { en: 'ULB Area Drainage/Manhole Cover Fixing', hi: 'गटार ढक्कन फिक्सिंग', mr: 'महानगरपालिका / नगरपालिका / नगरपंचायत क्षेत्रातील गटारांवरील झाकणे सुस्थितीत ठेवणे' }, icon: 'CircleDot', color: 'bg-amber-400' },
        { id: '8255', name: { en: 'Maintaining Sanitation & Cleanliness in ULB', hi: 'स्वच्छता बनाए रखना', mr: 'महानगरपालिका / नगरपालिका / नगरपंचायत क्षेत्रात स्वच्छता राखणे' }, icon: 'Trash2', color: 'bg-lime-400' },
      ],
    },
    {
      id: 'fire',
      name: { en: 'Fire Department', hi: 'अग्निशमन विभाग', mr: 'अग्निशमन' },
      icon: 'Flame',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
      services: [
        { id: '7202', name: { en: 'Fire NOC', hi: 'अग्निशमन एनओसी', mr: 'अग्निशमन ना-हरकत दाखला देणे' }, icon: 'Flame', color: 'bg-red-500' },
        { id: '7203', name: { en: 'Final Fire NOC', hi: 'अंतिम अग्निशमन एनओसी', mr: 'अग्निशमन अंतिम ना-हरकत दाखला देणे' }, icon: 'ShieldAlert', color: 'bg-rose-500' },
      ],
    },
    {
      id: 'hawkers',
      name: { en: 'Street Vendors / Hawkers', hi: 'फेरीवाला', mr: 'फेरीवाले' },
      icon: 'ShoppingCart',
      image: 'https://images.unsplash.com/photo-1751759192037-a51efd95a480?w=800',
      services: [
        { id: '8278', name: { en: 'Street Vendor Registration Certificate', hi: 'फेरीवाला पंजीकरण प्रमाणपत्र', mr: 'फेरीवाले नोंदणी प्रमाणपत्र देणे' }, icon: 'Store', color: 'bg-teal-400' },
      ],
    },
    {
      id: 'ofc',
      name: { en: 'Optical Fibre Cable (OFC)', hi: 'ऑप्टिकल फाइबर केबल', mr: 'OFC परवानगी' },
      icon: 'Wifi',
      image: 'https://images.unsplash.com/photo-1650532924043-ace81d44a7f3?w=800',
      services: [
        { id: '8277', name: { en: 'Underground Optical Fibre Cable Laying Permission', hi: 'OFC बिछाने की अनुमति', mr: 'भूमिगत दूरसंचार वाहिनी (Optical Fibre Cable) टाकण्यासाठी परवानगी देणे' }, icon: 'Cable', color: 'bg-cyan-400' },
      ],
    },
    {
      id: 'tree',
      name: { en: 'Tree Conservation', hi: 'वृक्ष संरक्षण', mr: 'वृक्षतोड परवानगी' },
      icon: 'TreePine',
      image: 'https://images.unsplash.com/photo-1645753359575-c51cd95db8f9?w=800',
      services: [
        { id: '8276', name: { en: 'Tree Cutting Permission under 1975 Act', hi: 'वृक्ष काटने की अनुमति', mr: 'महाराष्ट्र (नागरी क्षेत्रे) वृक्ष संरक्षण व संवर्धन अधिनियम, 1975 अंतर्गत वृक्षतोड परवानगी देणे' }, icon: 'Axe', color: 'bg-green-400' },
      ],
    }
  ];
}

// ── MOCK SERVICE META ────────────────────────────────────────────────────────
export function getMockServiceMeta(serviceId: string): ServiceMetaDTO {
  const depts = getMockDepartments();
  for (const dept of depts) {
    const svc = dept.services.find((s) => s.id === serviceId);
    if (svc) {
      return {
        serviceId,
        rtsServiceId: Number(serviceId),
        departmentId: dept.id,
        departmentName: dept.name,
        serviceName: svc.name,
        sla: '7 Working Days',
        fee: 'Free',
      };
    }
  }
  return {
    serviceId,
    rtsServiceId: Number(serviceId),
    departmentId: 'unknown',
    departmentName: { en: 'Municipal Services', mr: 'महानगरपालिका सेवा', hi: 'नगरपालिका सेवा' },
    serviceName: { en: `Service ${serviceId}`, mr: `सेवा ${serviceId}`, hi: `सेवा ${serviceId}` },
    sla: '7 Working Days',
    fee: 'Free',
  };
}

// ── MOCK FORM FIELDS ─────────────────────────────────────────────────────────
// TODO (dev team): Replace with real API → GET /api/rts/services/{id}/fields
export function getMockServiceFields(_rtsServiceId: number): ServiceFieldGroupDTO[] {
  return [
    {
      groupId: 1,
      groupTitle: { en: 'Applicant Information', hi: 'आवेदक की जानकारी', mr: 'अर्जदाराची माहिती' },
      icon: 'User',
      fields: [
        {
          groupId: 1,
          groupTitle: { en: 'Applicant Information', hi: 'आवेदक की जानकारी', mr: 'अर्जदाराची माहिती' },
          fieldId: 'applicantName',
          label: { en: 'Applicant Name', hi: 'आवेदक का नाम', mr: 'अर्जदाराचे नाव' },
          fieldType: 'text',
          required: true,
          isActive: true,
          placeholder: { en: 'Enter full name', hi: 'पूरा नाम दर्ज करें', mr: 'पूर्ण नाव लिहा' },
          icon: 'User',
        },
        {
          groupId: 1,
          groupTitle: { en: 'Applicant Information', hi: 'आवेदक की जानकारी', mr: 'अर्जदाराची माहिती' },
          fieldId: 'mobileNo',
          label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल नंबर' },
          fieldType: 'tel',
          required: true,
          isActive: true,
          placeholder: { en: '10-digit mobile', hi: '10 अंक मोबाइल', mr: '10 अंकी मोबाईल' },
          icon: 'Phone',
          validation: { minLength: 10, maxLength: 10, pattern: '^[6-9]\\d{9}$' },
        },
        {
          groupId: 1,
          groupTitle: { en: 'Applicant Information', hi: 'आवेदक की जानकारी', mr: 'अर्जदाराची माहिती' },
          fieldId: 'email',
          label: { en: 'Email Address', hi: 'ईमेल पता', mr: 'ईमेल पत्ता' },
          fieldType: 'email',
          required: false,
          isActive: true,
          placeholder: { en: 'example@email.com', hi: 'उदाहरण@ईमेल.com', mr: 'उदा@ईमेल.com' },
          icon: 'Mail',
        },
      ],
    },
    {
      groupId: 2,
      groupTitle: { en: 'Address Details', hi: 'पता विवरण', mr: 'पत्ता तपशील' },
      icon: 'MapPin',
      fields: [
        {
          groupId: 2,
          groupTitle: { en: 'Address Details', hi: 'पता विवरण', mr: 'पत्ता तपशील' },
          fieldId: 'address',
          label: { en: 'Address', hi: 'पता', mr: 'पत्ता' },
          fieldType: 'textarea',
          required: false,
          isActive: true,
          placeholder: { en: 'Enter full address', hi: 'पूरा पता दर्ज करें', mr: 'पूर्ण पत्ता लिहा' },
          icon: 'MapPin',
        },
      ],
    },
  ];
}

export interface CitizenProfile {
  name: string;
  upicId: string;
  propertyNo: string;
  mobile: string;
  ownerId?: number;
}

export function getMockCitizenProfile(mobile: string): CitizenProfile {
  return {
    name: 'धारक . .',
    upicId: 'AKLMC089194',
    propertyNo: 'B3-434',
    mobile: mobile,
    ownerId: 1,
  };
}

