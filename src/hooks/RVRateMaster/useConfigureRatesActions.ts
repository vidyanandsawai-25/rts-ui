import { useCallback } from "react";
import { toast } from "sonner";
import { createUseGroupAndAssignToTypeAction } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { getIconKey } from "@/components/modules/property-tax/typeofusemaster/GroupIconSelector";
import { CODE_REGEX, TEXT_ALLOWED } from "@/lib/utils/validation-rules";
import { normalize } from "@/lib/utils/sanitization";
import type { ITypeOfUseDetails } from "@/types/RVRateMaster";
import type { UseGroup, UseGroupIconKey } from "@/types/typeOfUse.types";

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

const isAllZeros = (str: string) => /^[0]+$/.test(str);

interface UseConfigureRatesActionsProps {
  groupForms: Record<number, GroupFormState>;
  setGroupForms: React.Dispatch<React.SetStateAction<Record<number, GroupFormState>>>;
  existingGroups: UseGroup[];
  setExistingGroups: React.Dispatch<React.SetStateAction<UseGroup[]>>;
  allUseTypes: ITypeOfUseDetails[];
  setAllUseTypes: React.Dispatch<React.SetStateAction<ITypeOfUseDetails[]>>;
  setPaginatedUseTypes: React.Dispatch<React.SetStateAction<ITypeOfUseDetails[]>>;
  checkedIds: Record<number, boolean>;
  setCheckedIds: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  onConfigureSelected?: (selectedTypes: ITypeOfUseDetails[]) => void;
  setSavedAny: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useConfigureRatesActions({
  groupForms,
  setGroupForms,
  existingGroups,
  setExistingGroups,
  allUseTypes,
  setAllUseTypes,
  setPaginatedUseTypes,
  checkedIds,
  setCheckedIds,
  onConfigureSelected,
  setSavedAny,
}: UseConfigureRatesActionsProps) {

  const handleCheckboxChange = useCallback((id: number) => {
    const tu = allUseTypes.find(t => t.id === id);
    if (!tu || tu.typeOfUseCode === 'OP') return;

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
  }, [allUseTypes, existingGroups, groupForms, setCheckedIds, setGroupForms]);

  const handleSelectExistingGroup = useCallback((id: number, groupIdStr: string) => {
    setGroupForms(prev => {
      const form = prev[id];
      if (!form) return prev;

      if (!groupIdStr) {
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
          errors: {},
          isSaved: false
        }
      };
    });
  }, [existingGroups, setGroupForms]);

  const handleToggleMode = useCallback((id: number) => {
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
  }, [setGroupForms]);

  const handleSaveGroup = useCallback(async (id: number, typeofuse: ITypeOfUseDetails) => {
    const form = groupForms[id];
    if (!form || form.isSaved || form.isSaving) return;

    if (form.isMappingExisting) {
      if (!form.selectedExistingGroupId) return;
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

          const updater = (t: ITypeOfUseDetails) => {
            if (t.id === typeofuse.id) {
              return {
                ...t,
                typeOfUseGroupId: res.typeOfUseGroupId,
                typeOfUseGroupCode: groupCode,
                groupName: groupName
              };
            }
            return t;
          };

          setAllUseTypes(prev => prev.map(updater));
          setPaginatedUseTypes(prev => prev.map(updater));
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

        const newlyCreatedGroup: UseGroup = {
          typeOfUseGroupId: res.typeOfUseGroupId,
          typeOfUseGroupCode: codeTrimmed,
          groupName: nameTrimmed,
          groupIcon: getIconKey(form.icon),
          isOpenPlot: true,
          isActive: true
        };
        setExistingGroups(prev => [...prev, newlyCreatedGroup]);

        const updater = (t: ITypeOfUseDetails) => {
          if (t.id === typeofuse.id) {
            return {
              ...t,
              typeOfUseGroupId: res.typeOfUseGroupId,
              typeOfUseGroupCode: codeTrimmed,
              groupName: nameTrimmed
            };
          }
          return t;
        };

        setAllUseTypes(prev => prev.map(updater));
        setPaginatedUseTypes(prev => prev.map(updater));
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
  }, [existingGroups, groupForms, setAllUseTypes, setExistingGroups, setGroupForms, setPaginatedUseTypes, setSavedAny]);

  const handleConfigureClick = useCallback(() => {
    const selected = allUseTypes.filter(tu => checkedIds[tu.id]);

    const hasInvalidSelection = selected.some(tu => {
      if (!tu.typeOfUseGroupId) return true;
      const group = existingGroups.find(g => g.typeOfUseGroupId === tu.typeOfUseGroupId);
      return !group || !group.isOpenPlot;
    });

    if (hasInvalidSelection) {
      toast.error("Please select Type of Use having Use Groups for Open Plot.");
      return;
    }

    const selectedGroupIds = selected
      .map(tu => tu.typeOfUseGroupId)
      .filter((id): id is number => !!id && id > 0);

    const hasDuplicateGroupIds = selectedGroupIds.length !== new Set(selectedGroupIds).size;

    if (hasDuplicateGroupIds) {
      toast.error("Please select Type of Use having distinct Use group");
      return;
    }

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
        distinctSelected.push(tu);
      }
    });

    if (distinctSelected.length === 0) {
      toast.error("Please select at least one Type of Use to configure.");
      return;
    }

    onConfigureSelected?.(distinctSelected);
  }, [allUseTypes, checkedIds, existingGroups, onConfigureSelected]);

  return {
    handleCheckboxChange,
    handleSelectExistingGroup,
    handleToggleMode,
    handleSaveGroup,
    handleConfigureClick,
  };
}
