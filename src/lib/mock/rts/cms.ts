export interface Stat {
  label: string;
  value: string;
}

export interface CmsTimelineStep {
  title: string;
  timestamp: string;
  officerName: string;
  role: string;
  remarks?: string;
  status: "completed" | "current" | "pending";
}

export interface CmsApplication {
  id: string;
  applicationNo: string;
  source?: "RTS" | "Aaple Sarkar";
  citizenName: string;
  mobile: string;
  email: string;
  aadhaar: string;
  departmentId: string;
  departmentName: string;
  serviceId: string;
  serviceName: string;
  submissionDate: string;
  status: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  priority: "High" | "Medium" | "Low";
  pendingSince: string;
  slaDays: number;
  remainingDays: number;
  timeline: CmsTimelineStep[];
  fieldValues: Record<string, string>;
  documents: Array<{
    id: string;
    label: string;
    fileName: string;
    verified: boolean;
  }>;
}

export interface CmsOfficer {
  id: string;
  name: string;
  employeeId: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  role: string;
  email: string;
  mobile: string;
  activeCasesCount: number;
}

export const mockCmsOfficers: CmsOfficer[] = [
  {
    id: "emp-101",
    name: "Arjun Phadke",
    employeeId: "EMP-2026-004",
    departmentId: "noc",
    departmentName: "NOC",
    designation: "Fire Safety Inspector",
    role: "Inspector",
    email: "arjun.phadke@ulb.gov.in",
    mobile: "9876543201",
    activeCasesCount: 3
  },
  {
    id: "emp-102",
    name: "Meera Deshmukh",
    employeeId: "EMP-2026-012",
    departmentId: "water",
    departmentName: "Water Connection",
    designation: "Assistant Engineer",
    role: "Engineer",
    email: "meera.d@ulb.gov.in",
    mobile: "9876543202",
    activeCasesCount: 5
  },
  {
    id: "emp-103",
    name: "Sanjay Joshi",
    employeeId: "EMP-2026-019",
    departmentId: "tax",
    departmentName: "Property Tax",
    designation: "Senior Superintendent",
    role: "Department Officer",
    email: "sanjay.joshi@ulb.gov.in",
    mobile: "9876543203",
    activeCasesCount: 2
  },
  {
    id: "emp-104",
    name: "Karan Patil",
    employeeId: "EMP-2026-025",
    departmentId: "noc",
    departmentName: "NOC",
    designation: "Station Fire Officer",
    role: "Department Head",
    email: "karan.patil@ulb.gov.in",
    mobile: "9876543204",
    activeCasesCount: 1
  },
  {
    id: "emp-105",
    name: "Anjali Shinde",
    employeeId: "EMP-2026-031",
    departmentId: "trade",
    departmentName: "Trade License",
    designation: "Licensing Clerk",
    role: "Junior Clerk",
    email: "anjali.s@ulb.gov.in",
    mobile: "9876543205",
    activeCasesCount: 4
  }
];

