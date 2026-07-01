'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Scale,
  MessageSquare,
  Building2,
  Briefcase,
  FileEdit,
  UserCheck,
  CreditCard,
  Baby,
  Flame,
  BookOpen,
  HeartPulse,
  TreePine,
  ShieldCheck,
  Droplets,
  Laptop,
  Zap,
  Clock,
  Wrench
} from 'lucide-react';
import { getServiceFormConfig } from '@/data/serviceFormConfig';
import { rtsServiceDetails } from '@/data/rtsServiceDetails';
import { getMockDepartments } from '@/lib/mock/rts-citizen.mock';
import { Modal, Button } from '@/components/common';

interface CitizenLandingPageProps {
  isLoggedIn: boolean;
  ulbData?: any;
}

export function CitizenLandingPage({ isLoggedIn }: CitizenLandingPageProps) {
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('property-tax');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getTransText = (mr: string, hi: string, en: string) => {
    if (locale === 'mr') return mr;
    if (locale === 'hi') return hi;
    return en;
  };



  const handleActionClick = (_targetPath: string) => {
    if (isLoggedIn) {
      router.push(`/${locale}/service/dashboard`);
    } else {
      router.push(`/${locale}/service/login`);
    }
  };

  const handleServiceClick = (serviceName: string, serviceId?: string) => {
    if (!serviceId) {
      return;
    }

    const hasForm = !!getServiceFormConfig(serviceId);

    if (hasForm) {
      if (isLoggedIn) {
        router.push(`/${locale}/service/${serviceId}`);
      } else {
        router.push(`/${locale}/service/login?redirect=/${locale}/service/${serviceId}`);
      }
    } else {
      const msg = locale === 'mr'
        ? `${serviceName} अर्ज सेवा सध्या उपलब्ध नाही (डेमो).`
        : locale === 'hi'
          ? `${serviceName} आवेदन सेवा अभी उपलब्ध नहीं है (डेमो)।`
          : `${serviceName} application service is not available (Demo).`;
      alert(msg);
    }
  };

  // Quick Action Buttons config
  const quickActions = [
    {
      label: locale === 'mr' ? 'सेवा अर्ज करा' : locale === 'hi' ? 'सेवा के लिए आवेदन करें' : 'Apply for Service',
      icon: <FileEdit className="w-5 h-5 text-blue-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-blue-50',
    },

    {
      label: locale === 'mr' ? 'प्रमाणपत्र डाउनलोड' : locale === 'hi' ? 'प्रमाणपत्र डाउनलोड करें' : 'Download Certificate',
      icon: <Download className="w-5 h-5 text-purple-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-purple-50',
    },
    {
      label: locale === 'mr' ? 'शुल्क भरा' : locale === 'hi' ? 'शुल्क भुगतान करें' : 'Pay Fees',
      icon: <CreditCard className="w-5 h-5 text-orange-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-orange-50',
    },
    {
      label: locale === 'mr' ? 'अपील दाखल करा' : locale === 'hi' ? 'अपील दर्ज करें' : 'File Appeal',
      icon: <Scale className="w-5 h-5 text-red-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-red-50',
    },
    {
      label: locale === 'mr' ? 'तक्रार नोंदवा' : locale === 'hi' ? 'शिकायत दर्ज करें' : 'Register Grievance',
      icon: <MessageSquare className="w-5 h-5 text-teal-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-teal-50',
    },
    {
      label: locale === 'mr' ? 'अर्ज ट्रॅक करा' : locale === 'hi' ? 'आवेदन ट्रैक करें' : 'Track Application',
      icon: <Search className="w-5 h-5 text-indigo-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-indigo-50',
    }
  ];

  // Department-wise services mapping with icons representing them (all 12 departments, exactly 65 services)
  const deptCards = [
    {
      id: 'property-tax',
      title: locale === 'mr' ? 'मालमत्ता कर' : locale === 'hi' ? 'संपत्ति कर' : 'Property Tax',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700',
      textColor: 'text-indigo-900',
      bgColor: 'bg-indigo-50/50',
      borderColor: 'border-indigo-200',
      bannerBg: 'bg-[#4B0082]',
      icon: <CreditCard className="w-4 h-4" />,
      services: [
        { id: '7176', name: locale === 'mr' ? 'नव्याने कर आकारणी करणे' : 'New Tax Assessment' },
        { id: '7177', name: locale === 'mr' ? 'पुनः कर आकारणी करणे' : 'Reassessment of Tax' },
        { id: '7178', name: locale === 'mr' ? 'कराचे मागणीपत्र तयार करणे' : 'Generate Demand Bill' },
        { id: '7179', name: locale === 'mr' ? 'कर माफी मिळणे' : 'Tax Waiver Approval' },
        { id: '7180', name: locale === 'mr' ? 'मालमत्ता करामधून सूट मिळणे' : 'Property Tax Exemption' },
        { id: '7181', name: locale === 'mr' ? 'स्वयंमूल्यांकन करणे' : 'Self Assessment of Property' },
        { id: '7182', name: locale === 'mr' ? 'आक्षेप नोंदविणे' : 'File Assessment Objections' },
        { id: '7183', name: locale === 'mr' ? 'उपविभागामध्ये मालमत्ता विभागणी करणे' : 'Property Sub-division / Partition' },
        { id: '7184', name: locale === 'mr' ? 'मालमत्ता पाडून पुनर्बांधणी कर आकारणी करणे' : 'Assessment After Demolition' },
        { id: '7271', name: locale === 'mr' ? 'मालमत्ता कर उतारा देणे' : 'Property Tax Assessment Extract' },
        { id: '7186', name: locale === 'mr' ? 'थकबाकी नसल्याचा दाखला देणे' : 'No Dues Certificate (Property Tax)' },
        { id: '7187', name: locale === 'mr' ? 'दस्ताच्या आधारे मालमत्ता हस्तांतरण नोंद प्रमाणपत्र देणे' : 'Property Transfer Registry via Deed' },
        { id: '7188', name: locale === 'mr' ? 'वारसा हक्काने मालमत्ता हस्तांतरण नोंद प्रमाणपत्र देणे' : 'Property Transfer via Inheritance' },
        { id: '7189', name: locale === 'mr' ? 'मालकी हक्कात बदल करणे' : 'Change of Ownership / Title' }
      ],
      stats: getTransText('१४ सेवा', '14 सेवाएं', '14 Services')
    },
    {
      id: 'water-supply',
      title: locale === 'mr' ? 'पाणीपुरवठा विभाग' : locale === 'hi' ? 'जल आपूर्ति विभाग' : 'Water Supply',
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-sky-600 hover:bg-sky-700',
      textColor: 'text-sky-900',
      bgColor: 'bg-sky-50/50',
      borderColor: 'border-sky-200',
      bannerBg: 'bg-[#3F7C9E]',
      icon: <Droplets className="w-4 h-4" />,
      services: [
        { id: '7174', name: locale === 'mr' ? 'नळ जोडणी देणे' : 'New Water Connection' },
        { id: '7175', name: locale === 'mr' ? 'जलनिस्सारण जोडणी देणे' : 'New Drainage Connection' },
        { id: '7162', name: locale === 'mr' ? 'नळ जोडणी आकारामध्ये बदल करणे' : 'Change Water Connection Size' },
        { id: '7163', name: locale === 'mr' ? 'तात्पुरती / कायमस्वरूपी नळ जोडणी खंडित करणे' : 'Disconnection of Water Connection' },
        { id: '7164', name: locale === 'mr' ? 'पुनः जोडणी करणे' : 'Reconnection of Water Connection' },
        { id: '7165', name: locale === 'mr' ? 'वापरामध्ये बदल करणे' : 'Change of Usage Type' },
        { id: '7166', name: locale === 'mr' ? 'पाणी देयक तयार करणे' : 'Generate Water Bill' },
        { id: '7167', name: locale === 'mr' ? 'प्लंबर परवाना देणे' : 'Issue Plumber License' },
        { id: '7168', name: locale === 'mr' ? 'प्लंबर परवान्याचे नूतनीकरण करणे' : 'Plumber License Renewal' },
        { id: '7155', name: locale === 'mr' ? 'थकबाकी नसल्याचा दाखला देणे' : 'No Dues Certificate (Water)' },
        { id: '7170', name: locale === 'mr' ? 'नादुरुस्त मीटरबाबत तक्रार नोंदविणे' : 'Report Faulty Water Meter' },
        { id: '7171', name: locale === 'mr' ? 'अनधिकृत नळ जोडणीबाबत तक्रार नोंदविणे' : 'Report Illegal Water Connection' },
        { id: '7172', name: locale === 'mr' ? 'पाण्याच्या दाबाबाबत तक्रार नोंदविणे' : 'Report Low Water Pressure' },
        { id: '7173', name: locale === 'mr' ? 'पाण्याच्या गुणवत्तेबाबत तक्रार नोंदविणे' : 'Report Bad Water Quality' }
      ],
      stats: getTransText('१४ सेवा', '14 सेवाएं', '14 Services')
    },
    {
      id: 'trade-license',
      title: locale === 'mr' ? 'व्यापार परवाना' : locale === 'hi' ? 'व्यापार लाइसेंस' : 'Trade License',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      textColor: 'text-amber-900',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-200',
      bannerBg: 'bg-[#C66922]',
      icon: <Briefcase className="w-4 h-4" />,
      services: [
        { id: '7190', name: locale === 'mr' ? 'नवीन परवाना मिळणे' : 'New Trade License' },
        { id: '7191', name: locale === 'mr' ? 'परवान्याचे नूतनीकरण' : 'License Renewal' },
        { id: '7192', name: locale === 'mr' ? 'परवाना हस्तांतरण' : 'License Transfer' },
        { id: '7193', name: locale === 'mr' ? 'परवाना डुप्लिकेट प्रत देणे' : 'Duplicate License Copy' },
        { id: '7194', name: locale === 'mr' ? 'व्यवसायाचे नाव बदलणे / प्रतिष्ठानाचे नाव बदलणे' : 'Change of Business/Establishment Name' },
        { id: '7195', name: locale === 'mr' ? 'व्यवसाय बदलणे' : 'Change of Business Type' },
        { id: '7197', name: locale === 'mr' ? 'परवाना धारक / भागीदाराचे नाव बदलणे' : 'Change of License Holder/Partner Name' },
        { id: '7197', name: locale === 'mr' ? 'भागीदारी संस्थेतील भागीदार वाढ / कमी करणे' : 'Add/Remove Partners' },
        { id: '7198', name: locale === 'mr' ? 'परवाना रद्द करणे' : 'Cancel Trade License' },
        { id: '7199', name: locale === 'mr' ? 'कालबाह्य परवान्याच्या नूतनीकरणाबाबत सूचना देणे' : 'Notice for Renewal of Expired License' },
        { id: '8266', name: locale === 'mr' ? 'लॉजिंग हाऊस परवाना देणे' : 'Issue Lodging House License' },
        { id: '8267', name: locale === 'mr' ? 'लॉजिंग हाऊस परवान्याचे नूतनीकरण करणे' : 'Lodging House License Renewal' },
        { id: '8268', name: locale === 'mr' ? 'मंगल कार्यालय / सभागृह परवाना देणे' : 'Issue Banquet Hall/Auditorium License' },
        { id: '8269', name: locale === 'mr' ? 'मंगल कार्यालय / सभागृह परवान्याचे नूतनीकरण करणे' : 'Banquet Hall/Auditorium License Renewal' }
      ],
      stats: getTransText('१४ सेवा', '14 सेवाएं', '14 Services')
    },
    {
      id: 'town-planning',
      title: locale === 'mr' ? 'नगररचना / बांधकाम' : locale === 'hi' ? 'नगर नियोजन / निर्माण' : 'Town Planning',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-900',
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-200',
      bannerBg: 'bg-[#0B3C5D]',
      icon: <Building2 className="w-4 h-4" />,
      services: [
        { id: '7200', name: locale === 'mr' ? 'व्यापार / व्यवसाय / साठा करण्यासाठी ना-हरकत प्रमाणपत्र' : 'NOC for Trade / Business / Storage' },
        { id: '7201', name: locale === 'mr' ? 'मंडपासाठी ना-हरकत प्रमाणपत्र' : 'NOC for Mandap' },
        { id: '7207', name: locale === 'mr' ? 'झोन दाखला देणे' : 'Zone Certificate' },
        { id: '7208', name: locale === 'mr' ? 'भाग नकाशा देणे' : 'Part Map Copy' },
        { id: '7209', name: locale === 'mr' ? 'बांधकाम परवाना देणे' : 'Construction Permit' },
        { id: '7210', name: locale === 'mr' ? 'जोते प्रमाणपत्र देणे' : 'Plinth Certificate' },
        { id: '7211', name: locale === 'mr' ? 'भोगवटा प्रमाणपत्र देणे' : 'Occupancy Certificate' }
      ],
      stats: getTransText('७ सेवा', '7 सेवाएं', '7 Services')
    },
    {
      id: 'birth-death',
      title: locale === 'mr' ? 'जन्म-मृत्यू' : locale === 'hi' ? 'जन्म-मृत्यु' : 'Birth & Death',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
      textColor: 'text-emerald-900',
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-200',
      bannerBg: 'bg-[#2D8C4E]',
      icon: <Baby className="w-4 h-4" />,
      services: [
        { id: '7204', name: locale === 'mr' ? 'जन्म प्रमाणपत्र देणे' : 'Birth Certificate' },
        { id: '7205', name: locale === 'mr' ? 'मृत्यू प्रमाणपत्र देणे' : 'Death Certificate' },
        { id: '7121', name: locale === 'mr' ? 'विवाह नोंदणी प्रमाणपत्र देणे' : 'Marriage Registration Certificate' }
      ],
      stats: getTransText('३ सेवा', '3 सेवाएं', '3 Services')
    },
    {
      id: 'education',
      title: locale === 'mr' ? 'शिक्षण' : locale === 'hi' ? 'शिक्षा' : 'Education',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-purple-900',
      bgColor: 'bg-purple-50/50',
      borderColor: 'border-purple-200',
      bannerBg: 'bg-[#8A2BE2]',
      icon: <BookOpen className="w-4 h-4" />,
      services: [
        { id: '8273', name: locale === 'mr' ? 'विद्यार्थ्यांचा शाळा सोडल्याचा दाखला व द्वितीय दाखला देणे' : 'Issue Leaving/Duplicate Leaving Certificate' },
        { id: '8274', name: locale === 'mr' ? 'स्थलांतर दाखला देणे' : 'Issue Migration Certificate' },
        { id: '8275', name: locale === 'mr' ? 'द्वितीय गुणपत्रक देणे' : 'Issue Duplicate Marksheet' }
      ],
      stats: getTransText('३ सेवा', '3 सेवाएं', '3 Services')
    },
    {
      id: 'health',
      title: locale === 'mr' ? 'आरोग्य' : locale === 'hi' ? 'स्वास्थ्य' : 'Health',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-violet-600 hover:bg-violet-700',
      textColor: 'text-violet-900',
      bgColor: 'bg-violet-50/50',
      borderColor: 'border-violet-200',
      bannerBg: 'bg-[#551A8B]',
      icon: <HeartPulse className="w-4 h-4" />,
      services: [
        { id: '8270', name: locale === 'mr' ? 'महाराष्ट्र शुश्रूषा गृह नोंदणी अधिनियम, 1949 अंतर्गत शुश्रूषा गृह परवाना देणे' : 'Issue Nursing Home License' },
        { id: '8271', name: locale === 'mr' ? 'महाराष्ट्र शुश्रूषा गृह नोंदणी अधिनियम, 1949 अंतर्गत शुश्रूषा गृह परवान्याचे नूतनीकरण करणे' : 'Nursing Home License Renewal' },
        { id: '8272', name: locale === 'mr' ? 'महाराष्ट्र शुश्रूषा गृह नोंदणी अधिनियम, 1949 अंतर्गत परवानाधारक / भागीदाराचे नाव बदलणे' : 'Change Nursing Home Owner/Partner Name' }
      ],
      stats: getTransText('३ सेवा', '3 सेवाएं', '3 Services')
    },
    {
      id: 'pwd',
      title: locale === 'mr' ? 'बांधकाम (PWD)' : locale === 'hi' ? 'बांधकाम (PWD)' : 'PWD',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-cyan-600 hover:bg-cyan-700',
      textColor: 'text-cyan-900',
      bgColor: 'bg-cyan-50/50',
      borderColor: 'border-cyan-200',
      bannerBg: 'bg-[#008B8B]',
      icon: <Wrench className="w-4 h-4" />,
      services: [
        { id: '8277', name: locale === 'mr' ? 'भूमिगत दूरसंचार वाहिनी (Optical Fibre Cable) टाकण्यासाठी परवानगी देणे' : 'Underground Optical Fibre Cable Laying Permission' },
        { id: '9001', name: locale === 'mr' ? 'महानगरपालिका / नगरपालिका / नगरपंचायत क्षेत्रातील रस्त्यावरील खड्डे बुजविणे' : 'ULB Area Pothole Repair Work' },
        { id: '9002', name: locale === 'mr' ? 'महानगरपालिका / नगरपालिका / नगरपंचायत क्षेत्रातील गटारांवरील झाकणे सुस्थितीत ठेवणे' : 'ULB Area Drainage/Manhole Cover Fixing' }
      ],
      stats: getTransText('३ सेवा', '3 सेवाएं', '3 Services')
    },
    {
      id: 'fire',
      title: locale === 'mr' ? 'अग्निशमन' : locale === 'hi' ? 'अग्निशमन' : 'Fire',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      textColor: 'text-rose-900',
      bgColor: 'bg-rose-50/50',
      borderColor: 'border-rose-200',
      bannerBg: 'bg-[#B22222]',
      icon: <Flame className="w-4 h-4" />,
      services: [
        { id: '7202', name: locale === 'mr' ? 'अग्निशमन ना-हरकत दाखला देणे' : 'Fire NOC' },
        { id: '7203', name: locale === 'mr' ? 'अग्निशमन अंतिम ना-हरकत दाखला देणे' : 'Final Fire NOC' }
      ],
      stats: getTransText('२ सेवा', '2 सेवाएं', '2 Services')
    },
    {
      id: 'hawkers',
      title: locale === 'mr' ? 'फेरीवाले' : locale === 'hi' ? 'फेरीवाले' : 'Hawkers',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-teal-600 hover:bg-teal-700',
      textColor: 'text-teal-900',
      bgColor: 'bg-teal-50/50',
      borderColor: 'border-teal-200',
      bannerBg: 'bg-[#008080]',
      icon: <UserCheck className="w-4 h-4" />,
      services: [
        { id: '8278', name: locale === 'mr' ? 'फेरीवाले नोंदणी प्रमाणपत्र देणे' : 'Street Vendor Registration Certificate' }
      ],
      stats: getTransText('१ सेवा', '1 सेवा', '1 Service')
    },
    {
      id: 'tree',
      title: locale === 'mr' ? 'वृक्ष प्राधिकरण' : locale === 'hi' ? 'वृक्ष प्राधिकरण' : 'Tree Authority',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-green-900',
      bgColor: 'bg-green-50/50',
      borderColor: 'border-green-200',
      bannerBg: 'bg-[#228B22]',
      icon: <TreePine className="w-4 h-4" />,
      services: [
        { id: '8276', name: locale === 'mr' ? 'महाराष्ट्र (नागरी क्षेत्रे) वृक्ष संरक्षण व संवर्धन अधिनियम, 1975 अंतर्गत वृक्षतोड परवानगी देणे' : 'Tree Cutting Permission under 1975 Act' }
      ],
      stats: getTransText('१ सेवा', '1 सेवा', '1 Service')
    },
    {
      id: 'sanitation',
      title: locale === 'mr' ? 'स्वच्छता' : locale === 'hi' ? 'स्वच्छता' : 'Sanitation',
      image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500&auto=format&fit=crop&q=80',
      btnColor: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-orange-900',
      bgColor: 'bg-orange-50/50',
      borderColor: 'border-orange-200',
      bannerBg: 'bg-[#FF8C00]',
      icon: <ShieldCheck className="w-4 h-4" />,
      services: [
        { id: '8255', name: locale === 'mr' ? 'महानगरपालिका / नगरपालिका / नगरपंचायत क्षेत्रात स्वच्छता राखणे' : 'Maintaining Sanitation & Cleanliness in ULB' }
      ],
      stats: getTransText('१ सेवा', '1 सेवा', '1 Service')
    }
  ];

  // Dynamic filter for search bar
  const filteredServices = searchQuery.trim() !== ''
    ? deptCards.flatMap(dept => 
        dept.services
          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(s => ({ service: s.name, id: s.id, dept }))
      )
    : [];

  return (
    <div className="w-full bg-slate-50 font-sans pb-4">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* 1. Slogan Banner (Government Building Backdrop) - Full Width Edge-to-Edge */}
      <section className="relative overflow-hidden bg-slate-50 text-slate-900 shadow-md min-h-[160px] sm:min-h-[200px] md:min-h-[240px] flex items-center border-b border-slate-200 w-full rounded-none">
        {/* Background Image of Government/Admin Building */}
        <div className="absolute inset-0 opacity-100 pointer-events-none z-0">
          <Image
            src="/images/corporation-building.png"
            alt="Municipal Corporation Building"
            fill
            className="object-cover object-[center_20%]"
            priority
            unoptimized
          />
        </div>

        {/* Grid container inside Hero for Left text + Right Promo Card */}
        <div className="relative z-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 p-3 sm:p-4 md:p-6 items-center overflow-hidden">
          {/* Left Column: Slogan and Search Input (Legible Floating Card) */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-8 bg-white/95 backdrop-blur-md p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-white/60 shadow-lg max-w-2xl space-y-2.5 sm:space-y-3.5"
          >
            <span className="inline-block px-2.5 py-1 rounded bg-[#f39c12] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-sm">
              {locale === 'mr' ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम 2015 अंतर्गत' : locale === 'hi' ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम 2015 के अंतर्गत' : 'Under Right to Public Services Act 2015'}
            </span>
            
            <h2 className="text-base sm:text-xl md:text-2xl lg:text-[28px] font-black tracking-tight leading-tight text-[#0a3275]">
              {locale === 'mr' ? (
                <>
                  वेळबद्ध, पारदर्शक आणि <span className="text-[#0f7a3f]">नागरीक केंद्रित सेवा</span>
                </>
              ) : locale === 'hi' ? (
                <>
                  समयबद्ध, पारदर्शी और <span className="text-[#0f7a3f]">नागरिक केंद्रित सेवा</span>
                </>
              ) : (
                <>
                  Time-bound, Transparent and <span className="text-[#0f7a3f]">Citizen Centric Services</span>
                </>
              )}
            </h2>

            {/* Integrated Search Bar inside Hero */}
            <div className="relative w-full max-w-xl bg-white p-1.5 rounded-xl border border-slate-250 shadow-md flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-green-600 focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              <input
                type="text"
                placeholder={locale === 'mr' ? 'सेवा शोधा... (उदा. जन्म प्रमाणपत्र, पाणी जोडणी)' : locale === 'hi' ? 'सेवा खोजें... (उदा. जन्म प्रमाण पत्र, जल कनेक्शन)' : 'Search services... (e.g. Birth Certificate, Water connection)'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-gray-805 placeholder-gray-400 outline-none border-none font-bold"
              />
              <button
                type="button"
                onClick={() => handleServiceClick(searchQuery)}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm font-black rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{locale === 'mr' ? 'शोधा' : locale === 'hi' ? 'खोजें' : 'Search'}</span>
              </button>
            </div>

            {/* Inline Feature Badges */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-650 bg-white/50 backdrop-blur-sm rounded-lg py-1 px-2.5 border border-slate-200/40 w-fit">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale === 'mr' ? 'वेळबद्ध सेवा' : locale === 'hi' ? 'समयबद्ध सेवा' : 'Time-bound Service'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale === 'mr' ? 'पारदर्शक प्रक्रिया' : locale === 'hi' ? 'पारदर्शी प्रक्रिया' : 'Transparent Process'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale === 'mr' ? 'नागरिक प्रथम' : locale === 'hi' ? 'नागरिक प्रथम' : 'Citizen First'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale === 'mr' ? 'अपिलाचा अधिकार' : locale === 'hi' ? 'अपील का अधिकार' : 'Right to Appeal'}
              </span>
            </div>
          </motion.div>

          {/* Right Column: 65+ Online Services Promo Card */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="hidden lg:block lg:col-span-4"
          >
            <div className="bg-gradient-to-br from-[#0b5cd5] to-[#073fa8] text-white rounded-2xl p-4 shadow-lg border border-blue-400/20 relative overflow-hidden flex flex-row items-center justify-between h-[125px]">
              {/* Subtle background glow */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-16 h-16 bg-blue-300/10 rounded-full blur-lg pointer-events-none" />
              
              {/* Left Side: Content & Button */}
              <div className="space-y-2 relative z-20 flex-1 flex flex-col justify-between h-full max-w-[50%]">
                <div className="space-y-0.5">
                  <motion.h3 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200, bounce: 0.5 }}
                    className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 leading-none block drop-shadow-md"
                  >
                    65+
                  </motion.h3>
                  <motion.span 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs font-extrabold text-white block mt-0.5 leading-tight whitespace-nowrap"
                  >
                    {locale === 'mr' ? 'ऑनलाईन सेवा' : locale === 'hi' ? 'ऑनलाइन सेवाएं' : 'Online Services'}
                  </motion.span>
                  <span className="text-[10px] text-blue-100 block leading-tight whitespace-nowrap">
                    {locale === 'mr' ? 'तुमची सेवा, आमचे कर्तव्य' : locale === 'hi' ? 'आपकी सेवा, हमारा कर्तव्य' : 'Your service, our duty'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleActionClick('/service/login')}
                  className="px-3.5 py-1.5 bg-white text-[#0a4ebb] hover:bg-slate-50 font-black rounded-lg text-[10px] sm:text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer w-fit mt-0.5 shrink-0"
                >
                  <span>{locale === 'mr' ? 'सेवा अर्ज करा' : locale === 'hi' ? 'सेवा आवेदन करें' : 'Apply'}</span>
                  <span className="text-[11px] font-black">&rarr;</span>
                </button>
              </div>

              {/* Middle Section: Floating decorative elements to utilize the gap */}
              <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 sm:gap-5 z-10 pointer-events-none opacity-80">
                <motion.div 
                  animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg"
                >
                  <Laptop className="w-4 h-4 text-blue-100" />
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 8, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f39c12] to-[#d68910] border border-orange-300/50 flex items-center justify-center shadow-lg shadow-orange-900/20"
                >
                  <Zap className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div 
                  animate={{ y: [0, -6, 0], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg hidden sm:flex"
                >
                  <Clock className="w-4 h-4 text-blue-100" />
                </motion.div>
              </div>

              {/* Right Side: Realistic iPhone/smartphone mockup (Floating animation) */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative shrink-0 ml-2 z-10 self-center"
              >
                <div className="relative w-[68px] h-[105px] bg-slate-900 rounded-[15px] p-[2px] shadow-2xl border border-slate-800 shrink-0">
                  {/* Notch at the top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-900 rounded-b-[3px] z-20 flex justify-center items-center gap-0.5">
                    {/* Speaker pill */}
                    <div className="w-2 h-[0.5px] bg-slate-700 rounded-full" />
                  </div>

                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[13px] pt-2 px-0.5 pb-0.5 flex flex-col gap-1 justify-start relative overflow-hidden shadow-inner">
                    {/* Screen Items (3 List items with green checkmarks) */}
                    {[...Array(3)].map((_, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + (idx * 0.15), type: 'spring', stiffness: 100 }}
                        className="flex items-center gap-0.5 pb-0.5 border-b border-slate-100 last:border-0 leading-none"
                      >
                        {/* Green checkmark circle */}
                        <div className="w-2 h-2 rounded-full bg-[#27ae60] flex items-center justify-center shrink-0">
                          <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        {/* Mock text bars */}
                        <div className="flex-1 space-y-0.5">
                          <div className="h-[1.5px] bg-slate-200 rounded w-6" />
                          <div className="h-[1px] bg-slate-150 rounded w-4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Big floating green check badge overlapping at bottom right */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.1, type: 'spring', bounce: 0.6 }}
                    className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full bg-gradient-to-br from-[#27ae60] to-[#219653] border-2 border-[#073fa8] flex items-center justify-center shadow-lg z-30 transform hover:scale-110 transition-transform duration-200"
                  >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full space-y-4 py-3 px-3 md:px-5">
        
        {/* Quick Access Links Section */}
        <div className="space-y-3">
          <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>{getTransText('त्वरित सेवा दुवे', 'त्वरित सेवा लिंक', 'Quick Access Links')}</span>
              <span className="text-slate-400 text-xs font-normal">▼</span>
            </h3>
            <span className="text-xs bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-lg font-black">
              {getTransText('पोर्टल क्रिया', 'पोर्टल क्रियाएं', 'Portal Actions')}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleActionClick('/service/login')}
                className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer text-center h-[80px] sm:h-[90px] ${action.colorClass}`}
              >
                <div className={`w-8.5 h-8.5 ${action.iconBg} rounded-lg flex items-center justify-center shrink-0 mb-1.5`}>
                  {action.icon}
                </div>
                <div className="min-w-0 w-full">
                  <h4 className="font-extrabold text-slate-800 text-[11px] sm:text-xs leading-tight group-hover:text-blue-900 transition-colors">
                    {action.label}
                  </h4>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display: Search Results OR Tabbed Department Browser */}
        <section className="space-y-3">
          {searchQuery.trim() !== '' ? (
            /* Search Results View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300">
              <div className="px-5 py-3 bg-blue-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-white" />
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                    {getTransText('शोध परिणाम', 'खोज परिणाम', 'Search Results')}
                  </h4>
                </div>
                <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-lg font-black">
                  {filteredServices.length} {getTransText('आढळले', 'मिले', 'Found')}
                </span>
              </div>

              <div className="p-5 bg-white min-h-[150px]">
                {filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {filteredServices.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedServiceId(item.id);
                          setIsDetailsOpen(true);
                        }}
                        className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-green-50/20 hover:border-green-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="text-xs sm:text-[13px] font-bold text-slate-700 leading-snug group-hover:text-green-950 transition-colors">
                            {item.service}
                          </span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>{item.dept.icon}</span>
                          <span>{item.dept.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-700">
                      {getTransText('कोणत्याही सेवा आढळल्या नाहीत', 'कोई सेवा नहीं मिली', 'No services found')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {getTransText('कृपया वेगळे शब्द वापरून पहा.', 'कृपया कोई अन्य शब्द आज़माएं।', 'Please try with different keywords.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tabbed Department Browser */
            <div className="space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>{getTransText('विभागनिहाय सेवा (१ ते ६५ सेवा)', 'विभागवार सेवाएं (1 से 65 सेवाएं)', 'Department-wise Services (1 to 65 Services)')}</span>
                  <span className="text-slate-400 text-xs font-normal">▼</span>
                </h3>
                <span className="text-xs bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-lg font-black">
                  {getTransText('६५ एकूण सेवा', '65 कुल सेवाएं', '65 Total Services')}
                </span>
              </div>

              {/* Scrollable Department Tabs Bar (One Line) */}
              <div className="flex gap-2 overflow-x-auto pb-2.5 pt-1.5 no-scrollbar w-full">
                {deptCards.map((dept) => {
                  const isActive = activeTab === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setActiveTab(dept.id)}
                      className={`flex-grow md:flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-[11px] sm:text-xs font-extrabold cursor-pointer transition-all duration-200 shrink-0 shadow-sm ${
                        isActive
                          ? `${dept.bannerBg} text-white border-transparent scale-[1.02] shadow-md`
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-500 shrink-0'}>
                        {dept.icon}
                      </span>
                      <span className="whitespace-nowrap">{dept.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Panel */}
              {(() => {
                const activeDept = deptCards.find((d) => d.id === activeTab) || deptCards[0];
                return (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300">
                    {/* Department Banner Header */}
                    <div className={`px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeDept.bannerBg}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8.5 h-8.5 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
                          {activeDept.icon}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base leading-tight">{activeDept.title}</h4>
                          <p className="text-[10px] text-white/80 font-bold mt-0.5">{activeDept.stats}</p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const hasAnyActiveForm = activeDept.services.some(s => !!getServiceFormConfig(s.id));
                          if (hasAnyActiveForm) {
                            handleActionClick('/service/login');
                          } else {
                            const msg = locale === 'mr'
                              ? `${activeDept.title} विभागाची सेवा सध्या उपलब्ध नाही (डेमो).`
                              : locale === 'hi'
                                ? `${activeDept.title} विभाग की सेवा अभी उपलब्ध नहीं है (डेमो)।`
                                : `${activeDept.title} department services are not available (Demo).`;
                            alert(msg);
                          }
                        }}
                        className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-50 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <span>{getTransText('सर्व सेवा अर्ज करा', 'सभी सेवाएं आवेदन करें', 'Apply for Services')}</span>
                        <span>&rarr;</span>
                      </button>
                    </div>

                    {/* Services List Grid */}
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {activeDept.services.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedServiceId(item.id);
                              setIsDetailsOpen(true);
                            }}
                            className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/20 hover:border-blue-200/50 transition-all cursor-pointer group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                            <span className="text-xs sm:text-[13px] font-bold text-slate-700 leading-snug group-hover:text-blue-900 transition-colors">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>

      </div>

      {/* Service Details Modal */}
      {isDetailsOpen && selectedServiceId && (() => {
        const details = rtsServiceDetails[selectedServiceId];
        const depts = getMockDepartments();
        // Find service name dynamically
        let serviceName = '';
        let deptName = '';
        for (const dept of depts) {
          const svc = dept.services.find((s) => s.id === selectedServiceId);
          if (svc) {
            serviceName = getTransText(svc.name.mr || '', svc.name.hi || '', svc.name.en || '');
            deptName = getTransText(dept.name.mr || '', dept.name.hi || '', dept.name.en || '');
            break;
          }
        }

        const transSla = details ? getTransText(details.sla.mr, details.sla.hi, details.sla.en) : '7 Days';
        const transFees = details ? getTransText(details.fees.mr, details.fees.hi, details.fees.en) : 'Free';
        const transOfficer = details ? getTransText(details.officer.mr, details.officer.hi, details.officer.en) : '-';
        const transDocs = details ? (locale === 'mr' ? details.documents.mr : locale === 'hi' ? details.documents.hi : details.documents.en) : [];

        return (
          <Modal
            open={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedServiceId(null);
            }}
            title={serviceName || 'सेवा तपशील'}
            subtitle={deptName}
            maxWidth="md"
          >
            <div className="space-y-5">
              {/* Top stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                      {locale === 'mr' ? 'कालावधी (SLA)' : locale === 'hi' ? 'समय सीमा (SLA)' : 'Time Limit (SLA)'}
                    </p>
                    <p className="text-sm font-extrabold text-slate-800">{transSla}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                      {locale === 'mr' ? 'शुल्क / आकार' : locale === 'hi' ? 'शुल्क / प्रभार' : 'Fees / Charges'}
                    </p>
                    <p className="text-sm font-extrabold text-slate-800">{transFees}</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                      {locale === 'mr' ? 'स्वीकृती अधिकारी' : locale === 'hi' ? 'स्वीकृति अधिकारी' : 'Receiving Officer'}
                    </p>
                    <p className="text-sm font-extrabold text-slate-800">{transOfficer}</p>
                  </div>
                </div>
              </div>

              {/* Mandatory Documents List */}
              <div className="bg-white p-5 border border-slate-200 rounded-xl space-y-3">
                <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>
                    {locale === 'mr'
                      ? 'आवश्यक बंधनकारक कागदपत्रे'
                      : locale === 'hi'
                        ? 'आवश्यक अनिवार्य दस्तावेज'
                        : 'Mandatory Documents Required'}
                  </span>
                </h5>
                {transDocs.length > 0 ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-semibold list-disc pl-5">
                    {transDocs.map((doc, dIdx) => (
                      <li key={dIdx} className="leading-relaxed">{doc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">
                    {locale === 'mr'
                      ? 'या सेवेसाठी कोणतीही कागदपत्रे नमूद केलेली नाहीत.'
                      : locale === 'hi'
                        ? 'इस सेवा के लिए कोई दस्तावेज निर्दिष्ट नहीं हैं।'
                        : 'No documents specified for this service.'}
                  </p>
                )}
              </div>

              {/* Process trigger inside Modal Footer/Bottom */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setSelectedServiceId(null);
                  }}
                  className="font-bold"
                >
                  {locale === 'mr' ? 'बंद करा' : locale === 'hi' ? 'बंद करें' : 'Close'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setSelectedServiceId(null);
                    handleServiceClick(serviceName, selectedServiceId);
                  }}
                  className="font-extrabold"
                >
                  {locale === 'mr' ? 'अर्ज प्रक्रियेला सुरुवात करा' : locale === 'hi' ? 'आवेदन प्रक्रिया शुरू करें' : 'Apply / Process'} &rarr;
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

    </div>
  );
}
