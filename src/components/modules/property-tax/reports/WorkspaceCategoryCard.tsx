'use client';
import type { Category } from './ReportWorkspaceConfig';
import Image from 'next/image';
import { Badge } from '@/components/common';
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
      className={`relative rounded-xl border p-3 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 w-full hover:-translate-y-1 hover:shadow-md focus:outline-none bg-white
        ${isSelected
          ? `${category.borderColor} ${category.glowClass} border-2 shadow-lg scale-[1.03]`
          : 'border-gray-200 text-gray-700 hover:border-gray-300'
        }`}
    >
      {isSelected && (
        <Badge variant="secondary" className={`bg-transparent border-none px-0 hover:bg-transparent absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${category.color}`} style={{ backgroundColor: 'currentColor' }} />
      )}
      <Badge variant="secondary" className={`bg-transparent border-none px-0 hover:bg-transparent transition-all duration-300`}>
        {category.logoBase64 && category.logoContentType ? (
          <Image
            src={`data:${category.logoContentType};base64,${category.logoBase64}`}
            alt={label}
            width={24}
            height={24}
            className={`w-6 h-6 object-contain ${!isSelected && 'grayscale opacity-60'}`}
          />
        ) : Icon ? (
          <Icon className={`w-5 h-5 ${isSelected ? category.color : 'text-gray-500'}`} />
        ) : null}
      </Badge>
      <div className="flex flex-col items-center">
        <Badge variant="secondary" className={`bg-transparent border-none px-0 hover:bg-transparent block text-xs font-bold leading-tight ${isSelected ? `${category.color} font-extrabold` : 'text-gray-700'}`}>
          {label}
        </Badge>
      </div>
      <Badge variant="secondary" className={`bg-transparent border-none px-0 hover:bg-transparent text-[10px] font-bold mt-1.5 transition-all duration-300
        ${isSelected
          ? category.color
          : 'text-gray-500'
        }`}
      >
        {reportsCountTemplate.replace('{count}', String(count))}
      </Badge>
    </button>
  );
}
