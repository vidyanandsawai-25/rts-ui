'use client';

import { useEffect, useState, useTransition } from 'react';
import { GitMerge, Search, Trash2, UserRoundCog } from 'lucide-react';
import WorkflowStageOfficerEditor from './WorkflowStageOfficerEditor';
import {
  AddButton,
  CancelButton,
  Card,
  Drawer,
  EditButton,
  Input,
  MasterTable,
  SaveButton,
  Select,
  StatusBadge,
  TextArea,
  ToggleSwitch,
} from '@/components/common';
import { useConfirm } from '@/components/common/ConfirmProvider';
import type { Column } from '@/components/common/MasterTable';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  RTS_DASHBOARD_TABLE_CLASS,
  RTS_DASHBOARD_TABLE_CONTAINER_CLASS,
  RTS_DASHBOARD_TABLE_HEAD_CLASS,
} from '@/lib/utils/rts/dashboard-table-styles';
interface WorkflowItem {
  id: number;
  serviceId: number;
  flowName: string;
  isActive: boolean;
  stagesCount?: number;
  [key: string]: unknown;
}

export interface StageConfigItem {
  id?: number;
  stageOrder: number;
  stageName: string;
  slaDays: number;
  canVerifyDocument: boolean;
  canEdit: boolean;
  canViewNoteSheet: boolean;
  canIssueCertificate: boolean;
  canViewCertificate: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  canPay: boolean;
  isFinalStage: boolean;
  userAllocationCount?: number;
}

interface RtsWorkflowsConfigProps {
  data: {
    workflows: WorkflowItem[];
    departments: { id: string; name: string; nameLocal?: string | null }[];
    services: { id: string; name: string; nameLocal?: string | null; departmentId: string }[];
  };
  locale: string;
  getStagesByApprovalFlowId?: (approvalFlowId: number) => Promise<StageConfigItem[]>;
  saveWorkflow?: (data: {
    workflowId?: number;
    serviceId: number;
    flowName: string;
    isActive: boolean;
    stages: StageConfigItem[];
  }) => Promise<{ success: boolean; workflow?: WorkflowItem; error?: string }>;
  setWorkflowActive?: (
    id: number,
    isActive: boolean
  ) => Promise<{ success: boolean; isActive?: boolean; error?: string }>;
}

type WorkflowTableRow = Record<string, unknown> & WorkflowItem;

const actionPermissions = [
  { field: 'canVerifyDocument', label: 'verifyDocs' },
  { field: 'canEdit', label: 'canEdit' },
  { field: 'canPay', label: 'canPay' },
  { field: 'canApprove', label: 'approve' },
  { field: 'canReturn', label: 'canReturn' },
  { field: 'canReject', label: 'reject' },
] as const;

const viewPermissions = [
  { field: 'canViewNoteSheet', label: 'canViewNoteSheet' },
  { field: 'canIssueCertificate', label: 'canIssueCertificate' },
] as const;

