'use client';

import { Package, Settings2 } from 'lucide-react';
import { Drawer } from '@/components/common/Drawer';
import { Badge } from '@/components/common/Badge';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { useRouter } from 'next/navigation';
import type { Department, Module } from '@/types/departmentActivation.types';
import { useTranslations } from 'next-intl';

interface SubmoduleConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  modules: Module[];
  onToggleModule: (module: Module) => void;
}

export function SubmoduleConfigDialog({
    isOpen,
    onOpenChange,
    department,
    modules,
    onToggleModule,
}: SubmoduleConfigDialogProps) {
    const router = useRouter();
    const t = useTranslations('departmentActivation');

    if (!department) return null;

    const activeCount = modules.filter(m => m.isActive).length;
    const totalCount = modules.length;

    return (
        <Drawer
            open={isOpen}
            onClose={() => {
                onOpenChange(false);
                router.refresh();
            }}
            title={`${department.departmentName} - ${t('modal.title')}`}
            width="lg"
        >
            <div className="flex flex-col h-full">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 -mx-4 -mt-4 mb-4">
                    <div className="flex items-center gap-2 text-base font-semibold">
                        <Settings2 className="w-4 h-4" />
                        {department.departmentName} - {t('modal.title')}
                    </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 border-b mb-4 -mx-4 px-4">
                    <span className="text-xs font-medium">{activeCount} / {totalCount} {t('modal.title')}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {modules.map((module) => (
                        <div key={module.moduleId} className={`p-3 border-2 rounded-lg transition-all ${module.isActive ? 'bg-emerald-50 border-emerald-200 border-l-4' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <Package className={`w-4 h-4 mt-1 ${module.isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold">{module.moduleName}</h4>
                                            <Badge variant="secondary" className="text-[10px]">{module.moduleCode}</Badge>
                                        </div>
                                        <ToggleSwitch checked={module.isActive} onChange={() => onToggleModule(module)} showPopup={false} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{module.moduleDescription || t('card.noDescription')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Drawer>
    );
}

export default SubmoduleConfigDialog;
