'use client';

import { useMemo } from 'react';
import { FooterAction } from '@/lib/api/footer.service';

export function useFooterActions(actions: FooterAction[] = []) {
  return useMemo(() => {
    const processedActions = (Array.isArray(actions) ? actions : [])
      .map((a) => {
        let isAuthorized = true;

        if (a.haveNoAccess) {
          isAuthorized = false;
        } else if (a.canView === false) {
          isAuthorized = false;
        } else if (a.haveFullAccess) {
          isAuthorized = true;
        } else {
          const cmd = a.actionCommand.toUpperCase();

          // Actions requiring Delete permission
          const requiresDelete = cmd.includes('DELETE');
          if (requiresDelete && !a.canDelete) {
            isAuthorized = false;
          }

          // Actions requiring Edit/Write permission
          const requiresEdit =
            cmd.includes('SAVE') ||
            cmd.includes('UPDATE') ||
            cmd.includes('SUBMIT') ||
            cmd.includes('EDIT') ||
            cmd.includes('ADD') ||
            cmd.includes('QC') ||
            cmd.includes('COMBINE') ||
            cmd.includes('SPLIT') ||
            cmd.includes('PARTITION') ||
            cmd.includes('TRANSFER') ||
            cmd.includes('AMALGAMATION') ||
            cmd.includes('OBJECTION') ||
            cmd.includes('CALC') ||
            cmd.includes('DISCOUNT') ||
            cmd.includes('APPLY');

          if (requiresEdit && !a.canEdit) {
            isAuthorized = false;
          }
        }

        return {
          ...a,
          isEnabled: a.isEnabled && isAuthorized,
        };
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Separate by alignment
    const leftActions = processedActions.filter((a) => a?.style?.alignment === 'left');
    const middleActions = processedActions.filter((a) => a?.style?.alignment === 'middle');
    const rightActions = processedActions.filter((a) => a?.style?.alignment === 'right');

    // Centering Logic for Middle Section (Utility Group)
    const utilityGroup = [...leftActions, ...middleActions];
    // Find the most prominent action (blue or primary) to center it
    const prominentIndex = utilityGroup.findIndex(
      (a) => a.style?.variant === 'blue' || a.style?.variant === 'primary'
    );

    let finalUtility = utilityGroup;
    if (prominentIndex !== -1 && utilityGroup.length > 1) {
      const prominentAction = utilityGroup[prominentIndex];
      const others = utilityGroup.filter((_, i) => i !== prominentIndex);
      const midpoint = Math.floor(others.length / 2);
      finalUtility = [
        ...others.slice(0, midpoint),
        prominentAction,
        ...others.slice(midpoint),
      ];
    }

    // Ensure PTIS_EDIT_ENTRY is positioned just right of PTIS_REFRESH
    const refreshIdx = finalUtility.findIndex((a) => a.actionCommand === 'PTIS_REFRESH');
    const editIdx = finalUtility.findIndex((a) => a.actionCommand === 'PTIS_EDIT_ENTRY');
    if (refreshIdx !== -1 && editIdx !== -1) {
      const editAction = finalUtility[editIdx];
      const withoutEdit = finalUtility.filter((_, i) => i !== editIdx);
      const newRefreshIdx = withoutEdit.findIndex((a) => a.actionCommand === 'PTIS_REFRESH');
      finalUtility = [
        ...withoutEdit.slice(0, newRefreshIdx + 1),
        editAction,
        ...withoutEdit.slice(newRefreshIdx + 1),
      ];
    }

    return {
      utility: finalUtility,
      right: rightActions,
    };
  }, [actions]);
}
