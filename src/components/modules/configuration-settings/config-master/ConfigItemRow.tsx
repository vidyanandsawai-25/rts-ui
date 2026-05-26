'use client';

import { Shield, Calendar, Loader2 } from 'lucide-react';
import { Card, Badge, ToggleSwitch, useToast } from '@/components/common';
import { ConfigItemActions } from './ConfigItemActions';
import { ConfigItem } from '@/types/configMaster.types';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { updateConfigItemAction } from '@/app/[locale]/configuration-settings/config-master/actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { highlightText } from './config-master-ui.utils';

interface ConfigItemRowProps {
  item: ConfigItem;
  searchTerm?: string;
  locale: string;
}

export function ConfigItemRow({ 
  item, 
  searchTerm = '', 
  locale,
}: ConfigItemRowProps) {
  const t = useTranslations('configMaster');
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newValue = !item.isEnabled;

    startTransition(async () => {
      const result = await updateConfigItemAction({
        id: item.id,
        configKeyId: item.configKeyId,
        value: newValue,
        isKey: true,
      });

      if (result.success) {
        success(result.message || '');
        router.refresh();
      } else {
        toastError(result.error || '');
      }
    });
  };

  return (
    <Card
      className={cn(
        "group relative flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 transition-all duration-300 gap-4 overflow-visible",
        item.isEnabled
          ? 'bg-emerald-50/10 border-emerald-100/50'
          : 'bg-white border-slate-100 shadow-sm'
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <div className={cn(
          "p-2.5 rounded-xl transition-all shrink-0 border",
          item.isEnabled
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/50'
            : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
        )}>
          <Shield className="w-5 h-5 transition-transform group-hover:scale-110" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span 
              className={cn(
                "font-bold text-sm sm:text-base tracking-tight transition-colors line-clamp-2 flex-1",
                item.isEnabled ? "text-slate-900" : "text-slate-500"
              )}
              title={item.name}
            >
              {highlightText(item.name, searchTerm)}
            </span>
            <Badge 
              variant={item.isEnabled ? "success" : "secondary"} 
              size="sm" 
              className={cn(
                "h-4 py-0 px-1.5 text-[8px] font-black uppercase tracking-widest",
                !item.isEnabled && "bg-slate-100 text-slate-400 border-slate-200"
              )}
            >
              {item.isEnabled ? t('list.on') : t('list.off')}
            </Badge>
          </div>

          {item.description && (
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1 mb-2">
              {highlightText(item.description, searchTerm)}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {t('list.currentValue') || 'Value'}
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  {(() => {
                    const val = item.value || item.defaultValue || '';
                    const control = (item.controlType || '').toLowerCase();
                    if (val === 'true') return t('list.on') || 'ON';
                    if (val === 'false') return t('list.off') || 'OFF';
                    if (val) return val;
                    if (control === 'toggle' || control === 'checkbox') {
                      return item.isEnabled ? (t('list.on') || 'ON') : (t('list.off') || 'OFF');
                    }
                    return '-';
                  })()}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400/70">
                <Calendar className="w-3 h-3" />
                <span className="uppercase tracking-tight">
                  {item.updatedDate 
                    ? new Date(item.updatedDate).toLocaleDateString(locale, { 
                        month: '2-digit', 
                        day: '2-digit' 
                      }) + ' ' + new Date(item.updatedDate).toLocaleTimeString(locale, { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: false 
                      })
                    : '—'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 relative min-w-[120px] sm:min-w-[200px]">
        {/* Actions & Toggle Container - hidden when loading to prevent overlap */}
        <div className={cn(
          "flex items-center justify-end gap-3 sm:gap-4 transition-all duration-200",
          isPending ? "opacity-0 invisible scale-95" : "opacity-100 visible scale-100"
        )}>
          <ConfigItemActions 
            id={item.id} 
            configKeyId={item.configKeyId} 
            name={item.name} 
            isEnabled={item.isEnabled} 
          />
          <div className="flex items-center justify-center scale-[0.85] sm:scale-100">
            <ToggleSwitch 
              checked={item.isEnabled} 
              onChange={handleToggle} 
              showPopup={false} 
              disabled={isPending} 
            />
          </div>
        </div>

        {/* Row-level Loader - centered in the action area */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">
                {t('messages.savingConfig') || 'Saving...'}
              </span>
            </div>
          </div>
        )}
      </div>

    </Card>
  );
}