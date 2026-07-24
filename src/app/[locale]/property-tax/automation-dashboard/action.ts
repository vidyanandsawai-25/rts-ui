import {
    automationgetMainCards,
    automationGetWorkflowCards
} from "@/lib/api/automation-dashboard/automation-maincard.service";
import {
    MainCardsData,
    WorkflowCardData
} from "@/types/automation-dashboard/automation-maincard/automation-maincart.type";

/**
 * Server action to fetch the main cards data for the automation dashboard.
 * 
 * @param workflowStageId Optional ID to filter the main cards data by workflow stage.
 * @returns An object containing success status, data, and optional error message.
 */
export async function getAutomationMainCardsAction(): Promise<{ success: boolean; data?: MainCardsData | null; error?: string }> {
    try {
        const data = await automationgetMainCards();
        return { success: true, data };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to fetch automation main cards";
        return { success: false, error: errorMsg };
    }
}

/**
 * Server action to fetch the workflow cards data for the automation dashboard.
 * 
 * @param workflowStageId Optional ID to filter the workflow cards data by workflow stage.
 * @returns An object containing success status, data (array of workflow cards), and optional error message.
 */
export async function getAutomationWorkflowCardsAction(): Promise<{ success: boolean; data?: WorkflowCardData[] | null; error?: string }> {
    try {
        const data = await automationGetWorkflowCards();
        return { success: true, data };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to fetch automation workflow cards";
        return { success: false, error: errorMsg };
    }
}