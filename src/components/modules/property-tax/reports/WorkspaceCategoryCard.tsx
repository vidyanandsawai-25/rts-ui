'use client';
import type { Category } from './ReportWorkspaceConfig';

interface CategoryCardProps {
  category: Category;
  label: string;
  count: number;
  reportsCountTemplate: string;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, label, count, reportsCountTemplate, isSelected, onClick }: CategoryCardProps) {
  const Icon = category.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border p-3 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 w-full hover:-translate-y-1 hover:shadow-md focus:outline-none
        ${isSelected
          ? `${category.borderColor} ${category.bgColor} ${category.glowClass} border-2 shadow-lg scale-[1.03]`
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
    >
      <span className={`p-2 rounded-xl transition-all duration-300 ${isSelected ? category.iconBg : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${isSelected ? category.color : 'text-gray-500'}`} />
      </span>
      <div className="flex flex-col items-center">
        <span className={`block text-xs font-bold leading-tight ${isSelected ? 'text-gray-900 font-extrabold' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 transition-all duration-300
        ${isSelected
          ? `${category.color} ${category.iconBg}`
          : 'text-gray-500 bg-gray-100'
        }`}
      >
        {reportsCountTemplate.replace('{count}', String(count))}
      </span>
    </button>
  );
}
