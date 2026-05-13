import { FolderPlus, Key, Settings } from 'lucide-react';
import Link from 'next/link';

interface ConfigurationMasterHeaderProps {
  title: string;
  subtitle: string;
  systemLevelLabel: string;
  addCategoryLabel: string;
  addConfigKeyLabel: string;
  activeCategoryId: string;
  search?: string;
  isAdmin: boolean;
}

export function ConfigurationMasterHeader({
  title,
  subtitle,
  systemLevelLabel,
  addCategoryLabel,
  addConfigKeyLabel,
  activeCategoryId,
  search,
  isAdmin,
}: ConfigurationMasterHeaderProps) {
  const buildActionHref = (action: 'addCategory' | 'addConfigKey') => {
    const params = new URLSearchParams();
    params.set('categoryId', activeCategoryId);
    if (search) params.set('search', search);
    params.set('action', action);
    return `?${params.toString()}`;
  };

  return (
    <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-4 sm:px-8 py-4 sm:py-5">
      <div className="max-w-500 mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {title}
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100/50">
                {systemLevelLabel}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-wider">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Link
                href={buildActionHref('addCategory')}
                scroll={false}
                className="h-10 px-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-200 text-slate-600 dark:text-slate-300 font-black transition-all shadow-sm rounded-xl inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest hover:bg-slate-50"
              >
                <FolderPlus className="w-4 h-4 text-indigo-500" />
                {addCategoryLabel}
              </Link>

              <Link
                href={buildActionHref('addConfigKey')}
                scroll={false}
                className="h-10 px-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-200 text-slate-600 dark:text-slate-300 font-black transition-all shadow-sm rounded-xl inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest hover:bg-slate-50"
              >
                <Key className="w-4 h-4 text-indigo-500" />
                {addConfigKeyLabel}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
