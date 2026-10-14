'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ListFilter, Search, Settings2, UserRoundCheck } from 'lucide-react';
import {
  Badge,
  CancelButton,
  Checkbox,
  Drawer,
  Input,
  Label,
  SaveButton,
  Select,
} from '@/components/common';
import {
  getAssignmentWorkflowStagesAction,
  getStageRuleOfficersAction,
  saveRuleAction,
  type RuleDraft,
  type RuleMasterPageData,
  type RuleStageOfficer,
} from '@/app/[locale]/rts/configuration-settings/rts-rule/actions';
import { parseStageAllocationActionValue, serializeStageAllocationActionValue } from '@/lib/utils/rts/rts-rule-master';
import type { RtsApprovalFlowStageMasterApiItem } from '@/types/rts/workflow.types';
import type { RtsRuleMasterRule } from '@/types/rts/rts-rulemaster.types';
import RuleConditionTreeEditor, {
  createPredicate,
  normalizeConditionOrders,
} from './RuleConditionTreeEditor';

const fieldClass =
  'w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const selectClass =
  'w-full [&_button]:!h-10 [&_button]:!rounded-lg [&_button]:!border-slate-300 [&_button]:!bg-white [&_button]:!px-3 [&_button]:!text-sm';

function draftFromRule(rule: RtsRuleMasterRule): RuleDraft {
  return {
    ruleDescription: rule.ruleDescription,
    conditionMatchType: rule.conditionMatchType ?? 'ALL',
    conditions: normalizeConditionOrders(rule.conditions),
    ruleActionType: 'STAGE_ALLOCATION',
    calculationType: null,
    rateAmount: null,
    quantityFieldDefinitionId: null,
    userId: rule.userDetails?.id ?? null,
    priority: rule.priority,
    ruleGroup: 'USER_ALLOCATION',
    actionValue: rule.actionValue,
    isCumulative: false,
    isActive: rule.isActive,
  };
}

function blankDraft(): RuleDraft {
  return {
    ruleDescription: '',
    conditionMatchType: 'ALL',
    conditions: [createPredicate(1)],
    ruleActionType: 'STAGE_ALLOCATION',
    calculationType: null,
    rateAmount: null,
    quantityFieldDefinitionId: null,
    userId: null,
    priority: 1,
    ruleGroup: 'USER_ALLOCATION',
    actionValue: null,
    isCumulative: false,
    isActive: true,
  };
}

