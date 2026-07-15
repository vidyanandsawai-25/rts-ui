"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/common/Drawer";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Settings, Info, CheckCircle } from "lucide-react";
import { Input } from "@/components/common/Input";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { Checkbox } from "@/components/common/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { SaveButton, CancelButton, AddButton, UpdateButton } from "@/components/common/ActionButtons";
import { SearchSelect } from "@/components/common/SearchSelect";
import { SearchInput } from "@/components/common/SearchInput";
import { CardPagination } from "@/components/common/CardList";
import { GroupIconSelector, getIconKey } from "../../typeofusemaster/GroupIconSelector";
import { createUseGroupAndAssignToTypeAction, getTypeOfUseDetailsAction, getUseGroupsPagedAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { CODE_REGEX, TEXT_ALLOWED, isAllZeros } from "@/lib/utils/validation-rules";
import { normalize, sanitizeCode, sanitizeText } from "@/lib/utils/sanitization";
import type { ITypeOfUseDetails } from "@/types/RVRateMaster";
import type { UseGroup, UseGroupIconKey } from "@/types/typeOfUse.types";

import type { RateCategory } from "@/types/RVRateMaster";

interface ConfigureRatesDrawerProps {
  open: boolean;
  onClose: (savedAny: boolean) => void;
  isMatrixVisible?: boolean;
  currentCategories?: RateCategory[];
  onConfigureSelected?: (selectedTypes: ITypeOfUseDetails[]) => void;
}

interface GroupFormState {
  code: string;
  name: string;
  icon: string;
  errors: {
    code?: string;
    name?: string;
  };
  isSaved: boolean;
  isSaving: boolean;
  selectedExistingGroupId?: string;
  isMappingExisting: boolean;
}

export function ConfigureRatesDrawer({
  open,
  onClose,
  isMatrixVisible = false,
  currentCategories = [],
  onConfigureSelected,
}: ConfigureRatesDrawerProps) {
  const [allUseTypes, setAllUseTypes] = useState<ITypeOfUseDetails[]>([]);
  const [paginatedUseTypes, setPaginatedUseTypes] = useState<ITypeOfUseDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isListLoading, setIsListLoading] = useState(false);
  const [existingGroups, setExistingGroups] = useState<UseGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState<Record<number, boolean>>({});
  const [groupForms, setGroupForms] = useState<Record<number, GroupFormState>>({});
  const [savedAny, setSavedAny] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Load typeofuses and existing groups
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [typesResult, groupsResult] = await Promise.all([
          getTypeOfUseDetailsAction(1, -1),
          getUseGroupsPagedAction({ pageNumber: 1, pageSize: 9999 })
        ]);

        const types = typesResult.items || [];

        // Sort types so that the 'OP' type of use is always at the top/first position
        const sortedTypes = [...types].sort((a, b) => {
          if (a.typeOfUseCode === 'OP') return -1;
          if (b.typeOfUseCode === 'OP') return 1;
          return 0;
        });
        setAllUseTypes(sortedTypes);
        setExistingGroups(groupsResult.items || []);
      } catch (err) {
        toast.error("Failed to load initial configuration data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (open) {
      loadData();
    }
  }, [open]);

  // Reset initialization state when drawer closes
  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
    }
  }, [open]);

  // Load checkedIds from URL or currentCategories on drawer open, or reset state
  useEffect(() => {
    if (open && !hasInitialized && allUseTypes.length > 0 && existingGroups.length > 0) {
      // 1. First, default to fresh/empty state
      setCheckedIds({});
      setGroupForms({});
      setSavedAny(false);
      setSearchTerm("");
      setPageNumber(1);

      const initialChecked: Record<number, boolean> = {};
      const initialForms: Record<number, GroupFormState> = {};

      // Find OP and force it to be checked
      const opType = allUseTypes.find(t => t.typeOfUseCode === 'OP');
      if (opType) {
        initialChecked[opType.id] = true;
        const targetGroup = existingGroups.find(g => g.typeOfUseGroupId === opType.typeOfUseGroupId);
        const hasGroup = !!targetGroup && !!targetGroup.isOpenPlot;

        initialForms[opType.id] = {
          code: hasGroup ? (opType.typeOfUseGroupCode || "") : "",
          name: hasGroup ? (opType.groupName || "") : "",
          icon: "home-icon",
          errors: {},
          isSaved: hasGroup,
          isSaving: false,
          selectedExistingGroupId: hasGroup ? String(opType.typeOfUseGroupId) : "",
          isMappingExisting: true
        };
      }

      // 2. If the matrix is visible, pre-populate from currentCategories
      if (isMatrixVisible && currentCategories && currentCategories.length > 0) {
        currentCategories.forEach(cat => {
          const typeOfUseId = Number(cat.constructionId);
          if (typeOfUseId && cat.constructionCode !== 'OP') {
            initialChecked[typeOfUseId] = true;
            const tu = allUseTypes.find(t => t.id === typeOfUseId);
            if (!tu) return;
            const targetGroup = existingGroups.find(g => g.typeOfUseGroupId === tu.typeOfUseGroupId);
            const hasGroup = !!targetGroup && !!targetGroup.isOpenPlot;

            initialForms[typeOfUseId] = {
              code: hasGroup ? (tu.typeOfUseGroupCode || "") : "",
              name: hasGroup ? (tu.groupName || "") : "",
              icon: "home-icon",
              errors: {},
              isSaved: hasGroup,
              isSaving: false,
              selectedExistingGroupId: hasGroup ? String(tu.typeOfUseGroupId) : "",
              isMappingExisting: true
            };
          }
        });

        setCheckedIds(initialChecked);
        setGroupForms(initialForms);
      } else {
        // 3. Otherwise, check if there's any checkedUseTypes in the URL (for initial load sync)
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          const checkedParam = searchParams.get("checkedUseTypes");
          if (checkedParam) {
            const ids = checkedParam.split(",").map(Number).filter(Boolean);
            ids.forEach(id => {
              initialChecked[id] = true;
              const tu = allUseTypes.find(t => t.id === id);
              if (!tu) return;
              const targetGroup = existingGroups.find(g => g.typeOfUseGroupId === tu.typeOfUseGroupId);
              const hasGroup = !!targetGroup && !!targetGroup.isOpenPlot;

              initialForms[id] = {
                code: hasGroup ? (tu.typeOfUseGroupCode || "") : "",
                name: hasGroup ? (tu.groupName || "") : "",
                icon: "home-icon",
                errors: {},
                isSaved: hasGroup,
                isSaving: false,
                selectedExistingGroupId: hasGroup ? String(tu.typeOfUseGroupId) : "",
                isMappingExisting: true
              };
            });
          }
          setCheckedIds(initialChecked);
          setGroupForms(initialForms);
        }
      }
      setHasInitialized(true);
    }
  }, [open, isMatrixVisible, currentCategories, hasInitialized, allUseTypes, existingGroups]);

  // Sync checkedIds state to URL query parameters
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const activeIds = Object.keys(checkedIds)
        .filter(id => checkedIds[Number(id)])
        .join(",");

      const searchParams = new URLSearchParams(window.location.search);
      if (activeIds) {
        searchParams.set("checkedUseTypes", activeIds);
      } else {
        searchParams.delete("checkedUseTypes");
      }
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [checkedIds, open]);

  const handleCheckboxChange = (id: number) => {
    const tu = allUseTypes.find(t => t.id === id);
    if (!tu || tu.typeOfUseCode === 'OP') return; // Read-only checkbox!

    setCheckedIds(prev => {
      const isChecked = !prev[id];
      if (isChecked && !groupForms[id]) {
        const targetGroup = existingGroups.find(g => g.typeOfUseGroupId === tu.typeOfUseGroupId);
        const hasGroup = !!targetGroup && !!targetGroup.isOpenPlot;

        setGroupForms(prevForms => ({
          ...prevForms,
          [id]: {
            code: hasGroup ? (tu.typeOfUseGroupCode || "") : "",
            name: hasGroup ? (tu.groupName || "") : "",
            icon: "home-icon",
            errors: {},
            isSaved: hasGroup,
            isSaving: false,
            selectedExistingGroupId: hasGroup ? String(tu.typeOfUseGroupId) : "",
            isMappingExisting: true
          }
        }));
      }
      return { ...prev, [id]: isChecked };
    });
  };

  const handleSelectExistingGroup = (id: number, groupIdStr: string) => {
    setGroupForms(prev => {
      const form = prev[id];
      if (!form) return prev;

      if (!groupIdStr) {
        // Reset to create new group mode
        return {
          ...prev,
          [id]: {
            ...form,
            selectedExistingGroupId: "",
            code: "",
            name: "",
            icon: "home-icon",
            errors: {},
            isSaved: false
          }
        };
      }

      // Populate from existing group
      const selectedGroup = existingGroups.find(g => String(g.typeOfUseGroupId) === groupIdStr);
      if (!selectedGroup) return prev;

      return {
        ...prev,
        [id]: {
          ...form,
          selectedExistingGroupId: groupIdStr,
          code: selectedGroup.typeOfUseGroupCode || "",
          name: selectedGroup.groupName || "",
          icon: selectedGroup.groupIcon || "home-icon",
          errors: {}, // clear errors
          isSaved: false
        }
      };
    });
  };

  const handleToggleMode = (id: number) => {
    setGroupForms(prev => {
      const form = prev[id];
      if (!form) return prev;
      return {
        ...prev,
        [id]: {
          ...form,
          isMappingExisting: !form.isMappingExisting,
          selectedExistingGroupId: "",
          code: "",
          name: "",
          icon: "home-icon",
          errors: {},
          isSaved: false
        }
      };
    });
  };

  const handleFieldChange = (id: number, field: 'code' | 'name' | 'icon', val: string) => {
    setGroupForms(prev => {
      const form = prev[id];
      if (!form) return prev;

      let cleanedVal = val;
      if (field === 'code') {
        cleanedVal = sanitizeCode(val, 10);
      } else if (field === 'name') {
        cleanedVal = sanitizeText(val, 50);
      }

      const updatedForm = {
        ...form,
        [field === 'code' ? 'code' : field === 'name' ? 'name' : 'icon']: cleanedVal,
        isSaved: false
      };

      // Perform real-time validation
      const errors: { code?: string; name?: string } = {};
      if (field === 'code' || form.code) {
        const codeVal = field === 'code' ? cleanedVal : form.code;
        const codeTrimmed = codeVal.trim();
        if (!codeTrimmed) {
          errors.code = "Group ID Code is required";
        } else if (isAllZeros(codeTrimmed)) {
          errors.code = "Group ID Code cannot be all zeros";
        } else if (codeTrimmed.length > 10) {
          errors.code = "Group ID Code cannot exceed 10 characters";
        } else if (!CODE_REGEX.test(codeTrimmed)) {
          errors.code = "Group ID Code must be alphanumeric only";
        } else {
          // Duplicate check
          const normalized = normalize(codeTrimmed);
          const isDup = existingGroups.some(g => normalize(g.typeOfUseGroupCode || '') === normalized);
          if (isDup) {
            errors.code = "Group ID Code already exists";
          }
        }
      }

      if (field === 'name' || form.name) {
        const nameVal = field === 'name' ? cleanedVal : form.name;
        const nameTrimmed = nameVal.trim();
        if (!nameTrimmed) {
          errors.name = "Group Name is required";
        } else if (isAllZeros(nameTrimmed)) {
          errors.name = "Group Name cannot be all zeros";
        } else if (nameTrimmed.length > 50) {
          errors.name = "Group Name cannot exceed 50 characters";
        } else if (!TEXT_ALLOWED.test(nameTrimmed)) {
          errors.name = "Group Name contains invalid characters";
        } else {
          // Duplicate check
          const normalized = normalize(nameTrimmed);
          const isDup = existingGroups.some(g => normalize(g.groupName || '') === normalized);
          if (isDup) {
            errors.name = "Group Name already exists";
          }
        }
      }

      updatedForm.errors = errors;
      return { ...prev, [id]: updatedForm };
    });
  };

  const handleSaveGroup = async (id: number, typeofuse: ITypeOfUseDetails) => {
    const form = groupForms[id];
    if (!form || form.isSaved || form.isSaving) return;

    if (form.isMappingExisting) {
      if (!form.selectedExistingGroupId) return;
      // 1. Direct Assignment of Existing Group
      try {
        setGroupForms(prev => ({
          ...prev,
          [id]: { ...prev[id]!, isSaving: true }
        }));

        const res = await createUseGroupAndAssignToTypeAction({
          code: "",
          name: "",
          icon: "home",
          typeOfUseId: typeofuse.id,
          typeOfUseGroupId: Number(form.selectedExistingGroupId)
        });

        if (res.success && res.typeOfUseGroupId) {
          toast.success(`Group associated successfully for ${typeofuse.description || typeofuse.typeOfUseCode}`);
          setGroupForms(prev => ({
            ...prev,
            [id]: { ...prev[id]!, isSaved: true, isSaving: false }
          }));

          const groupCode = form.code;
          const groupName = form.name;

          // Update the allUseTypes and paginatedUseTypes state to reflect the new group assignment immediately
          setAllUseTypes((prevTypes: ITypeOfUseDetails[]) => prevTypes.map(t => {
            if (t.id === typeofuse.id) {
              return {
                ...t,
                typeOfUseGroupId: res.typeOfUseGroupId,
                typeOfUseGroupCode: groupCode,
                groupName: groupName
              };
            }
            return t;
          }));

          setPaginatedUseTypes((prevTypes: ITypeOfUseDetails[]) => prevTypes.map(t => {
            if (t.id === typeofuse.id) {
              return {
                ...t,
                typeOfUseGroupId: res.typeOfUseGroupId,
                typeOfUseGroupCode: groupCode,
                groupName: groupName
              };
            }
            return t;
          }));

          setSavedAny(true);
        } else {
          toast.error(res.message || "Failed to associate group");
          setGroupForms(prev => ({
            ...prev,
            [id]: { ...prev[id]!, isSaving: false }
          }));
        }
      } catch (err) {
        toast.error("An error occurred during save operation");
        console.error(err);
        setGroupForms(prev => ({
          ...prev,
          [id]: { ...prev[id]!, isSaving: false }
        }));
      }
      return;
    }

    // Validate fields again on save (for new group creation)
    const codeTrimmed = form.code.trim();
    const nameTrimmed = form.name.trim();

    const errors: { code?: string; name?: string } = {};
    if (!codeTrimmed) {
      errors.code = "Group ID Code is required";
    } else if (isAllZeros(codeTrimmed)) {
      errors.code = "Group ID Code cannot be all zeros";
    } else if (codeTrimmed.length > 10) {
      errors.code = "Group ID Code cannot exceed 10 characters";
    } else if (!CODE_REGEX.test(codeTrimmed)) {
      errors.code = "Group ID Code must be alphanumeric only";
    } else {
      const normalized = normalize(codeTrimmed);
      if (existingGroups.some(g => normalize(g.typeOfUseGroupCode || '') === normalized)) {
        errors.code = "Group ID Code already exists";
      }
    }

    if (!nameTrimmed) {
      errors.name = "Group Name is required";
    } else if (isAllZeros(nameTrimmed)) {
      errors.name = "Group Name cannot be all zeros";
    } else if (nameTrimmed.length > 50) {
      errors.name = "Group Name cannot exceed 50 characters";
    } else if (!TEXT_ALLOWED.test(nameTrimmed)) {
      errors.name = "Group Name contains invalid characters";
    } else {
      const normalized = normalize(nameTrimmed);
      if (existingGroups.some(g => normalize(g.groupName || '') === normalized)) {
        errors.name = "Group Name already exists";
      }
    }

    if (Object.keys(errors).length > 0) {
      setGroupForms(prev => ({
        ...prev,
        [id]: { ...prev[id]!, errors }
      }));
      return;
    }

    // Call server action
    try {
      setGroupForms(prev => ({
        ...prev,
        [id]: { ...prev[id]!, isSaving: true }
      }));

      const res = await createUseGroupAndAssignToTypeAction({
        code: codeTrimmed,
        name: nameTrimmed,
        icon: getIconKey(form.icon) as UseGroupIconKey,
        typeOfUseId: typeofuse.id,
        isOpenPlot: true
      });

      if (res.success && res.typeOfUseGroupId) {
        toast.success(`Group configured and associated successfully for ${typeofuse.description || typeofuse.typeOfUseCode}`);
        setGroupForms(prev => ({
          ...prev,
          [id]: { ...prev[id]!, isSaved: true, isSaving: false }
        }));

        // Add to existing groups for subsequent uniqueness checking in this drawer session
        const newlyCreatedGroup: UseGroup = {
          typeOfUseGroupId: res.typeOfUseGroupId,
          typeOfUseGroupCode: codeTrimmed,
          groupName: nameTrimmed,
          groupIcon: getIconKey(form.icon),
          isOpenPlot: true,
          isActive: true
        };
        setExistingGroups(prev => [...prev, newlyCreatedGroup]);

        // Update the allUseTypes and paginatedUseTypes state to reflect the new group assignment immediately
        setAllUseTypes((prevTypes: ITypeOfUseDetails[]) => prevTypes.map(t => {
          if (t.id === typeofuse.id) {
            return {
              ...t,
              typeOfUseGroupId: res.typeOfUseGroupId,
              typeOfUseGroupCode: codeTrimmed,
              groupName: nameTrimmed
            };
          }
          return t;
        }));

        setPaginatedUseTypes((prevTypes: ITypeOfUseDetails[]) => prevTypes.map(t => {
          if (t.id === typeofuse.id) {
            return {
              ...t,
              typeOfUseGroupId: res.typeOfUseGroupId,
              typeOfUseGroupCode: codeTrimmed,
              groupName: nameTrimmed
            };
          }
          return t;
        }));

        setSavedAny(true);
      } else {
        toast.error(res.message || "Failed to configure group");
        setGroupForms(prev => ({
          ...prev,
          [id]: { ...prev[id]!, isSaving: false }
        }));
      }
    } catch (err) {
      toast.error("An error occurred during save operation");
      console.error(err);
      setGroupForms(prev => ({
        ...prev,
        [id]: { ...prev[id]!, isSaving: false }
      }));
    }
  };

  const isFormValid = (form?: GroupFormState) => {
    if (!form) return false;
    if (form.isMappingExisting) {
      return !!form.selectedExistingGroupId;
    }
    return (
      form.code.trim().length > 0 &&
      form.name.trim().length > 0 &&
      form.icon.trim().length > 0 &&
      Object.keys(form.errors).length === 0
    );
  };

  const handleConfigureClick = () => {
    const selected = allUseTypes.filter(tu => checkedIds[tu.id]);

    // Validate that all checked types of use are associated with an Open Plot group (IsOpenPlot = 1)
    const hasInvalidSelection = selected.some(tu => {
      if (!tu.typeOfUseGroupId) return true;
      const group = existingGroups.find(g => g.typeOfUseGroupId === tu.typeOfUseGroupId);
      return !group || !group.isOpenPlot;
    });

    if (hasInvalidSelection) {
      toast.error("Please select Type of Use having Use Groups for Open Plot.");
      return;
    }

    // Validate that there are no duplicate use groups selected
    const selectedGroupIds = selected
      .map(tu => tu.typeOfUseGroupId)
      .filter((id): id is number => !!id && id > 0);

    const hasDuplicateGroupIds = selectedGroupIds.length !== new Set(selectedGroupIds).size;

    if (hasDuplicateGroupIds) {
      toast.error("Please select Type of Use having distinct Use group");
      return;
    }

    // Filter to distinct typeOfUseGroupId
    const distinctSelected: ITypeOfUseDetails[] = [];
    const seenGroupIds = new Set<number>();

    selected.forEach(tu => {
      const groupId = tu.typeOfUseGroupId;
      if (groupId && groupId > 0) {
        if (!seenGroupIds.has(groupId)) {
          seenGroupIds.add(groupId);
          distinctSelected.push(tu);
        }
      } else {
        // Fall back to showing it anyway (using its id to differentiate)
        distinctSelected.push(tu);
      }
    });

    if (distinctSelected.length === 0) {
      toast.error("Please select at least one Type of Use to configure.");
      return;
    }

    onConfigureSelected?.(distinctSelected);
  };

  // Load paginated list of typeofuses when pagination or search term changes
  useEffect(() => {
    async function loadPaginatedData() {
      if (!open || allUseTypes.length === 0) return;
      try {
        setIsListLoading(true);
        const result = await getTypeOfUseDetailsAction(pageNumber, pageSize, debouncedSearch);
        
        let items = result.items || [];
        
        // Sort types so that the 'OP' type of use is always at the top/first position of page 1
        const sortedItems = [...items].sort((a, b) => {
          if (a.typeOfUseCode === 'OP') return -1;
          if (b.typeOfUseCode === 'OP') return 1;
          return 0;
        });

        setPaginatedUseTypes(sortedItems);
        setTotalCount(result.totalCount || 0);
        setTotalPages(result.totalPages || 0);
      } catch (err) {
        toast.error("Failed to load types of use");
        console.error(err);
      } finally {
        setIsListLoading(false);
      }
    }
    loadPaginatedData();
  }, [open, pageNumber, pageSize, debouncedSearch, allUseTypes]);

  // Clamp pageNumber to valid range in case search makes it smaller
  const safePageNumber = Math.min(pageNumber, Math.max(1, totalPages));

  return (
    <div className="open-plot-config-drawer-wrapper">
      {open && (
        <style dangerouslySetInnerHTML={{
          __html: `
          .open-plot-config-drawer-wrapper div.fixed.inset-0 {
            z-index: 200 !important;
          }
          .open-plot-config-drawer-wrapper div.drawer-instance {
            z-index: 210 !important;
          }
        `}} />
      )}
      <Drawer
        open={open}
        onClose={() => onClose(savedAny)}
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
              <Settings size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-900">
                Configure Open Plot Rates
              </div>
              <div className="text-xs text-slate-500">
                Configure and map use groups for different types of use
              </div>
            </div>
          </div>
        }
        width="xl"
        footer={
          <div className="flex gap-3">
            <SaveButton
              label="Configure"
              size="md"
              onClick={handleConfigureClick}
              className="cursor-pointer"
            />
            <CancelButton
              label="Close"
              size="md"
              onClick={() => onClose(savedAny)}
              className="cursor-pointer"
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-3" />
            <p className="text-sm">Loading types of use details...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] divide-x divide-slate-200">
            {/* LEFT SIDE: List of TypeOfUse */}
            <div className="md:w-1/3 p-4 flex flex-col h-full bg-white border-r border-slate-200">
              <div className="flex items-center justify-between border-b pb-2 mb-3 flex-shrink-0">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                  <Info size={16} className="text-blue-500" />
                  Select Types of Use
                </h2>
                <SearchInput
                  className="mb-0 w-44"
                  value={searchTerm}
                  onChange={(val) => {
                    setSearchTerm(val);
                    setPageNumber(1);
                  }}
                  placeholder="Search..."
                />
              </div>

              <div className={cn("flex-1 overflow-y-auto pr-1 space-y-2 mb-3 transition-opacity duration-200", isListLoading && "opacity-50")}>
                {paginatedUseTypes.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No types of use found
                  </div>
                ) : (
                  paginatedUseTypes.map((tu) => {
                    const isChecked = !!checkedIds[tu.id];
                    return (
                      <Card
                        key={tu.id}
                        onClick={() => handleCheckboxChange(tu.id)}
                        padding="sm"
                        className={`flex items-start justify-between gap-3 transition-all select-none ${tu.typeOfUseCode === 'OP' ? "cursor-default" : "cursor-pointer hover:bg-slate-50/70"
                          } ${isChecked
                            ? "bg-blue-50/70 border-blue-300 shadow-sm"
                            : "bg-white border-slate-200"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => { }}
                            disabled={tu.typeOfUseCode === 'OP'}
                            className={`mt-0.5 ${isChecked ? "bg-blue-600 border-blue-600 text-white" : ""}`}
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900 font-sans">
                              {tu.typeOfUseCode}
                            </div>
                            <div className="text-xs text-slate-500 font-sans">
                              {tu.description}
                            </div>
                          </div>
                        </div>
                        {tu.typeOfUseGroupCode && (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm font-sans" title={tu.groupName}>
                              Group: {tu.typeOfUseGroupCode}
                            </span>
                            {tu.groupName && (
                              <span className="text-[9px] text-slate-400 max-w-[100px] truncate font-sans" title={tu.groupName}>
                                {tu.groupName}
                              </span>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="flex-shrink-0 pt-2 border-t border-slate-100">
                <CardPagination
                  pageNumber={safePageNumber}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  onPageChange={setPageNumber}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                  className="rounded-none shadow-none border-none px-0"
                />
              </div>
            </div>

            {/* RIGHT SIDE: Configurations for checked items */}
            <div className="md:w-2/3 p-5 space-y-4 overflow-y-auto h-full bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 border-b pb-2">
                Configure Use Groups
              </h2>

              {Object.keys(checkedIds).filter(id => checkedIds[Number(id)]).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Settings size={48} className="stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-sm">Please select a type of use on the left to configure its group.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {allUseTypes
                    .filter((tu) => checkedIds[tu.id])
                    .map((tu) => {
                      const form = groupForms[tu.id];
                      if (!form) return null;

                      return (
                        <Card
                          key={tu.id}
                          variant="default"
                          padding="md"
                          className="bg-white border-[#DCEAFF]"
                        >
                          {/* Title bar */}
                          <CardHeader className="flex flex-row items-center justify-between border-b pb-3 mb-4">
                            <div className="flex items-center">
                              <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 font-sans">
                                {tu.typeOfUseCode}
                              </span>
                              <CardTitle className="text-sm font-bold text-slate-800 font-sans">
                                {tu.description}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-3">
                              {form.isSaved && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 font-sans">
                                  <CheckCircle size={16} /> Saved
                                </span>
                              )}
                              {!form.isSaving && tu.typeOfUseCode !== 'OP' && (
                                form.isMappingExisting ? (
                                  <AddButton
                                    size="sm"
                                    label="Create New Group"
                                    onClick={() => handleToggleMode(tu.id)}
                                  />
                                ) : (
                                  <UpdateButton
                                    size="sm"
                                    label="Update Use Group"
                                    onClick={() => handleToggleMode(tu.id)}
                                  />
                                )
                              )}
                            </div>
                          </CardHeader>

                          {tu.typeOfUseCode === 'OP' ? (
                            <CardContent className="flex flex-col gap-3 py-3 w-full">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-500 mb-1 font-sans">
                                  Associated Use Group (Open Plot only)
                                </span>
                                <span className="text-sm font-bold text-slate-800 font-sans bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
                                  {tu.typeOfUseGroupCode || "N/A"} - {tu.groupName || "N/A"}
                                </span>
                              </div>
                            </CardContent>
                          ) : form.isMappingExisting ? (
                            <CardContent className="flex flex-col sm:flex-row items-end gap-4 w-full">
                              <div className="flex flex-col flex-1 w-full">
                                <SearchSelect
                                  label="Select Existing Group (Open Plot only)"
                                  options={existingGroups
                                    .filter(g => g.isOpenPlot)
                                    .map(g => ({
                                      label: `${g.typeOfUseGroupCode} - ${g.groupName}`,
                                      value: String(g.typeOfUseGroupId)
                                    }))}
                                  value={form.selectedExistingGroupId || ""}
                                  onChange={(_, val) => handleSelectExistingGroup(tu.id, val)}
                                  placeholder="-- Select Group --"
                                  disabled={form.isSaving}
                                />
                              </div>

                              <div className="self-stretch sm:self-auto flex items-end">
                                <SaveButton
                                  label="Save"
                                  size="md"
                                  onClick={() => handleSaveGroup(tu.id, tu)}
                                  disabled={!form.selectedExistingGroupId || form.isSaved || form.isSaving}
                                  isLoading={form.isSaving}
                                  className="w-full sm:w-28 h-10"
                                />
                              </div>
                            </CardContent>
                          ) : (
                            <CardContent className="flex flex-col lg:flex-row items-start gap-4">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                                {/* Group ID Code */}
                                <div className="flex flex-col">
                                  <Input
                                    label="Group ID Code"
                                    name={`code_${tu.id}`}
                                    value={form.code}
                                    onChange={(e) => handleFieldChange(tu.id, 'code', e.target.value)}
                                    placeholder="e.g., RES, COM"
                                    required
                                    fullWidth
                                    disabled={form.isSaved || form.isSaving}
                                  />
                                  <ValidationMessage
                                    message={form.errors.code}
                                    visible={!!form.errors.code}
                                  />
                                </div>

                                {/* Group Name */}
                                <div className="flex flex-col">
                                  <Input
                                    label="Group Name"
                                    name={`name_${tu.id}`}
                                    value={form.name}
                                    onChange={(e) => handleFieldChange(tu.id, 'name', e.target.value)}
                                    placeholder="e.g., Residential"
                                    required
                                    fullWidth
                                    disabled={form.isSaved || form.isSaving}
                                  />
                                  <ValidationMessage
                                    message={form.errors.name}
                                    visible={!!form.errors.name}
                                  />
                                </div>

                                {/* Icon Type */}
                                <div className="flex flex-col">
                                  <GroupIconSelector
                                    value={form.icon}
                                    onChange={(iconVal) => handleFieldChange(tu.id, 'icon', iconVal)}
                                    label="Icon Type"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Save Button */}
                              <div className="lg:mt-[24px] self-stretch lg:self-start flex items-end">
                                <SaveButton
                                  label="Save"
                                  size="md"
                                  onClick={() => handleSaveGroup(tu.id, tu)}
                                  disabled={!isFormValid(form) || form.isSaved || form.isSaving}
                                  isLoading={form.isSaving}
                                  className="w-full lg:w-28"
                                />
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
