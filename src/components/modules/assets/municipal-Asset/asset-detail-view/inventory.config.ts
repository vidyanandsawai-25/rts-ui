import { Package, Settings, Armchair, CarFront, Monitor, FileText, Shield } from 'lucide-react';

export const INVENTORY_FALLBACK_COLORS = [
  { color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50' },
  { color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { color: 'text-pink-600', bgColor: 'bg-pink-50' },
];

export const getInventoryCategoryStyling = (cat: string) => {
  const c = cat.toLowerCase();
  
  // 1) Define explicit colors for known categories
  if (c.includes('furniture')) return { color: 'text-rose-600', bgColor: 'bg-rose-50' };
  if (c.includes('electronic')) return { color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
  if (c.includes('stationery')) return { color: 'text-teal-600', bgColor: 'bg-teal-50' };
  if (c.includes('tool')) return { color: 'text-orange-600', bgColor: 'bg-orange-50' };
  if (c.includes('vehicle')) return { color: 'text-amber-700', bgColor: 'bg-amber-50' };
  if (c.includes('safety')) return { color: 'text-sky-600', bgColor: 'bg-sky-50' };
  if (cat === 'Total Inventory') return { color: 'text-blue-800', bgColor: 'bg-blue-50' };
  
  // 2) Deterministic random color for unknown categories
  const hash = c.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return INVENTORY_FALLBACK_COLORS[hash % INVENTORY_FALLBACK_COLORS.length];
};

export const getInventoryCategoryIcon = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes('furniture')) return Armchair;
  if (c.includes('electronic')) return Monitor;
  if (c.includes('stationery')) return FileText;
  if (c.includes('tool')) return Settings;
  if (c.includes('vehicle')) return CarFront;
  if (c.includes('safety')) return Shield;
  return Package;
};
