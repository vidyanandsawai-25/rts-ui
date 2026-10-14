'use client';
/* eslint-disable i18next/no-literal-string */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowLeft, ChevronDown, FileText, ListChecks, PencilLine, Sparkles } from 'lucide-react';
import {
  AddButton,
  Badge,
  Card,
  DeleteButton,
  EditButton,
  Input,
  Label,
  MasterTable,
  SearchButton,
  Select,
  StatusBadge,
  Tabs,
  ToggleSwitch,
  useConfirm,
} from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import {
  deleteFeeRuleAction,
  deleteRuleAction,
  setRuleActiveAction,
  updateRulePrioritiesAction,
} from '@/app/[locale]/rts/configuration-settings/rts-rule/actions';
import type { RuleMasterPageData } from '@/app/[locale]/rts/configuration-settings/rts-rule/actions';
import { operatorLabel, parseStageAllocationActionValue, splitRules } from '@/lib/utils/rts/rts-rule-master';
import RtsFeeRuleEditorDrawer from './RtsFeeRuleEditorDrawer';
import RtsUserAllocationRuleDrawer from './RtsUserAllocationRuleDrawer';
import RtsRuleServicePickerDrawer from './RtsRuleServicePickerDrawer';
import RtsRulePriorityDrawer from './RtsRulePriorityDrawer';
import {
  RTS_DASHBOARD_TABLE_CLASS,
  RTS_DASHBOARD_TABLE_CONTAINER_CLASS,
  RTS_DASHBOARD_TABLE_HEAD_CLASS,
} from '@/lib/utils/rts/dashboard-table-styles';
import type { RtsRuleCondition, RtsRuleMasterRule } from '@/types/rts/rts-rulemaster.types';

const filterSelectClass =
  'w-full [&_button]:!h-8 [&_button]:!rounded-lg [&_button]:!border-slate-300 [&_button]:!bg-white [&_button]:!px-2.5 [&_button]:!text-xs';
const PAGE_SIZE = 10;

function conditionExpectedValue(value: string | null | undefined): string {
  const raw = value?.trim() ?? '';
  if (!raw.startsWith('DATE_PARTS:')) return raw;

  const [day, month, year] = raw.slice('DATE_PARTS:'.length).split('-');
  const parts = [
    day && day !== '*' ? `Day ${day}` : null,
    month && month !== '*' ? `Month ${month}` : null,
    year && year !== '*' ? `Year ${year}` : null,
  ].filter(Boolean);
  return parts.join(', ');
}

function conditionSearchText(nodes: RtsRuleCondition[]): string {
  return nodes
    .flatMap((node) => [node.expectedValue ?? '', conditionSearchText(node.children ?? [])])
    .join(' ');
}

function conditionSummaryText(
  node: RtsRuleCondition,
  fields: RuleMasterPageData['fields']
): string {
  if (node.conditionType === 'GROUP') {
    const joiner = node.conditionMatchType === 'ANY' ? ' OR ' : ' AND ';
    return `(${(node.children ?? []).map((child) => conditionSummaryText(child, fields)).join(joiner)})`;
  }
  const field = fields.find((item) => item.id === node.fieldDefinitionId);
  return `${field?.fieldLabel ?? `Field #${node.fieldDefinitionId ?? '?'}`} ${operatorLabel(node.comparisonOperator ?? '=')} ${conditionExpectedValue(node.expectedValue)}`;
}

type RuleConditionToggleProps = {
  ruleId: number;
  conditions: RtsRuleMasterRule['conditions'];
  conditionMatchType: RtsRuleMasterRule['conditionMatchType'];
  fields: RuleMasterPageData['fields'];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  allConditionsLabel: string;
  anyConditionsLabel: string;
};