function StageConfigCard({
  stage,
  onChange,
  onRemove,
  onManageUsers,
}: {
  stage: StageConfigItem;
  onChange: (stage: StageConfigItem) => void;
  onRemove: () => void;
  onManageUsers: () => void;
}) {
  const t = useTranslations('rts.workflowMaster');
  return (
    <Card padding="sm" className="rounded-xl border-slate-200 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 border-b border-slate-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:flex-1">
          <h4 className="text-xs font-bold text-blue-950">
            {t('stageNumber', { order: stage.stageOrder })}
          </h4>
          <StatusBadge
            variant="info"
            label={t('assignedUsers', { count: stage.userAllocationCount ?? 0 })}
            className="whitespace-nowrap px-2 py-0.5 text-[11px] shadow-none"
          />
        </div>
        <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onManageUsers}
            disabled={!stage.id}
            title={stage.id ? t('manageStageUsers') : t('saveStageBeforeUsers')}
            className="flex items-center gap-1 whitespace-nowrap rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserRoundCog className="h-3.5 w-3.5" aria-hidden="true" />
            {t('manageStageUsers')}
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={t('removeStage')}
            title={t('removeStage')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {!stage.id && <p className="mb-3 text-[11px] text-slate-500">{t('saveStageBeforeUsers')}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          label={t('stageNameLabel')}
          value={stage.stageName}
          onChange={(event) => onChange({ ...stage, stageName: event.target.value })}
          fullWidth
          className="h-9 text-xs"
        />
        <Input
          label={t('slaDaysLabel')}
          type="number"
          min={1}
          value={stage.slaDays}
          onChange={(event) => onChange({ ...stage, slaDays: Number(event.target.value) })}
          fullWidth
          className="h-9 text-xs"
        />
      </div>
      <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/40 p-2 [&>div]:justify-between [&_span]:!text-xs">
        <ToggleSwitch
          checked={stage.isFinalStage}
          onChange={(checked) => onChange({ ...stage, isFinalStage: checked })}
          label={t('finalStage')}
          showPopup={false}
        />
      </div>
      <div className="mt-4">
        <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">
          {t('approvalActionConfig')}
        </h5>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {actionPermissions.map((permission) => (
            <div
              key={permission.field}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 [&>div]:justify-between [&_span]:!text-[11px]"
            >
              <ToggleSwitch
                checked={stage[permission.field]}
                onChange={(checked) => onChange({ ...stage, [permission.field]: checked })}
                label={t(permission.label)}
                showPopup={false}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">
          {t('viewIssueConfig')}
        </h5>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {viewPermissions.map((permission) => (
            <div
              key={permission.field}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 [&>div]:justify-between [&_span]:!text-[11px]"
            >
              <ToggleSwitch
                checked={stage[permission.field]}
                onChange={(checked) => onChange({ ...stage, [permission.field]: checked })}
                label={t(permission.label)}
                showPopup={false}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function RtsWorkflowsConfig({
  data,
  locale,
  getStagesByApprovalFlowId,
  saveWorkflow,
  setWorkflowActive,
}: RtsWorkflowsConfigProps) {
  const t = useTranslations('rts');
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>(data.workflows);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('All');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer states
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);

  // Form states
  const [formDepartmentId, setFormDepartmentId] = useState<string>('');
  const [formServiceId, setFormServiceId] = useState<string>('');
  const [formFlowName, setFormFlowName] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(false);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [stagesError, setStagesError] = useState('');

  // Stages for the active form
  const [stages, setStages] = useState<StageConfigItem[]>([
    {
      stageOrder: 1,
      stageName: 'Document Verification (Clerk)',
      slaDays: 2,
      canVerifyDocument: true,
      canEdit: false,
      canViewNoteSheet: false,
      canIssueCertificate: false,
      canViewCertificate: false,
      canApprove: false,
      canReject: false,
      canReturn: true,
      canPay: false,
      isFinalStage: false,
    },
    {
      stageOrder: 2,
      stageName: 'Final Approval (Senior Officer)',
      slaDays: 3,
      canVerifyDocument: false,
      canEdit: false,
      canViewNoteSheet: false,
      canIssueCertificate: false,
      canViewCertificate: false,
      canApprove: true,
      canReject: true,
      canReturn: true,
      canPay: false,
      isFinalStage: true,
    },
  ]);

  const filteredServicesForFilter = data.services.filter(
    (s) => selectedDeptId === 'All' || s.departmentId === selectedDeptId
  );
  const formServices = data.services.filter((service) => service.departmentId === formDepartmentId);

  const filteredWorkflows = workflowsList.filter((w) => {
    const serviceObj = data.services.find((s) => String(s.id) === String(w.serviceId));
    const deptMatch =
      selectedDeptId === 'All' || (serviceObj && serviceObj.departmentId === selectedDeptId);
    const serviceMatch = selectedServiceId === 'All' || String(w.serviceId) === selectedServiceId;
    const searchMatch = !searchTerm || w.flowName.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus === 'All' || w.isActive === (selectedStatus === 'Active');
    return deptMatch && serviceMatch && searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredWorkflows.length / pageSize) || 1;
  const paginatedWorkflows = filteredWorkflows.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  const drawerName = searchParams.get('drawer');
  const drawerMode = searchParams.get('mode');
  const workflowIdParam = searchParams.get('workflowId');
  const subDrawerName = searchParams.get('subDrawer');
  const stageIdParam = searchParams.get('stageId');
  const isDrawerOpen = drawerName === 'workflow-editor';
  const selectedStageId = Number(stageIdParam);
  const isStageUsersDrawerOpen =
    isDrawerOpen && subDrawerName === 'stage-users' && Number.isSafeInteger(selectedStageId);
  const updateDrawerRoute = (next: { mode?: 'create'; workflowId?: number } | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('drawer');
    params.delete('mode');
    params.delete('workflowId');
    params.delete('subDrawer');
    params.delete('stageId');

    if (next) {
      params.set('drawer', 'workflow-editor');
      if (next.mode) params.set('mode', next.mode);
      if (next.workflowId) params.set('workflowId', String(next.workflowId));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const closeDrawer = () => updateDrawerRoute(null);

  const openStageUsersDrawer = (stage: StageConfigItem) => {
    if (!editingWorkflow || !stage.id) {
      toast.error(t('workflowMaster.saveStageBeforeUsers'));
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('drawer', 'workflow-editor');
    params.set('workflowId', String(editingWorkflow.id));
    params.set('subDrawer', 'stage-users');
    params.set('stageId', String(stage.id));
    params.delete('mode');
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeStageUsersDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subDrawer');
    params.delete('stageId');
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (drawerName !== 'workflow-editor') {
      return;
    }

    if (drawerMode === 'create' && !workflowIdParam) {
      queueMicrotask(() => {
        setEditingWorkflow(null);
        setFormDepartmentId('');
        setFormServiceId('');
        setFormFlowName('');
        setFormIsActive(false);
        setStagesError('');
        setStagesLoading(false);
        setStages([
          {
            stageOrder: 1,
            stageName: locale === 'mr' ? 'कागदपत्र पडताळणी' : 'Document Verification',
            slaDays: 2,
            canVerifyDocument: true,
            canEdit: false,
            canViewNoteSheet: false,
            canIssueCertificate: false,
            canViewCertificate: false,
            canApprove: false,
            canReject: false,
            canReturn: true,
            canPay: false,
            isFinalStage: false,
          },
          {
            stageOrder: 2,
            stageName: locale === 'mr' ? 'अंतिम मंजुरी' : 'Final Approval',
            slaDays: 3,
            canVerifyDocument: false,
            canEdit: false,
            canViewNoteSheet: false,
            canIssueCertificate: false,
            canViewCertificate: false,
            canApprove: true,
            canReject: true,
            canReturn: true,
            canPay: false,
            isFinalStage: true,
          },
        ]);
      });
      return;
    }

    const workflowId = Number(workflowIdParam);
    const workflow = workflowsList.find((item) => item.id === workflowId);
    if (!Number.isInteger(workflowId) || !workflow) {
      return;
    }

    queueMicrotask(() => {
      setEditingWorkflow(workflow);
      setFormDepartmentId(
        data.services.find((service) => Number(service.id) === workflow.serviceId)?.departmentId ||
          ''
      );
      setFormServiceId(String(workflow.serviceId));
      setFormFlowName(workflow.flowName);
      setFormIsActive(workflow.isActive);
    });

    if (!getStagesByApprovalFlowId) return;
    let current = true;
    queueMicrotask(() => {
      if (current) {
        setStagesLoading(true);
        setStagesError('');
      }
    });
    void getStagesByApprovalFlowId(workflow.id)
      .then((loadedStages) => {
        if (!current) return;
        setStages(loadedStages);
        setStagesError('');
      })
      .catch((error) => {
        if (current)
          setStagesError(
            error instanceof Error ? error.message : 'Failed to load workflow stages.'
          );
      })
      .finally(() => {
        if (current) setStagesLoading(false);
      });
    return () => {
      current = false;
    };
  }, [
    data.services,
    drawerName,
    drawerMode,
    getStagesByApprovalFlowId,
    locale,
    workflowIdParam,
    workflowsList,
  ]);

  const handleOpenAddDrawer = () => {
    updateDrawerRoute({ mode: 'create' });
  };

  const handleOpenEditDrawer = (item: WorkflowItem) => {
    updateDrawerRoute({ workflowId: item.id });
  };

  const handleStatusChange = (item: WorkflowItem) => {
    if (!setWorkflowActive) return;
    startTransition(async () => {
      const result = await setWorkflowActive(item.id, !item.isActive);
      if (!result.success || result.isActive === undefined) {
        toast.error(result.error || t('workflowMaster.statusChangeFailed'));
        return;
      }
      setWorkflowsList((previous) =>
        previous.map((workflow) =>
          workflow.id === item.id ? { ...workflow, isActive: result.isActive! } : workflow
        )
      );
      toast.success(
        result.isActive ? t('workflowMaster.activated') : t('workflowMaster.deactivated')
      );
    });
  };

  const handleAddStage = () => {
    setStages((prev) => [
      ...prev,
      {
        stageOrder: prev.length + 1,
        stageName: `Stage ${prev.length + 1}`,
        slaDays: 3,
        canVerifyDocument: false,
        canEdit: false,
        canViewNoteSheet: false,
        canIssueCertificate: false,
        canViewCertificate: false,
        canApprove: false,
        canReject: false,
        canReturn: true,
        canPay: false,
        isFinalStage: false,
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      toast.error(t('workflowMaster.atLeastOneStageRequired'));
      return;
    }
    setStages((prev) =>
      prev.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stageOrder: idx + 1 }))
    );
  };

  const requestRemoveStage = (index: number) => {
    const stage = stages[index];
    if (!stage) return;

    if (stages.length <= 1) {
      toast.error(t('workflowMaster.atLeastOneStageRequired'));
      return;
    }

    confirm({
      variant: 'delete',
      title: t('workflowMaster.removeStageConfirmationTitle'),
      description: t('workflowMaster.removeStageConfirmationDescription', {
        stage: stage.stageName || t('workflowMaster.stageNumber', { order: stage.stageOrder }),
      }),
      confirmText: t('workflowMaster.removeStage'),
      meta: { id: stage.id, name: stage.stageName },
      onConfirm: () => handleRemoveStage(index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formDepartmentId ||
      !formServiceId ||
      !formServices.some((service) => service.id === formServiceId)
    ) {
      toast.error(t('workflowMaster.chooseDepartmentAndService'));
      return;
    }
    if (!formFlowName.trim()) {
      toast.error(locale === 'mr' ? 'कार्यप्रवाहाचे नाव आवश्यक आहे.' : 'Flow name is required.');
      return;
    }
    if (stagesLoading || stagesError) {
      toast.error(stagesError || t('workflowMaster.loadStagesFailed'));
      return;
    }

    startTransition(async () => {
      try {
        if (saveWorkflow) {
          const res = await saveWorkflow({
            workflowId: editingWorkflow?.id,
            serviceId: Number(formServiceId),
            flowName: formFlowName.trim(),
            isActive: formIsActive,
            stages,
          });
          if (res.success && res.workflow) {
            setWorkflowsList((prev) => [
              res.workflow!,
              ...prev.filter((w) => w.id !== res.workflow!.id),
            ]);
            toast.success(
              locale === 'mr'
                ? 'कार्यप्रवाह यशस्वीरित्या जतन केला.'
                : 'Workflow saved successfully.'
            );
            closeDrawer();
            return;
          } else if (!res.success) {
            toast.error(
              res.error ||
                (locale === 'mr'
                  ? 'कार्यप्रवाह जतन करण्यात त्रुटी आली.'
                  : 'Failed to save workflow.')
            );
            return;
          }
        }
        closeDrawer();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error saving workflow');
      }
    });
  };

  const columns: Column<WorkflowTableRow>[] = [
    {
      key: 'id',
      label: t('workflowMaster.colSrNo'),
      width: '80px',
      align: 'center',
      render: (_, __, index) => (pageNumber - 1) * pageSize + index + 1,
    },
    {
      key: 'flowName',
      label: t('workflowMaster.colFlowName'),
      render: (_, row) => (
        <div>
          <div className="font-bold text-slate-800">{row.flowName}</div>
          <div className="text-[11px] font-medium text-slate-400">
            {t('workflowMaster.flowId', { id: row.id })}
          </div>
        </div>
      ),
    },
    {
      key: 'serviceId',
      label: t('workflowMaster.colService'),
      render: (_, row) => {
        const serviceObj = data.services.find((s) => String(s.id) === String(row.serviceId));
        const serviceName = serviceObj
          ? locale === 'mr'
            ? serviceObj.nameLocal || serviceObj.name
            : serviceObj.name
          : `Service #${row.serviceId}`;
        return (
          <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-xs">
            {serviceName}
          </span>
        );
      },
    },
    {
      key: 'isActive',
      label: t('workflowMaster.colStatus'),
      align: 'center',
      render: (_, row) => (
        <StatusBadge
          value={row.isActive}
          activeLabel={t('workflowMaster.active')}
          inactiveLabel={t('workflowMaster.inactive')}
          className="justify-center"
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <GitMerge className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {t('workflowMaster.title')}
            </h1>
            <p className="text-xs text-slate-500">{t('workflowMaster.subtitle')}</p>
          </div>
        </div>
        <AddButton type="button" onClick={handleOpenAddDrawer} label={t('workflowMaster.addBtn')} />
      </Card>

      {/* Filter Bar */}
      <Card className="border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-[#3d3d3d]">
              {t('workflowMaster.filterDept')}
            </label>
            <Select
              value={selectedDeptId}
              selectSize="sm"
              ariaLabel={t('workflowMaster.filterDept')}
              options={[
                { label: t('workflowMaster.allDepts'), value: 'All' },
                ...data.departments.map((department) => ({
                  label:
                    locale === 'mr' ? department.nameLocal || department.name : department.name,
                  value: department.id,
                })),
              ]}
              onChange={(_, value) => {
                setSelectedDeptId(value);
                setSelectedServiceId('All');
                setPageNumber(1);
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-[#3d3d3d]">
              {t('workflowMaster.filterStatus')}
            </label>
            <Select
              value={selectedStatus}
              selectSize="sm"
              ariaLabel={t('workflowMaster.filterStatus')}
              options={[
                { label: t('workflowMaster.allStatuses'), value: 'All' },
                { label: t('workflowMaster.active'), value: 'Active' },
                { label: t('workflowMaster.inactive'), value: 'Inactive' },
              ]}
              onChange={(_, value) => {
                setSelectedStatus(value as 'All' | 'Active' | 'Inactive');
                setPageNumber(1);
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-[#3d3d3d]">
              {t('workflowMaster.filterService')}
            </label>
            <Select
              value={selectedServiceId}
              selectSize="sm"
              ariaLabel={t('workflowMaster.filterService')}
              options={[
                { label: t('workflowMaster.allServices'), value: 'All' },
                ...filteredServicesForFilter.map((service) => ({
                  label: locale === 'mr' ? service.nameLocal || service.name : service.name,
                  value: service.id,
                })),
              ]}
              onChange={(_, value) => {
                setSelectedServiceId(value);
                setPageNumber(1);
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-[#3d3d3d]">
              {t('workflowMaster.searchLabel')}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={t('workflowMaster.searchPh')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
                fullWidth
                className="h-8 py-1.5 pl-8 text-xs"
              />
              <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Workflows Table */}
      <MasterTable<WorkflowTableRow>
        columns={columns}
        data={paginatedWorkflows}
        loading={isPending}
        emptyText={t('workflowMaster.empty')}
        getRowKey={(row) => String(row.id)}
        renderActions={(row) => (
          <div className="flex items-center justify-center gap-2">
            <EditButton
              type="button"
              onClick={() => handleOpenEditDrawer(row)}
              title="Edit Workflow"
              aria-label="Edit Workflow"
            />
            <button
              type="button"
              onClick={() => handleStatusChange(row)}
              disabled={isPending}
              className="rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              title={row.isActive ? t('workflowMaster.deactivate') : t('workflowMaster.activate')}
            >
              {row.isActive ? t('workflowMaster.deactivate') : t('workflowMaster.activate')}
            </button>
          </div>
        )}
        actionLabel={t('workflowMaster.colActions')}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={filteredWorkflows.length}
        totalPages={totalPages}
        onPageChange={setPageNumber}
        onPageSizeChange={setPageSize}
        paginationConfig={{
          enabled: true,
          showPageSizeSelector: true,
        }}
        pageSizeOptions={[5, 10, 20, 50]}
        maxBodyHeightClassName="min-h-[200px] max-h-auto"
        theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
        tableClassName={RTS_DASHBOARD_TABLE_CLASS}
        containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
        rowClassName={() => 'hover:bg-blue-50'}
      />

      {/* Add / Edit Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        title={editingWorkflow ? t('workflowMaster.editTitle') : t('workflowMaster.createTitle')}
        width="md"
        className="max-w-[96vw]"
        hideHeader
        bodyClassName="relative overflow-hidden"
        footer={
          <>
            <CancelButton type="button" onClick={closeDrawer} label={t('workflowMaster.cancel')} />
            <SaveButton
              type="submit"
              form="rts-workflow-form"
              disabled={isPending || stagesLoading || Boolean(stagesError)}
              isLoading={isPending}
              label={editingWorkflow ? t('workflowMaster.update') : t('workflowMaster.save')}
            />
          </>
        }
      >
        <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-slate-50/60">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143d7d] px-5 py-3 text-white shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10">
                <GitMerge className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-extrabold tracking-tight">
                  {editingWorkflow
                    ? t('workflowMaster.editTitle')
                    : t('workflowMaster.createTitle')}
                </h2>
                <p className="truncate text-[11px] font-medium text-blue-100">
                  {t('workflowMaster.drawerSubtitle')}
                </p>
              </div>
            </div>
          </header>

          <form
            id="rts-workflow-form"
            onSubmit={handleSubmit}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2"
          >
            <Card padding="sm" className="rounded-2xl border-slate-200 p-4 shadow-sm">
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-extrabold text-blue-950">
                {t('workflowMaster.workflowDetails')}
              </h3>
              <div className="grid gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('workflowMaster.departmentLabel')}
                  </label>
                  <Select
                    value={formDepartmentId}
                    selectSize="sm"
                    ariaLabel={t('workflowMaster.departmentLabel')}
                    options={[
                      { label: t('workflowMaster.chooseDepartment'), value: '' },
                      ...data.departments.map((department) => ({
                        label:
                          locale === 'mr'
                            ? department.nameLocal || department.name
                            : department.name,
                        value: department.id,
                      })),
                    ]}
                    onChange={(_, value) => {
                      setFormDepartmentId(value);
                      setFormServiceId('');
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('workflowMaster.rtsServiceLabel')}
                  </label>
                  <Select
                    value={formServiceId}
                    selectSize="sm"
                    disabled={!formDepartmentId}
                    ariaLabel={t('workflowMaster.rtsServiceLabel')}
                    options={[
                      { label: t('workflowMaster.chooseService'), value: '' },
                      ...formServices.map((service) => ({
                        label: locale === 'mr' ? service.nameLocal || service.name : service.name,
                        value: service.id,
                      })),
                    ]}
                    onChange={(_, value) => {
                      setFormServiceId(value);
                    }}
                  />
                </div>
                <TextArea
                  label={t('workflowMaster.flowNameLabel')}
                  rows={2}
                  maxLength={200}
                  placeholder={t('workflowMaster.flowNamePh')}
                  value={formFlowName}
                  onChange={(event) => setFormFlowName(event.target.value)}
                  className="min-h-20 resize-none text-sm"
                  required
                />
                <div className="flex items-center rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 [&>div]:w-full [&>div]:justify-between">
                  <ToggleSwitch
                    checked={formIsActive}
                    onChange={setFormIsActive}
                    label={t('workflowMaster.isActiveLabel')}
                    activeLabel={t('workflowMaster.active')}
                    inactiveLabel={t('workflowMaster.inactive')}
                    showPopup={false}
                  />
                </div>
              </div>
            </Card>

            <Card
              padding="sm"
              className="min-w-0 space-y-3 rounded-2xl border-slate-200 bg-slate-50/70 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <h3 className="text-sm font-extrabold text-blue-950">
                  {t('workflowMaster.pipelineTitle')}
                </h3>
                <AddButton
                  type="button"
                  onClick={handleAddStage}
                  size="xs"
                  label={t('workflowMaster.addStage')}
                />
              </div>
              {stagesError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                >
                  {stagesError}
                </p>
              )}
              {stagesLoading && (
                <p className="text-xs text-slate-500">{t('workflowMaster.loadingStages')}</p>
              )}
              {!stagesLoading &&
                stages.map((stage, index) => (
                  <div key={stage.id ?? `new-${index}`} className="relative pl-9">
                    {index < stages.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-[-0.75rem] left-[0.72rem] top-7 w-px bg-blue-200"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-slate-50"
                    >
                      {stage.stageOrder}
                    </span>
                    <StageConfigCard
                      stage={stage}
                      onRemove={() => requestRemoveStage(index)}
                      onManageUsers={() => openStageUsersDrawer(stage)}
                      onChange={(updated) =>
                        setStages((previous) =>
                          previous.map((item, itemIndex) => (itemIndex === index ? updated : item))
                        )
                      }
                    />
                  </div>
                ))}
            </Card>
          </form>
        </div>
      </Drawer>

      <WorkflowStageOfficerEditor
        open={isStageUsersDrawerOpen}
        workflowId={editingWorkflow?.id ?? null}
        stageId={isStageUsersDrawerOpen ? selectedStageId : null}
        onClose={closeStageUsersDrawer}
        onSaved={(stageId, userAllocationCount) =>
          setStages((previous) =>
            previous.map((stage) =>
              stage.id === stageId ? { ...stage, userAllocationCount } : stage
            )
          )
        }
      />
    </div>
  );
}
