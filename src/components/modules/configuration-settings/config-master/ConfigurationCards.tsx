import { ConfigCategory } from '@/types/configMaster.types';
import { CategoryCard } from './CategoryCard';

interface ConfigurationCardsProps {
  categories: ConfigCategory[];
  activeCategoryId: string;
  search?: string;
}

export function ConfigurationCards({
  categories,
  activeCategoryId,
  search,
}: ConfigurationCardsProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1 -mx-1 mask-fade-right">
      {categories.map((category) => (
        <div key={category.id} className="min-w-55 sm:min-w-65 flex-1 max-w-80">
          <CategoryCard
            category={category}
            isActive={category.id === activeCategoryId}
            search={search}
          />
        </div>
      ))}
    </div>
  );
}