export default function RtsUserAllocationRuleDrawer({
  open,
  rule,
  service,
  fields,
  onClose,
  onSaved,
}: {
  open: boolean;
  rule?: RtsRuleMasterRule;
  service: NonNullable<RuleMasterPageData['service']>;
  fields: RuleMasterPageData['fields'];
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations('rts.ruleMaster');
  const [editor, setEditor] = useState<{ id?: number; draft: RuleDraft }>(() =>
    rule ? { id: rule.id, draft: draftFromRule(rule) } : { draft: blankDraft() }
  );
  const [stages, setStages] = useState<RtsApprovalFlowStageMasterApiItem[]>([]);
  const [stagesLoading, setStagesLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [stageOfficers, setStageOfficers] = useState<RuleStageOfficer[]>([]);
  const [selectedUser, setSelectedUser] = useState<RuleStageOfficer | null>(null);
  const selectedUserIdRef = useRef<number | null>(rule?.userDetails?.id ?? null);
  const [officersLoading, setOfficersLoading] = useState(() =>
    Boolean(parseStageAllocationActionValue(rule?.actionValue ?? null))
  );
  const [officersError, setOfficersError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selectedStage = parseStageAllocationActionValue(editor.draft.actionValue);
  const filteredStageOfficers = useMemo(() => {
    const query = userQuery.trim().toLocaleLowerCase();
    if (!query) return stageOfficers;
    if (/^\d+$/.test(query)) return stageOfficers.filter((officer) => String(officer.id) === query);
    return stageOfficers.filter((officer) =>
      `${officer.name} ${officer.userName}`.toLocaleLowerCase().includes(query)
    );
  }, [stageOfficers, userQuery]);

  useEffect(() => {
    let active = true;
    void getAssignmentWorkflowStagesAction(service.id).then((result) => {
      if (!active) return;
      if (result.success) {
        setStages(result.data);
        setError('');
      } else {
        setError(result.error);
      }
      setStagesLoading(false);
    });
    return () => {
      active = false;
    };
  }, [service.id]);

  useEffect(() => {
    const stageId = selectedStage?.approvalFlowStageId;
    if (!stageId) {
      return;
    }
    let active = true;
    void getStageRuleOfficersAction(service.id, stageId)
      .then((result) => {
        if (!active) return;
        if (!result.success) {
          setStageOfficers([]);
          setSelectedUser(null);
          setOfficersError(result.error);
          return;
        }

        setStageOfficers(result.data);
        const selected =
          result.data.find((officer) => officer.id === selectedUserIdRef.current) ?? null;
        setSelectedUser(selected);
        if (selectedUserIdRef.current && !selected) {
          selectedUserIdRef.current = null;
          setEditor((current) => ({ ...current, draft: { ...current.draft, userId: null } }));
          setOfficersError(t('invalidStageOfficer'));
        }
      })
      .finally(() => {
        if (active) setOfficersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedStage?.approvalFlowStageId, service.id, t]);

  const stageOptions = useMemo(
    () => [
      { label: t('chooseStage'), value: '' },
      ...stages.map((stage) => ({
        label: t('stageOption', { order: stage.stageOrder, name: stage.stageName }),
        value: String(stage.id),
      })),
    ],
    [stages, t]
  );

  function change<K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) {
    setEditor((current) => ({ ...current, draft: { ...current.draft, [key]: value } }));
  }

  function chooseUser(user: RuleStageOfficer) {
    selectedUserIdRef.current = user.id;
    setSelectedUser(user);
    change('userId', user.id);
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await saveRuleAction(service.id, editor.id, {
        ...editor.draft,
        ruleActionType: 'STAGE_ALLOCATION',
        ruleGroup: 'USER_ALLOCATION',
        calculationType: null,
        rateAmount: null,
        quantityFieldDefinitionId: null,
        isCumulative: false,
        conditions: normalizeConditionOrders(editor.draft.conditions),
      });
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(t('saved'));
      onSaved();
    } catch {
      const message = t('networkError');
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      title={editor.id ? t('edit') : t('add')}
      width="2xl"
      hideHeader
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex justify-end gap-2">
          <CancelButton label={t('cancel')} disabled={busy} onClick={onClose} />
          <SaveButton
            label={t('save')}
            disabled={busy || stagesLoading}
            isLoading={busy}
            onClick={save}
          />
        </div>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143D7D] py-4 pl-5 pr-3 text-white shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10">
              <UserRoundCheck className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="drawer-title" className="truncate text-base font-extrabold">
                {editor.id ? t('editAllocationRule') : t('createAllocationRule')}
              </h2>
              <p className="truncate text-[11px] font-semibold text-blue-100">
                {service.serviceName} · {t('serviceId')}: {service.id}
              </p>
            </div>
          </div>
          <Badge className="shrink-0 border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white">
            {t('userAllocationRule')}
          </Badge>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-5">
          <div className="w-full space-y-3">
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#143D7D]">
                  <ListFilter className="size-4" aria-hidden="true" />
                  {t('ruleDetails')}
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">{t('description')}</Label>
                  <Input
                    className={fieldClass}
                    maxLength={200}
                    value={editor.draft.ruleDescription}
                    onChange={(event) => change('ruleDescription', event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    {t('conditionLogic')}
                  </Label>
                  <Select
                    className={selectClass}
                    selectSize="sm"
                    value={editor.draft.conditionMatchType}
                    options={[
                      { label: t('allConditions'), value: 'ALL' },
                      { label: t('anyConditions'), value: 'ANY' },
                    ]}
                    onChange={(_, value) => change('conditionMatchType', value as 'ALL' | 'ANY')}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#143D7D]">
                    <ListFilter className="size-4" aria-hidden="true" />
                    {t('conditionSection')}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">{t('conditionHelp')}</p>
                </div>
              </div>
              <RuleConditionTreeEditor
                conditions={editor.draft.conditions}
                fields={fields}
                rootConditionMatchType={editor.draft.conditionMatchType}
                onChange={(conditions) => change('conditions', conditions)}
              />
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-[#143D7D]">
                <UserRoundCheck className="size-4" aria-hidden="true" />
                {t('assignmentSection')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-slate-700">{t('action')}</Label>
                  <Input className={fieldClass} value="STAGE_ALLOCATION" disabled readOnly />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-slate-700">{t('stage')}</Label>
                  <Select
                    className={selectClass}
                    selectSize="sm"
                    disabled={stagesLoading || stages.length === 0}
                    value={selectedStage ? String(selectedStage.approvalFlowStageId) : ''}
                    ariaLabel={t('stage')}
                    placeholder={stagesLoading ? t('loadingStages') : t('chooseStage')}
                    options={stageOptions}
                    onChange={(_, value) => {
                      const stage = stages.find((item) => item.id === Number(value));
                      setUserQuery('');
                      selectedUserIdRef.current = null;
                      setSelectedUser(null);
                      setStageOfficers([]);
                      setOfficersError('');
                      setOfficersLoading(Boolean(stage));
                      setEditor((current) => ({
                        ...current,
                        draft: {
                          ...current.draft,
                          actionValue: stage
                            ? serializeStageAllocationActionValue({
                                approvalFlowStageId: stage.id,
                                stageOrder: stage.stageOrder,
                              })
                            : null,
                          userId: null,
                        },
                      }));
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-xs font-semibold text-slate-700">
                      {t('stageOfficers')}
                    </Label>
                    {selectedUser && (
                      <span className="text-xs font-semibold text-blue-700">
                        {t('selectedStageOfficer')}
                      </span>
                    )}
                  </div>
                  {!selectedStage ? (
                    <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500">
                      {t('chooseStageForOfficers')}
                    </p>
                  ) : (
                    <>
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />
                        <Input
                          className={`${fieldClass} pl-9`}
                          value={userQuery}
                          onChange={(event) => setUserQuery(event.target.value)}
                          placeholder={t('searchStageOfficersPlaceholder')}
                          aria-label={t('searchStageOfficers')}
                        />
                      </div>
                      {officersError && (
                        <p role="alert" className="text-xs text-red-700">
                          {officersError}
                        </p>
                      )}
                      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                        {officersLoading ? (
                          <p className="rounded-lg border border-slate-200 px-3 py-4 text-xs text-slate-500">
                            {t('loadingStageOfficers')}
                          </p>
                        ) : stageOfficers.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500">
                            {t('noStageOfficers')}
                          </p>
                        ) : filteredStageOfficers.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500">
                            {t('noMatchingStageOfficers')}
                          </p>
                        ) : (
                          filteredStageOfficers.map((officer) => {
                            const selected = selectedUser?.id === officer.id;
                            return (
                              <button
                                key={officer.id}
                                type="button"
                                aria-pressed={selected}
                                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
                                  selected
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                                }`}
                                onClick={() => chooseUser(officer)}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-slate-800">
                                    {officer.name}
                                  </span>
                                  <span className="block truncate text-xs text-slate-500">
                                    {t('userOptionDetail', {
                                      userName: officer.userName,
                                      id: officer.id,
                                    })}
                                  </span>
                                </span>
                                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                  {t('stageOfficerPriority', { priority: officer.priority })}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-[#143D7D]">
                <Settings2 className="size-4" aria-hidden="true" />
                {t('settingsSection')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {editor.id ? (
                  <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    <Checkbox
                      className="size-4"
                      checked={editor.draft.isActive}
                      onCheckedChange={(checked) => change('isActive', checked)}
                    />
                    {t('active')}
                  </label>
                ) : (
                  <p className="self-end text-xs text-slate-500">{t('createdActive')}</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
