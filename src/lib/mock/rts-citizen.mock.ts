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
    // ── Birth & Death ──────────────────────────────────────────────────────
    {
      id: 'birth-death',
      name: { en: 'Birth & Death', hi: 'जन्म एवं मृत्यु', mr: 'जन्म आणि मृत्यू' },
      icon: 'HeartPulse',
      image: 'https://images.unsplash.com/photo-1613587261040-f2faa7e5bf23?w=800',
      services: [
        { id: '7204', name: { en: 'Birth Certificate', hi: 'जन्म प्रमाणपत्र', mr: 'जन्म प्रमाणपत्र' }, icon: 'Baby', color: 'bg-blue-400' },
        { id: '7205', name: { en: 'Death Certificate', hi: 'मृत्यु प्रमाणपत्र', mr: 'मृत्यू प्रमाणपत्र' }, icon: 'HeartOff', color: 'bg-red-400' },
      ],
    },

    // ── Education ──────────────────────────────────────────────────────────
    {
      id: 'education',
      name: { en: 'Education', hi: 'शिक्षा', mr: 'शिक्षण' },
      icon: 'GraduationCap',
      image: 'https://images.unsplash.com/photo-1739249327281-e918124ac540?w=800',
      services: [
        { id: '8273', name: { en: 'School Leaving / Duplicate Certificate', hi: 'स्कूल छोड़ने प्रमाणपत्र', mr: 'शाळा सोडल्याचा प्रमाणपत्र' }, icon: 'School', color: 'bg-purple-400' },
        { id: '8274', name: { en: 'Migration Certificate', hi: 'माइग्रेशन प्रमाणपत्र', mr: 'स्थलांतर प्रमाणपत्र' }, icon: 'MoveRight', color: 'bg-orange-400' },
        { id: '8275', name: { en: 'Duplicate Marksheet', hi: 'डुप्लीकेट मार्कशीट', mr: 'दुय्यम गुणपत्रक' }, icon: 'Award', color: 'bg-yellow-400' },
      ],
    },

    // ── Property Tax ───────────────────────────────────────────────────────
    {
      id: 'property-tax',
      name: { en: 'Property Tax', hi: 'संपत्ति कर', mr: 'मालमत्ता कर' },
      icon: 'Home',
      image: 'https://images.unsplash.com/photo-1689574666545-3f2f9afdf632?w=800',
      services: [
        { id: '7176', name: { en: 'New Tax Assessment', hi: 'नई कर निर्धारण', mr: 'नव्याने कर आकारणी' }, icon: 'FilePlus', color: 'bg-indigo-400' },
        { id: '7177', name: { en: 'Reassessment of Tax', hi: 'कर पुनर्मूल्यांकन', mr: 'पुनः कर आकारणी' }, icon: 'RefreshCw', color: 'bg-blue-400' },
        { id: '7178', name: { en: 'Generate Demand Bill', hi: 'मांग बिल बनाएं', mr: 'कराचे मागणीपत्र' }, icon: 'FileText', color: 'bg-green-400' },
        { id: '7179', name: { en: 'Tax Waiver', hi: 'कर छूट', mr: 'कर माफी' }, icon: 'Percent', color: 'bg-yellow-400' },
        { id: '7180', name: { en: 'Property Tax Exemption', hi: 'संपत्ति कर छूट', mr: 'मालमत्ता कर सूट' }, icon: 'ShieldCheck', color: 'bg-teal-400' },
        { id: '7181', name: { en: 'Self Assessment', hi: 'स्व-मूल्यांकन', mr: 'स्वयंमूल्यांकन' }, icon: 'ClipboardCheck', color: 'bg-purple-400' },
        { id: '7182', name: { en: 'File Assessment Objections', hi: 'आपत्ति दर्ज करें', mr: 'आक्षेप नोंदविणे' }, icon: 'MessageSquareWarning', color: 'bg-red-400' },
        { id: '7183', name: { en: 'Property Sub-division', hi: 'संपत्ति उप-विभाजन', mr: 'मालमत्ता विभागणी' }, icon: 'Scissors', color: 'bg-orange-400' },
        { id: '7271', name: { en: 'Property Tax Extract', hi: 'संपत्ति कर उद्धरण', mr: 'मालमत्ता कर उतारा' }, icon: 'Download', color: 'bg-cyan-400' },
        { id: '7186', name: { en: 'No Dues Certificate', hi: 'बकाया नहीं प्रमाणपत्र', mr: 'थकबाकी नसल्याचा दाखला' }, icon: 'BadgeCheck', color: 'bg-emerald-400' },
        { id: '7187', name: { en: 'Property Transfer via Deed', hi: 'दस्तावेज़ द्वारा हस्तांतरण', mr: 'दस्ताने हस्तांतरण' }, icon: 'Handshake', color: 'bg-slate-400' },
      ],
    },

    // ── Water Supply ───────────────────────────────────────────────────────
    {
      id: 'water-supply',
      name: { en: 'Water Supply', hi: 'जल आपूर्ति', mr: 'पाणीपुरवठा' },
      icon: 'Droplets',
      image: 'https://images.unsplash.com/photo-1606214554814-e8a9f97bdbb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGRyb3AlMjBjbGVhbnxlbnwxfHx8fDE3NjMxOTgxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      services: [
        { id: '7174', name: { en: 'New Water Connection', hi: 'नया पानी कनेक्शन', mr: 'नळ जोडणी' }, icon: 'Droplets', color: 'bg-sky-400' },
        { id: '7175', name: { en: 'New Drainage Connection', hi: 'नया ड्रेनेज कनेक्शन', mr: 'जलनिस्सारण जोडणी' }, icon: 'Waves', color: 'bg-blue-400' },
        { id: '7162', name: { en: 'Change Connection Size', hi: 'कनेक्शन आकार बदलें', mr: 'जोडणी आकार बदल' }, icon: 'Settings', color: 'bg-teal-400' },
        { id: '7163', name: { en: 'Disconnect Water Connection', hi: 'पानी कनेक्शन बंद करें', mr: 'जोडणी खंडित' }, icon: 'X', color: 'bg-red-400' },
        { id: '7164', name: { en: 'Reconnection', hi: 'पुनः कनेक्शन', mr: 'पुनः जोडणी' }, icon: 'PlugZap', color: 'bg-green-400' },
        { id: '7166', name: { en: 'Generate Water Bill', hi: 'पानी बिल बनाएं', mr: 'पाणी देयक' }, icon: 'Receipt', color: 'bg-indigo-400' },
        { id: '7155', name: { en: 'No Dues Certificate (Water)', hi: 'बकाया नहीं (पानी)', mr: 'थकबाकी नसल्याचा दाखला' }, icon: 'BadgeCheck', color: 'bg-emerald-400' },
      ],
    },

    // ── Halls & Nursing Homes ──────────────────────────────────────────────
    {
      id: 'halls',
      name: { en: 'Nursing Home & Halls', hi: 'नर्सिंग होम व हॉल', mr: 'शुश्रूषा गृह / मंगल कार्यालय' },
      icon: 'HeartPulse',
      image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800',
      services: [
        { id: '8270', name: { en: 'Issue Nursing Home License', hi: 'नर्सिंग होम लाइसेंस', mr: 'शुश्रूषा गृह परवाना' }, icon: 'Hospital', color: 'bg-emerald-400' },
        { id: '8271', name: { en: 'Renew Nursing Home License', hi: 'नर्सिंग होम नवीनीकरण', mr: 'शुश्रूषा गृह नूतनीकरण' }, icon: 'RefreshCw', color: 'bg-rose-400' },
        { id: '8268', name: { en: 'Issue Banquet Hall License', hi: 'सभागृह लाइसेंस', mr: 'मंगल कार्यालय परवाना' }, icon: 'Building2', color: 'bg-violet-400' },
        { id: '8269', name: { en: 'Renew Banquet Hall License', hi: 'सभागृह नवीनीकरण', mr: 'मंगल कार्यालय नूतनीकरण' }, icon: 'RefreshCcw', color: 'bg-fuchsia-400' },
      ],
    },

    // ── Hawkers ───────────────────────────────────────────────────────────
    {
      id: 'hawkers',
      name: { en: 'Street Vendors / Hawkers', hi: 'फेरीवाला', mr: 'फेरीवाले' },
      icon: 'ShoppingCart',
      image: 'https://images.unsplash.com/photo-1751759192037-a51efd95a480?w=800',
      services: [
        { id: '8278', name: { en: 'Street Vendor Registration', hi: 'फेरीवाला पंजीकरण', mr: 'फेरीवाले नोंदणी' }, icon: 'Store', color: 'bg-teal-400' },
      ],
    },

    // ── OFC ───────────────────────────────────────────────────────────────
    {
      id: 'ofc',
      name: { en: 'Optical Fibre Cable (OFC)', hi: 'ऑप्टिकल फाइबर केबल', mr: 'OFC परवानगी' },
      icon: 'Wifi',
      image: 'https://images.unsplash.com/photo-1650532924043-ace81d44a7f3?w=800',
      services: [
        { id: '8277', name: { en: 'Underground OFC Laying Permission', hi: 'OFC बिछाने की अनुमति', mr: 'OFC टाकण्यास परवानगी' }, icon: 'Cable', color: 'bg-cyan-400' },
      ],
    },

    // ── Tree Conservation ─────────────────────────────────────────────────
    {
      id: 'tree',
      name: { en: 'Tree Conservation', hi: 'वृक्ष संरक्षण', mr: 'वृक्षतोड परवानगी' },
      icon: 'TreePine',
      image: 'https://images.unsplash.com/photo-1645753359575-c51cd95db8f9?w=800',
      services: [
        { id: '8276', name: { en: 'Tree Cutting Permission', hi: 'वृक्ष काटने की अनुमति', mr: 'वृक्षतोड परवानगी' }, icon: 'Axe', color: 'bg-green-400' },
      ],
    },

    // ── Civic Amenities ───────────────────────────────────────────────────
    {
      id: 'civic-amenities',
      name: { en: 'Civic Amenities', hi: 'नागरिक सुविधाएं', mr: 'नागरी सुविधा' },
      icon: 'ShieldCheck',
      image: 'https://images.unsplash.com/photo-1762805544550-f12a8ebceb2e?w=800',
      services: [
        { id: '9001', name: { en: 'Pothole Repair Request', hi: 'गड्ढा मरम्मत', mr: 'खड्डे बुजविणे' }, icon: 'Construction', color: 'bg-orange-400' },
        { id: '9002', name: { en: 'Manhole Cover Fixing', hi: 'मैनहोल कवर', mr: 'झाकणे ठीक करणे' }, icon: 'CircleDot', color: 'bg-amber-400' },
        { id: '8255', name: { en: 'Sanitation Complaint', hi: 'स्वच्छता शिकायत', mr: 'स्वच्छता तक्रार' }, icon: 'Trash2', color: 'bg-lime-400' },
      ],
    },

    // ── Marriage Registration ──────────────────────────────────────────────
    {
      id: 'marriage',
      name: { en: 'Marriage Registration', hi: 'विवाह पंजीकरण', mr: 'विवाह नोंदणी' },
      icon: 'Heart',
      image: 'https://images.unsplash.com/photo-1700062069869-0c59ff21fa3b?w=800',
      services: [
        { id: '7121', name: { en: 'Marriage Certificate', hi: 'विवाह प्रमाणपत्र', mr: 'विवाह प्रमाणपत्र' }, icon: 'Heart', color: 'bg-pink-400' },
      ],
    },
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
