import "server-only";

import { getAllRtsDepartments } from "@/lib/api/rts/rtsdepartment.service";
import { getAllRtsServices } from "@/lib/api/rts/rtsservices.service";
import type { Department, I18nText, Service } from "@/types/rts/departments.types";

const DEFAULT_DEPARTMENT_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800";

const DEPARTMENT_PRESENTATION: Record<
  string,
  { id: string; icon: string; image: string; label?: I18nText }
> = {
  "property tax": {
    id: "property-tax",
    icon: "Home",
    image: "https://images.unsplash.com/photo-1689574666545-3f2f9afdf632?w=800",
  },
  "trade license": {
    id: "trade-license",
    icon: "Briefcase",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80",
  },
  "water connection": {
    id: "water-connection",
    icon: "Droplets",
    image: "https://images.unsplash.com/photo-1606214554814-e8a9f97bdbb0?w=1080",
    label: { en: "Water Supply", hi: "जल आपूर्ति", mr: "पाणीपुरवठा" },
  },
  noc: {
    id: "noc",
    icon: "ShieldCheck",
    image: "https://images.unsplash.com/photo-1761671613933-159512988cb3?w=800",
  },
  "birth & death": {
    id: "birth-death",
    icon: "HeartPulse",
    image: "https://images.unsplash.com/photo-1613587261040-f2faa7e5bf23?w=800",
  },
  "town planning": {
    id: "town-planning",
    icon: "Building2",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80",
  },
  "marriage certificate": {
    id: "marriage-certificate",
    icon: "HeartHandshake",
    image: "https://images.unsplash.com/photo-1700062069869-0c59ff21fa3b?w=800",
  },
  education: {
    id: "education",
    icon: "GraduationCap",
    image: "https://images.unsplash.com/photo-1739249327281-e918124ac540?w=800",
  },
  health: {
    id: "health",
    icon: "HeartPulse",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800",
  },
  sanitation: {
    id: "sanitation",
    icon: "ShieldCheck",
    image: "https://images.unsplash.com/photo-1762805544550-f12a8ebceb2e?w=800",
  },
  tree: {
    id: "tree",
    icon: "TreePine",
    image: "https://images.unsplash.com/photo-1645753359575-c51cd95db8f9?w=800",
    label: { en: "Tree Conservation", hi: "वृक्ष संरक्षण", mr: "वृक्षसंवर्धन" },
  },
  hawkers: {
    id: "hawkers",
    icon: "ShoppingCart",
    image: "https://images.unsplash.com/photo-1751759192037-a51efd95a480?w=800",
    label: { en: "Street Vendors / Hawkers", hi: "फेरीवाला", mr: "फेरीवाले" },
  },
  "rts integration": {
    id: "rts-integration",
    icon: "Workflow",
    image: DEFAULT_DEPARTMENT_IMAGE,
  },
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function toI18nText(label: string, fallback?: I18nText): I18nText {
  return fallback ?? { en: label, hi: label, mr: label };
}

function deriveServiceIcon(serviceName: string): string {
  const key = serviceName.toLowerCase();
  if (key.includes("new") || key.includes("issue")) return "FilePlus";
  if (key.includes("renew")) return "RefreshCw";
  if (key.includes("transfer")) return "ArrowRightLeft";
  if (key.includes("certificate")) return "BadgeCheck";
  if (key.includes("noc")) return "ShieldCheck";
  if (key.includes("bill") || key.includes("tax")) return "Receipt";
  if (key.includes("complaint")) return "MessageSquareWarning";
  if (key.includes("water")) return "Droplets";
  if (key.includes("tree")) return "TreePine";
  if (key.includes("marriage")) return "Heart";
  if (key.includes("birth")) return "Baby";
  if (key.includes("death")) return "HeartOff";
  if (key.includes("education") || key.includes("school")) return "GraduationCap";
  return "FileText";
}

export async function getDashboardDepartments(): Promise<Department[]> {
  const [departmentItems, serviceItems] = await Promise.all([
    getAllRtsDepartments(),
    getAllRtsServices(),
  ]);

  const servicesByDepartmentId = new Map<number, Service[]>();

  for (const service of serviceItems) {
    const existing = servicesByDepartmentId.get(service.departmentId) ?? [];
    existing.push({
      id: String(service.id),
      name: { en: service.serviceName, hi: service.serviceName, mr: service.serviceName },
      icon: deriveServiceIcon(service.serviceName),
    });
    servicesByDepartmentId.set(service.departmentId, existing);
  }

  return departmentItems
    .filter((department) => department.isActive)
    .map((department) => {
      const presentation = DEPARTMENT_PRESENTATION[normalizeKey(department.departmentName)];
      return {
        id: presentation?.id ?? `department-${department.id}`,
        name: toI18nText(department.departmentName, presentation?.label),
        icon: department.deptIcon || presentation?.icon || "Building2",
        image: presentation?.image || DEFAULT_DEPARTMENT_IMAGE,
        services: servicesByDepartmentId.get(department.id) ?? [],
      };
    })
    .filter((department) => department.services.length > 0);
}