export const mockCmsApplications: CmsApplication[] = [
  {
    id: "1001",
    applicationNo: "RTS/2026/001001",
    citizenName: "Rahul Sharma",
    mobile: "9876543210",
    email: "rahul.sharma@gmail.com",
    aadhaar: "345678901234",
    departmentId: "noc",
    departmentName: "NOC",
    serviceId: "66",
    serviceName: "Fire NOC",
    submissionDate: "2026-06-25",
    status: "Verification In-Progress",
    assignedOfficerId: "emp-101",
    assignedOfficerName: "Arjun Phadke",
    priority: "High",
    pendingSince: "2026-06-25",
    slaDays: 7,
    remainingDays: 5,
    documents: [
      { id: "doc-1", label: "Application Form", fileName: "fire_noc_application.pdf", verified: true },
      { id: "doc-2", label: "Certificate of No Dues", fileName: "no_dues_certificate.pdf", verified: false },
      { id: "doc-3", label: "Architect Blue Print", fileName: "blue_print_architect.pdf", verified: false }
    ],
    timeline: [
      { title: "Submitted", timestamp: "2026-06-25 10:30 AM", officerName: "Citizen", role: "Citizen", remarks: "Initial Submission", status: "completed" },
      { title: "Assigned", timestamp: "2026-06-25 10:35 AM", officerName: "System", role: "Auto Assignment", remarks: "Assigned based on workload safety limits", status: "completed" },
      { title: "Verification In-Progress", timestamp: "2026-06-26 11:20 AM", officerName: "Arjun Phadke", role: "Inspector", remarks: "Scrutinizing documents and floor plans", status: "current" },
      { title: "Department Officer Review", timestamp: "", officerName: "Sanjay Joshi", role: "Department Officer", status: "pending" },
      { title: "Final Approval", timestamp: "", officerName: "Karan Patil", role: "Department Head", status: "pending" }
    ],
    fieldValues: {
      "name-on-owner": "Rahul Sharma",
      "full-name-gucg": "Plot 24, Cyber City, Phase 2, Pune",
      "mobile-number-fqxk": "9876543210",
      "email-address-bvhd": "rahul.sharma@gmail.com",
      "full-name-p5ql": "Sharma Technopark Ltd",
      "full-name-jial": "Plot 24, Cyber City, Phase 2, Pune - 411028",
      "full-name-l2is": "Technopark Block A (Proposed Map architect ref: MAP/2026/A)",
      "full-name-z2vu": "1250",
      "full-name-8351": "4500",
      "full-name-q322": "3",
      "full-name-yjuz": "Ground Floor: 1500 sq.m, First Floor: 1500 sq.m, Second Floor: 1500 sq.m",
      "full-name-svaj": "commercial",
      "custom-dropdown-l8g9": "low-rise-15-m",
      "custom-dropdown-539c": "large-200-occupants",
      "full-name-ub0r": "5"
    }
  },
  {
    id: "1002",
    applicationNo: "RTS/2026/001002",
    citizenName: "Priya Patil",
    mobile: "9823456789",
    email: "priya.patil@outlook.com",
    aadhaar: "876543210987",
    departmentId: "water",
    departmentName: "Water Connection",
    serviceId: "101",
    serviceName: "New Water Connection",
    submissionDate: "2026-06-24",
    status: "Pending Allocation",
    priority: "Medium",
    pendingSince: "2026-06-24",
    slaDays: 21,
    remainingDays: 18,
    documents: [
      { id: "doc-1", label: "Property Tax Receipt", fileName: "pt_receipt_2026.pdf", verified: true },
      { id: "doc-2", label: "Aadhaar Card", fileName: "aadhaar_scan.pdf", verified: true }
    ],
    timeline: [
      { title: "Submitted", timestamp: "2026-06-24 03:15 PM", officerName: "Citizen", role: "Citizen", remarks: "Need domestic connection urgently", status: "completed" },
      { title: "Pending Allocation", timestamp: "2026-06-24 03:15 PM", officerName: "System", role: "Auto Router", remarks: "Awaiting manual assignment to local ward clerk", status: "current" }
    ],
    fieldValues: {
      "applicant-name": "Priya Patil",
      "address": "Flat 402, Shivneri Apartments, Ward 4, Pune",
      "connection-type": "domestic"
    }
  },
  {
    id: "1003",
    applicationNo: "RTS/2026/001003",
    citizenName: "Amit Deshmukh",
    mobile: "9123456780",
    email: "amit.deshmukh@yahoo.com",
    aadhaar: "543210987654",
    departmentId: "trade",
    departmentName: "Trade License",
    serviceId: "301",
    serviceName: "New Trade License",
    submissionDate: "2026-06-22",
    status: "Approved",
    assignedOfficerId: "emp-105",
    assignedOfficerName: "Anjali Shinde",
    priority: "Low",
    pendingSince: "2026-06-25",
    slaDays: 15,
    remainingDays: 10,
    documents: [
      { id: "doc-1", label: "ID Proof", fileName: "pan_scan.pdf", verified: true },
      { id: "doc-2", label: "NOC from Owner", fileName: "rent_agreement.pdf", verified: true }
    ],
    timeline: [
      { title: "Submitted", timestamp: "2026-06-22 09:00 AM", officerName: "Citizen", role: "Citizen", status: "completed" },
      { title: "Verified", timestamp: "2026-06-23 04:30 PM", officerName: "Anjali Shinde", role: "Junior Clerk", remarks: "All documentation checked and validated", status: "completed" },
      { title: "Approved", timestamp: "2026-06-24 11:00 AM", officerName: "Sanjay Joshi", role: "Department Head", remarks: "License generated with ID TL-4091823", status: "completed" }
    ],
    fieldValues: {
      "trade-name": "Deshmukh Electronics",
      "trade-address": "Shop 12, Municipal Commercial Complex, Ward 2",
      "trade-type": "retail"
    }
  }
];

