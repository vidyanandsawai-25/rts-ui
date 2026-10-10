'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { ArrowDown, ArrowUp, Search, Trash2, Users, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  AddButton,
  CancelButton,
  Card,
  Drawer,
  Input,
  SaveButton,
  Select,
  ToggleSwitch,
} from '@/components/common';
import {
  getWorkflowStageAllocationsAction,
  saveWorkflowStageAllocationsAction,
  searchWorkflowUsersAction,
  type WorkflowStageAllocationEditorData,
  type WorkflowStageUserAllocationItem,
  type WorkflowUserOption,
  type WorkflowUserSearchField,
} from '@/app/[locale]/rts/configuration-settings/rts-workflows/actions';

interface Props {
  open: boolean;
  workflowId: number | null;
  stageId: number | null;
  onClose: () => void;
  onSaved?: (stageId: number, userAllocationCount: number) => void;
}

export default function WorkflowStageOfficerEditor({
  open,
  workflowId,
  stageId,
  onClose,
  onSaved,
}: Props) {
  const t = useTranslations('rts.workflowMaster');
  const [isSaving, startSaving] = useTransition();
  const [editorData, setEditorData] = useState<WorkflowStageAllocationEditorData | null>(null);
  const [allocations, setAllocations] = useState<WorkflowStageUserAllocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState<WorkflowUserSearchField>('UserName');
  const [results, setResults] = useState<WorkflowUserOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const addRootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const ordered = [...allocations].sort((left, right) => left.priority - right.priority);

  useEffect(() => {
    if (!open || !workflowId || !stageId) return;
    let current = true;
    queueMicrotask(() => {
      if (!current) return;
      setLoading(true);
      setLoadError('');
      setEditorData(null);
      setAllocations([]);
      setAddOpen(false);
    });
    void getWorkflowStageAllocationsAction(workflowId, stageId)
      .then((data) => {
        if (!current) return;
        setEditorData(data);
        setAllocations(data.allocations);
      })
      .catch((error) => {
        if (!current) return;
        setLoadError(error instanceof Error ? error.message : 'Could not load assigned users.');
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [open, stageId, workflowId]);

  useEffect(() => {
    if (!addOpen) return;
    searchRef.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!addRootRef.current?.contains(event.target as Node)) setAddOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAddOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [addOpen]);

  useEffect(() => {
    const term = query.trim();
    if (!addOpen || !editorData?.serviceId || (term.length < 2 && !/^\d+$/.test(term))) {
      return;
    }
    let current = true;
    const timeout = window.setTimeout(() => {
      setSearchLoading(true);
      void searchWorkflowUsersAction(term, searchField)
        .then((users) => {
          if (!current) return;
          setResults(users);
          setSearchError('');
        })
        .catch(() => {
          if (!current) return;
          setResults([]);
          setSearchError(t('officerSearchFailed'));
        })
        .finally(() => {
          if (current) setSearchLoading(false);
        });
    }, 250);
    return () => {
      current = false;
      window.clearTimeout(timeout);
    };
  }, [addOpen, editorData?.serviceId, query, searchField, t]);

  function openUserSearch() {
    setAddOpen(true);
    setQuery('');
    setResults([]);
    setSearchLoading(false);
    setSearchError('');
  }

  function addOfficer(user: WorkflowUserOption) {
    if (allocations.some((allocation) => allocation.userId === user.id)) {
      setSearchError(t('duplicateOfficer'));
      return;
    }
    setAllocations([
      ...ordered,
      {
        userId: user.id,
        priority: ordered.length + 1,
        isActive: true,
        fullName: user.name,
        userName: user.userName,
      },
    ]);
    setAddOpen(false);
    setQuery('');
    setResults([]);
    setSearchLoading(false);
    setSearchError('');
  }

  function moveOfficer(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= ordered.length) return;
    const reordered = [...ordered];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setAllocations(
      reordered.map((allocation, position) => ({ ...allocation, priority: position + 1 }))
    );
  }

  function removeOfficer(userId: number) {
    setAllocations(
      ordered
        .filter((allocation) => allocation.userId !== userId)
        .map((allocation, position) => ({ ...allocation, priority: position + 1 }))
    );
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!editorData) return;
    startSaving(async () => {
      const result = await saveWorkflowStageAllocationsAction({
        workflowId: editorData.workflowId,
        stageId: editorData.stageId,
        allocations,
      });
      if (!result.success) {
        toast.error(result.error || t('saveStageUsersFailed'));
        return;
      }
      toast.success(t('stageUsersSaved'));
      onSaved?.(editorData.stageId, allocations.length);
      onClose();
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      className="max-w-[94vw]"
      hideHeader
      zIndex={140}
      bodyClassName="relative overflow-hidden"
      footer={
        <>
          <CancelButton type="button" onClick={onClose} label={t('cancel')} />
          <SaveButton
            type="submit"
            form="rts-stage-users-form"
            disabled={loading || Boolean(loadError) || !editorData || isSaving}
            isLoading={isSaving}
            label={t('saveStageUsers')}
          />
        </>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-slate-50/70">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143d7d] px-5 py-3 text-white shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold tracking-tight">
                {editorData
                  ? t('stageUsersTitle', { order: editorData.stageOrder })
                  : t('stageUsersDrawerTitle')}
              </h2>
              <p className="truncate text-[11px] font-medium text-blue-100">
                {editorData?.stageName || t('stageUsersDrawerSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <form
          id="rts-stage-users-form"
          onSubmit={handleSave}
          className="min-h-0 flex-1 overflow-y-auto p-2"
        >
          <Card padding="sm" className="rounded-2xl border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-blue-950">
                  {editorData
                    ? t('stageUsersTitle', { order: editorData.stageOrder })
                    : t('stageUsersDrawerTitle')}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  {t('assignedCount', { count: allocations.length })}
                </p>
              </div>

              <div ref={addRootRef} className="relative">
                <AddButton
                  type="button"
                  size="xs"
                  disabled={!editorData || loading}
                  onClick={openUserSearch}
                  label={t('searchOfficers')}
                />

                {addOpen && (
                  <div
                    role="dialog"
                    aria-label={t('searchOfficers')}
                    className="absolute right-0 top-full z-30 mt-2 w-[min(28rem,calc(100vw-3rem))] rounded-xl border border-blue-200 bg-white p-3 shadow-xl"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-blue-950">{t('searchOfficers')}</h4>
                      <button
                        type="button"
                        onClick={() => setAddOpen(false)}
                        aria-label={t('close')}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <Select
                      value={searchField}
                      selectSize="sm"
                      ariaLabel={t('searchBy')}
                      options={[
                        { label: t('searchByUserId'), value: 'UserId' },
                        { label: t('searchByUserName'), value: 'UserName' },
                        { label: t('searchByFirstName'), value: 'FirstName' },
                        { label: t('searchByMiddleName'), value: 'MiddleName' },
                        { label: t('searchByLastName'), value: 'LastName' },
                        { label: t('searchByMobileNo'), value: 'MobileNo' },
                      ]}
                      onChange={(_, value) => {
                        setSearchField(value as WorkflowUserSearchField);
                        setQuery('');
                        setResults([]);
                        setSearchLoading(false);
                        setSearchError('');
                      }}
                    />
                    <div className="relative mt-2">
                      <Input
                        ref={searchRef}
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setResults([]);
                          setSearchLoading(
                            event.target.value.trim().length >= 2 ||
                              /^\d+$/.test(event.target.value.trim())
                          );
                          setSearchError('');
                        }}
                        placeholder={
                          searchField === 'UserId'
                            ? t('searchUserIdPlaceholder')
                            : searchField === 'MobileNo'
                              ? t('searchMobilePlaceholder')
                              : t('searchOfficersPlaceholder')
                        }
                        aria-label={t('searchOfficersPlaceholder')}
                        className="pl-8 text-xs"
                        fullWidth
                      />
                      <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                    </div>
                    {searchError && (
                      <p role="alert" className="mt-2 text-xs text-red-700">
                        {searchError}
                      </p>
                    )}
                    <div className="mt-2 max-h-56 overflow-y-auto">
                      {searchLoading ? (
                        <p className="p-2 text-xs text-slate-500">{t('searchingOfficers')}</p>
                      ) : results.length ? (
                        <ul className="space-y-1">
                          {results.map((user) => {
                            const added = allocations.some(
                              (allocation) => allocation.userId === user.id
                            );
                            return (
                              <li
                                key={user.id}
                                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-2"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-slate-800">
                                    {user.name}
                                  </p>
                                  <p className="truncate text-[11px] text-slate-500">
                                    {user.userName} · {t('userId', { id: user.id })}
                                  </p>
                                </div>
                                <AddButton
                                  type="button"
                                  size="xs"
                                  disabled={added}
                                  onClick={() => addOfficer(user)}
                                  label={added ? t('alreadyAdded') : t('addUser')}
                                />
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="p-2 text-xs text-slate-500">
                          {query.trim().length >= 2 || /^\d+$/.test(query.trim())
                            ? t('noOfficersFound')
                            : t('searchOfficersHint')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loadError && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              >
                {loadError}
              </p>
            )}
            {loading ? (
              <p className="mt-3 text-xs text-slate-500">{t('loadingStageUsers')}</p>
            ) : ordered.length === 0 && !loadError ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-12 text-center text-xs text-slate-500">
                {t('noUsersAssigned')}
              </p>
            ) : (
              <ol className="mt-3 space-y-2">
                {ordered.map((allocation, index) => (
                  <li
                    key={allocation.id ?? `new-${allocation.userId}`}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-5 text-center text-xs font-bold text-blue-800">
                        {index + 1}
                      </span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveOfficer(index, -1)}
                          aria-label={t('moveOfficerUp', { id: allocation.userId })}
                          className="rounded text-slate-500 hover:text-blue-700 disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === ordered.length - 1}
                          onClick={() => moveOfficer(index, 1)}
                          aria-label={t('moveOfficerDown', { id: allocation.userId })}
                          className="rounded text-slate-500 hover:text-blue-700 disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {allocation.fullName || t('userId', { id: allocation.userId })}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {allocation.userName ? `${allocation.userName} · ` : ''}
                        {t('userId', { id: allocation.userId })}
                      </p>
                    </div>
                    <div className="[&_span]:!text-[11px]">
                      <ToggleSwitch
                        checked={allocation.isActive}
                        onChange={(checked) =>
                          setAllocations((previous) =>
                            previous.map((item) =>
                              item.userId === allocation.userId
                                ? { ...item, isActive: checked }
                                : item
                            )
                          )
                        }
                        showPopup={false}
                        activeLabel={t('active')}
                        inactiveLabel={t('inactive')}
                        label={allocation.isActive ? t('active') : t('inactive')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOfficer(allocation.userId)}
                      aria-label={t('removeOfficer', { id: allocation.userId })}
                      className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </form>
      </div>
    </Drawer>
  );
}