function RuleConditionToggle({
  ruleId,
  conditions,
  conditionMatchType,
  fields,
  isOpen,
  onToggle,
  onClose,
  allConditionsLabel,
  anyConditionsLabel,
}: RuleConditionToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const popoverId = `rule-conditions-${ruleId}`;

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const bounds = buttonRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const viewportPadding = 8;
      const gap = 8;
      const width = Math.min(560, window.innerWidth - viewportPadding * 2);
      const height = Math.min(288, window.innerHeight - viewportPadding * 2);
      const spaceBelow = window.innerHeight - bounds.bottom - gap - viewportPadding;
      const spaceAbove = bounds.top - gap - viewportPadding;
      const opensAbove = spaceBelow < height && spaceAbove > spaceBelow;
      const top = opensAbove
        ? Math.max(viewportPadding, bounds.top - gap - height)
        : Math.min(bounds.bottom + gap, window.innerHeight - height - viewportPadding);

      setPosition({
        top,
        left: Math.max(viewportPadding, Math.min(bounds.left, window.innerWidth - width - viewportPadding)),
        width,
        height,
      });
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !popoverRef.current?.contains(target)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        buttonRef.current?.focus();
      }
    };

    updatePosition();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, onClose]);

  const logicLabel = conditionMatchType === 'ANY' ? anyConditionsLabel : allConditionsLabel;
  const popover =
    isOpen && position
      ? createPortal(
          <div
            ref={popoverRef}
            id={popoverId}
            role="dialog"
            aria-label={`Conditions for rule ${ruleId}`}
            className="fixed z-[100] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              height: position.height,
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {conditions.length} {conditions.length === 1 ? 'condition' : 'conditions'}
                </p>
                <p className="text-xs font-medium text-blue-700">{logicLabel}</p>
              </div>
              <ListChecks className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
            </div>
            <ol className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
              {conditions
                .slice()
                .sort((left, right) => left.conditionOrder - right.conditionOrder)
                .map((condition, index) => {
                  if (condition.conditionType === 'GROUP') {
                    return (
                      <li
                        key={condition.id ?? `group-${index}`}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-xs text-blue-800"
                      >
                        <span className="font-bold">
                          {condition.conditionMatchType === 'ANY' ? 'ANY' : 'ALL'} group:
                        </span>
                        <span className="ml-1 break-words">
                          {conditionSummaryText(condition, fields)}
                        </span>
                      </li>
                    );
                  }
                  const field = fields.find((item) => item.id === condition.fieldDefinitionId);
                  return (
                    <li
                      key={condition.id ?? `${condition.fieldDefinitionId}-${index}`}
                      className="flex gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-700"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                        {index + 1}
                      </span>
                      <span className="min-w-0 leading-5">
                        <span className="font-semibold text-slate-800">
                          {field?.fieldLabel ?? `Field #${condition.fieldDefinitionId}`}
                        </span>
                        {' · '}
                        {operatorLabel(condition.comparisonOperator ?? '=')}
                        {' · '}
                        <span className="break-words">{conditionExpectedValue(condition.expectedValue)}</span>
                      </span>
                    </li>
                  );
                })}
            </ol>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onClick={onToggle}
        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span className="truncate">
          {conditions.length} {conditions.length === 1 ? 'condition' : 'conditions'}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {popover}
    </>
  );
}