export interface ModuleConfig {
  key: string;
  name: string;
  nameMr: string;
  description: string;
  descriptionMr: string;
  status: "Active" | "Inactive";
  iconName: string;
}

export const mockCmsModules: ModuleConfig[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    nameMr: "डॅशबोर्ड",
    description: "Executive statistics and operational counts dashboard",
    descriptionMr: "प्रशासकीय आकडेवारी आणि परिचालन मोजणी डॅशबोर्ड",
    status: "Active",
    iconName: "LayoutDashboard"
  },
  {
    key: "inbox",
    name: "Inbox Queue",
    nameMr: "इनबॉक्स रांग",
    description: "Primary operational applications list and filter inbox",
    descriptionMr: "प्राथमिक परिचालन अर्ज यादी आणि फिल्टर इनबॉक्स",
    status: "Active",
    iconName: "ClipboardList"
  },
  {
    key: "mulyamapan",
    name: "SLA Evaluation (Mulyamapan)",
    nameMr: "SLA मूल्यांकन (मूल्यांकन)",
    description: "Stage-wise processing days tracking and bottleneck analysis",
    descriptionMr: "टप्पा-निहाय प्रक्रिया दिवस ट्रॅकिंग आणि अडथळा विश्लेषण",
    status: "Active",
    iconName: "Hourglass"
  },
  {
    key: "masters",
    name: "Masters Config",
    nameMr: "मास्टर्स कॉन्फिगरेशन",
    description: "Department, service, and ward master registers config",
    descriptionMr: "विभाग, सेवा आणि प्रभाग मास्टर रजिस्टर कॉन्फिगरेशन",
    status: "Active",
    iconName: "Database"
  },
  {
    key: "users",
    name: "User Access Control",
    nameMr: "वापरकर्ता प्रवेश नियंत्रण",
    description: "RBAC configurations, user registry, and permission controls",
    descriptionMr: "RBAC कॉन्फिगरेशन, वापरकर्ता नोंदणी आणि परवानग्या नियंत्रण",
    status: "Active",
    iconName: "Users"
  },
  {
    key: "reports",
    name: "Reports",
    nameMr: "अहवाल",
    description: "Operational throughput metrics and custom PDF export logs",
    descriptionMr: "परिचालन थ्रूपुट मेट्रिक्स आणि सानुकूल PDF निर्यात लॉग",
    status: "Active",
    iconName: "FileBarChart"
  }
];

export interface RoleAccess {
  roleName: string;
  roleNameMr: string;
  permissions: Record<string, { read: boolean; write: boolean }>;
}

export const mockCmsRoles: RoleAccess[] = [
  {
    roleName: "Administrator",
    roleNameMr: "प्रशासक",
    permissions: {
      inbox: { read: true, write: true },
      masters: { read: true, write: true },
      reports: { read: true, write: true },
      sla: { read: true, write: true },
      users: { read: true, write: true }
    }
  },
  {
    roleName: "Department Head",
    roleNameMr: "विभाग प्रमुख",
    permissions: {
      inbox: { read: true, write: true },
      masters: { read: true, write: false },
      reports: { read: true, write: true },
      sla: { read: true, write: true },
      users: { read: true, write: false }
    }
  },
  {
    roleName: "Department Officer",
    roleNameMr: "विभाग अधिकारी",
    permissions: {
      inbox: { read: true, write: true },
      masters: { read: true, write: false },
      reports: { read: true, write: false },
      sla: { read: true, write: false },
      users: { read: false, write: false }
    }
  },
  {
    roleName: "Inspector",
    roleNameMr: "निरीक्षक",
    permissions: {
      inbox: { read: true, write: true },
      masters: { read: false, write: false },
      reports: { read: false, write: false },
      sla: { read: false, write: false },
      users: { read: false, write: false }
    }
  },
  {
    roleName: "Junior Clerk",
    roleNameMr: "कनिष्ठ लिपिक",
    permissions: {
      inbox: { read: true, write: true },
      masters: { read: false, write: false },
      reports: { read: false, write: false },
      sla: { read: false, write: false },
      users: { read: false, write: false }
    }
  }
];

export const mockCmsRoleModules = [
  { key: "inbox", label: "Inbox (इनबॉक्स)" },
  { key: "masters", label: "Masters (मास्टर्स)" },
  { key: "reports", label: "Reports (रिपोर्ट)" },
  { key: "sla", label: "SLA Evaluation (मूल्यांकन)" },
  { key: "users", label: "User Management (वापरकर्ता व्यवस्थापन)" }
];
