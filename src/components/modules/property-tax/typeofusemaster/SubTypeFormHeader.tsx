import { ListTree } from 'lucide-react';

type TranslatorFunction = (key: string, values?: Record<string, string | number>) => string;

interface SubTypeFormHeaderProps {
  isEdit: boolean;
  typeLabel: string;
  t: TranslatorFunction;
}

export function SubTypeFormHeader({ isEdit, typeLabel, t }: SubTypeFormHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
        <ListTree size={20} />
      </div>
      <div>
        <div className="text-lg font-bold text-blue-900">
          {isEdit ? t('subtype.edit') : t('subtype.add')}
        </div>
        <div className="text-sm text-slate-500">
          {typeLabel ? t('subtype.forType', { type: typeLabel }) : t('subtype.addSubtitle')}
        </div>
      </div>
    </div>
  );
}