export default function RtsRuleMaster({
  query,
  services,
  departments,
  cards,
  ruleActions,
  service,
  rules,
  feeRules,
  fields,
}: RuleMasterPageData) {
  const t = useTranslations('rts.ruleMaster');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();
  const [searchInput, setSearchInput] = useState(query.search);
  const [cardSearchInput, setCardSearchInput] = useState(query.cardSearch ?? '');
  const [openConditionRuleId, setOpenConditionRuleId] = useState<number | null>(null);
  const [priorityDrawerOpen, setPriorityDrawerOpen] = useState(false);
  const [changingStatusRuleId, setChangingStatusRuleId] = useState<number | null>(null);
  const groups = splitRules(rules);
  const isFeeTab = query.tab === 'fee';
  const feeDisplayRules: RtsRuleMasterRule[] = feeRules.map((rule) => {
    return {
      id: rule.id,
      serviceId: rule.serviceId,
      ruleDescription: rule.ruleDescription,
      conditionMatchType: rule.conditionMatchType,
      conditions: rule.conditions,
      ruleActionType: rule.ruleActionType,
      calculationType: rule.calculationType,
      rateAmount: rule.rateAmount,
      quantityFieldDefinitionId: rule.quantityFieldDefinitionId,
      userDetails: null,
      priority: rule.priority,
      ruleGroup: 'FEE',
      actionValue: rule.calculationType,
      isCumulative: false,
      isActive: rule.isActive,
      createdDate: '',
      updatedDate: null,
    };
  });
  const tabActions = ruleActions;
  const selectedRule = query.ruleId ? rules.find((rule) => rule.id === query.ruleId) : undefined;
  const selectedFeeRule = query.ruleId
    ? feeRules.find((rule) => rule.id === query.ruleId)
    : undefined;
  const list = (isFeeTab ? feeDisplayRules : groups.assignment).filter((rule) =>
    `${rule.id} ${rule.ruleDescription} ${conditionSearchText(rule.conditions)} ${rule.ruleGroup ?? ''}`
      .toLocaleLowerCase()
      .includes(query.search.toLocaleLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(query.page, totalPages);
  const visible = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('drawer');
    params.delete('ruleId');
    params.delete('create');
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  function navigate(changes: Record<string, string | number | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('create');
    params.delete('drawer');
    params.delete('ruleId');
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === '') params.delete(key);
      else params.set(key, String(value));
    }
    router.push(`${pathname}?${params}`, { scroll: false });
  }

  function permanentlyDelete(rule: RtsRuleMasterRule) {
    if (!service) return;
    confirm({
      variant: 'delete',
      title: t('permanentDeleteTitle'),
      description: t('permanentDeleteDescription', {
        rule: rule.ruleDescription,
        id: rule.id,
      }),
      confirmText: t('permanentDelete'),
      onConfirm: async () => {
        const result = isFeeTab
          ? await deleteFeeRuleAction(service.id, rule.id)
          : await deleteRuleAction(service.id, rule.id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(t('permanentlyDeleted'));
        router.refresh();
      },
    });
  }

  async function changeRuleStatus(rule: RtsRuleMasterRule, isActive: boolean) {
    if (!service || changingStatusRuleId !== null) return;

    setChangingStatusRuleId(rule.id);
    const result = await setRuleActiveAction(service.id, rule.id, isActive);
    setChangingStatusRuleId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isActive ? t('activated') : t('deactivated'));
    router.refresh();
  }

  const tableHeaderClass = RTS_DASHBOARD_TABLE_HEAD_CLASS;
  const tableClass = `${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-sm`;
  const sharedHeaderClass = 'border-r border-blue-300/60 text-white';
  const sharedCellClass = 'border-r border-slate-100';

  const columns: Column<RtsRuleMasterRule>[] = [
    {
      key: 'id',
      label: t('id'),
      width: '76px',
      align: 'center',
      headerClassName: sharedHeaderClass,
      cellClassName: `${sharedCellClass} font-mono text-xs text-slate-600`,
    },
    {
      key: 'ruleDescription',
      label: t('description'),
      width: '220px',
      headerClassName: sharedHeaderClass,
      cellClassName: `${sharedCellClass} font-semibold text-slate-800`,
    },
    {
      key: 'conditions',
      label: t('field'),
      width: '190px',
      headerClassName: sharedHeaderClass,
      cellClassName: sharedCellClass,
      render: (_, row) =>
        row.conditions.length ? (
          <RuleConditionToggle
            ruleId={row.id}
            conditions={row.conditions}
            conditionMatchType={row.conditionMatchType}
            fields={fields}
            isOpen={openConditionRuleId === row.id}
            onToggle={() =>
              setOpenConditionRuleId((current) => (current === row.id ? null : row.id))
            }
            onClose={() => setOpenConditionRuleId(null)}
            allConditionsLabel={t('allConditions')}
            anyConditionsLabel={t('anyConditions')}
          />
        ) : (
          '—'
        ),
    },
    {
      key: 'conditionMatchType',
      label: t('conditionLogic'),
      width: '115px',
      align: 'center',
      headerClassName: sharedHeaderClass,
      cellClassName: `${sharedCellClass} font-semibold`,
      render: (value) => (value === 'ANY' ? t('anyConditions') : t('allConditions')),
    },
    {
      key: 'ruleActionType',
      label: t('action'),
      width: '145px',
      headerClassName: sharedHeaderClass,
      cellClassName: `${sharedCellClass} font-mono text-xs font-semibold text-blue-700`,
    },
    ...(isFeeTab
      ? [
          {
            key: 'rateAmount',
            label: t('amount'),
            width: '120px',
            align: 'right' as const,
            headerClassName: sharedHeaderClass,
            cellClassName: `${sharedCellClass} tabular-nums`,
            render: (_: unknown, row: RtsRuleMasterRule) => row.rateAmount ?? '—',
          },
        ]
      : [
          {
            key: 'userDetails',
            label: t('user'),
            width: '190px',
            headerClassName: sharedHeaderClass,
            cellClassName: sharedCellClass,
            render: (_: unknown, row: RtsRuleMasterRule) => {
              const user = row.userDetails;
              const stage = parseStageAllocationActionValue(row.actionValue);
              if (!user) return '—';
              return (
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate font-semibold text-slate-800">{user.userFullName}</p>
                    {stage && (
                      <Badge variant="info" size="sm" className="shrink-0 whitespace-nowrap">
                        Stage {stage.stageOrder}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    @{user.userName} · #{user.id}
                  </p>
                </div>
              );
            },
          },
        ]),
    {
      key: 'priority',
      label: t('priority'),
      width: '90px',
      align: 'center',
      headerClassName: sharedHeaderClass,
      cellClassName: `${sharedCellClass} tabular-nums`,
    },
    {
      key: 'isActive',
      label: t('status'),
      width: '100px',
      align: 'center',
      headerClassName: sharedHeaderClass,
      cellClassName: sharedCellClass,
      render: (value) => (
        <StatusBadge
          value={Boolean(value)}
          activeLabel={t('active')}
          inactiveLabel={t('inactive')}
          className="px-2 py-0.5 text-[10px]"
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <PencilLine className="size-5" aria-hidden="true" />
            <Sparkles
              className="absolute -right-1 -top-1 size-3.5 fill-blue-100"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{t('title')}</h1>
            <p className="text-xs text-slate-500">{t('subtitle')}</p>
          </div>
        </div>
        <AddButton
          label={t('add')}
          onClick={() => {
            if (!service) {
              navigate({ drawer: 'service-picker' });
              return;
            }
            if (tabActions.length === 0) {
              toast.error(t('noConfiguredActions'));
              return;
            }
            navigate({ drawer: 'rule-editor' });
          }}
        />
      </Card>
      <Tabs
        value={query.tab}
        onChange={(value) =>
          navigate({ tab: String(value), serviceId: undefined, page: 1, search: undefined })
        }
        variant="pills"
        items={[
          { value: 'fee', label: t('feeTab'), content: null },
          { value: 'assignment', label: t('assignmentTab'), content: null },
        ]}
      />
      {!service && (
        <Card className="border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-1">
              <Label className="text-[9px] font-bold uppercase leading-3 tracking-wide text-[#3d3d3d]">
                {t('search')}
              </Label>
              <form
                className="flex min-w-0 items-center gap-2 [&>div]:min-w-0 [&>div]:flex-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate({ cardSearch: cardSearchInput.trim() || undefined, page: 1 });
                }}
              >
                <Input
                  fullWidth
                  className="!h-8 !min-h-0 !px-2.5 !py-1.5 text-xs shadow-sm"
                  value={cardSearchInput}
                  onChange={(event) => setCardSearchInput(event.target.value)}
                  placeholder={t('searchServices')}
                />
                <SearchButton
                  type="submit"
                  label={t('search')}
                  className="!h-8 shrink-0 px-3 text-xs"
                />
              </form>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase leading-3 tracking-wide text-[#3d3d3d]">
                {t('department')}
              </Label>
              <Select
                value={query.departmentId ? String(query.departmentId) : ''}
                selectSize="sm"
                placeholder={t('allDepartments')}
                ariaLabel={t('department')}
                className={filterSelectClass}
                options={[
                  { label: t('allDepartments'), value: '' },
                  ...departments.map((item) => ({
                    label: item.departmentName,
                    value: String(item.id),
                  })),
                ]}
                onChange={(_, value) =>
                  navigate({
                    departmentId: value || undefined,
                    filterServiceId: undefined,
                    page: 1,
                  })
                }
              />
            </div>
          </div>
        </Card>
      )}
      {service ? (
        <>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-[#143D7D] shadow-sm transition hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={() => navigate({ serviceId: undefined, page: 1, search: undefined })}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('backToServices')}
          </button>
          <Card
            padding="none"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#183B6B]">
                  <FileText className="size-5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{service.serviceName}</span>
                </h2>
                <p className="mt-1 pl-7 text-xs font-medium text-slate-500">
                  {t('serviceRuleSubtitle', {
                    category: query.tab === 'assignment' ? t('assignmentTab') : t('feeTab'),
                    id: service.id,
                  })}
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-80"
              >
              <form
                className="flex min-w-0 flex-1 gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate({ search: searchInput.trim() || undefined, page: 1 });
                }}
              >
                <Input
                  className="h-5 min-w-0 flex-1 border-slate-300 text-sm shadow-sm"
                  aria-label={t('search')}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                />
                <SearchButton type="submit" label={t('search')} className="h-10 shrink-0 px-4" />
              </form>
              <button
                type="button"
                disabled={list.length === 0}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPriorityDrawerOpen(true)}
              >
                <ListChecks className="mr-2 size-4" aria-hidden="true" />
                Manage priority
              </button>
              </div>
            </div>
            <MasterTable
              columns={columns}
              data={visible}
              getRowKey={(row) => row.id}
              pageNumber={currentPage}
              pageSize={PAGE_SIZE}
              totalCount={list.length}
              totalPages={totalPages}
              paginationConfig={{ enabled: totalPages > 1 }}
              onPageChange={(page) => navigate({ page })}
              emptyText={t('empty')}
              actionLabel={t('actions')}
              maxBodyHeightClassName="min-h-[200px] max-h-none"
              theadClassName={tableHeaderClass}
              tableClassName={tableClass}
              containerClassName={`${RTS_DASHBOARD_TABLE_CONTAINER_CLASS} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!shadow-none`}
              renderActions={(row) => (
                <div className="flex items-center justify-center gap-1.5">
                  <EditButton
                    size="xs"
                    className="size-9 px-0"
                    aria-label={`${t('edit')} ${row.id}`}
                    title={t('edit')}
                    onClick={() => navigate({ drawer: 'rule-editor', ruleId: row.id })}
                  />
                  <ToggleSwitch
                    checked={row.isActive}
                    onChange={(isActive) => void changeRuleStatus(row, isActive)}
                    disabled={changingStatusRuleId === row.id}
                    showPopup={false}
                    activeLabel={t('active')}
                    inactiveLabel={t('inactive')}
                    id={`rule-active-${row.id}`}
                  />
                  <DeleteButton
                    size="xs"
                    className="size-9 px-0"
                    aria-label={`${t('permanentDelete')} ${row.id}`}
                    title={t('permanentDelete')}
                    onClick={() => permanentlyDelete(row)}
                  />
                </div>
              )}
            />
          </Card>
        </>
      ) : (
        <Card className="space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {query.tab === 'assignment' ? t('assignmentTab') : t('feeTab')}
            </h2>
            <p className="text-sm text-slate-500">{t('serviceCardsHint')}</p>
          </div>
          {cards?.items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.items.map((card) => (
                <button
                  key={card.serviceId}
                  type="button"
                  className="rounded-xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
                  onClick={() =>
                    navigate({ serviceId: card.serviceId, page: 1, search: undefined })
                  }
                >
                  <span className="block text-base font-bold text-slate-900">
                    {card.serviceName}
                  </span>
                  {card.departmentName && (
                    <span className="mt-1 block text-xs text-slate-500">{card.departmentName}</span>
                  )}
                  <span className="mt-5 block text-sm font-semibold text-blue-700">
                    {card.ruleCount} {t('rulesAssigned')}
                  </span>
                  {'activeRuleCount' in card && (
                    <span className="block text-xs text-slate-500">
                      {(card as { activeRuleCount: number }).activeRuleCount} {t('active')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">{t('noServiceCards')}</p>
          )}
          {cards && cards.totalPages > 1 && (
            <div className="flex items-center justify-end gap-3 text-sm">
              <button
                type="button"
                disabled={query.page <= 1}
                onClick={() => navigate({ page: query.page - 1 })}
              >
                {t('previous')}
              </button>
              <span>
                {query.page} / {cards.totalPages}
              </span>
              <button
                type="button"
                disabled={query.page >= cards.totalPages}
                onClick={() => navigate({ page: query.page + 1 })}
              >
                {t('next')}
              </button>
            </div>
          )}
        </Card>
      )}
      <RtsRuleServicePickerDrawer
        open={query.drawer === 'service-picker'}
        departments={departments}
        services={services}
        initialServiceId={query.filterServiceId}
        onClose={closeDrawer}
        onContinue={(serviceId) =>
          navigate({ serviceId, drawer: 'rule-editor', page: 1, search: undefined })
        }
      />
      {service &&
        query.drawer === 'rule-editor' &&
        (!query.ruleId || (isFeeTab ? selectedFeeRule : selectedRule)) &&
        (query.tab === 'assignment' ? (
          <RtsUserAllocationRuleDrawer
            key={`assignment-${selectedRule?.id ?? 'new'}`}
            open
            rule={selectedRule}
            service={service}
            fields={fields}
            onClose={closeDrawer}
            onSaved={() => {
              closeDrawer();
              router.refresh();
            }}
          />
        ) : (
          <RtsFeeRuleEditorDrawer
            key={`fee-${selectedFeeRule?.id ?? 'new'}`}
            open
            rule={selectedFeeRule}
            service={service}
            fields={fields}
            onClose={closeDrawer}
            onSaved={() => {
              closeDrawer();
              router.refresh();
            }}
          />
        ))}
      {service && (
        <RtsRulePriorityDrawer
          key={`${query.tab}:${(isFeeTab ? feeDisplayRules : groups.assignment).map((rule) => `${rule.id}-${rule.priority}`).join(',')}`}
          open={priorityDrawerOpen}
          rules={isFeeTab ? feeDisplayRules : groups.assignment}
          title={`Manage ${isFeeTab ? 'fee' : 'user-allocation'} rule priority`}
          onClose={() => setPriorityDrawerOpen(false)}
          onSave={async (ruleIdsInOrder) => {
            const result = await updateRulePrioritiesAction(
              service.id,
              isFeeTab ? 'FEE' : 'USER_ALLOCATION',
              ruleIdsInOrder
            );
            if (!result.success) {
              toast.error(result.error);
              throw new Error(result.error);
            }
            toast.success('Rule priority order updated.');
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
