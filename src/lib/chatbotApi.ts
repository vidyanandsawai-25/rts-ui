import { sendChatMessageLocal } from "@/lib/mock/ui-only";

export type SupportedLanguage = "en" | "hi" | "mr";
export type QuickReply = { title: string; payload: string };
export type ChatRequest = { text: string; language: SupportedLanguage; sessionId?: string };
export type ChatResponse = { replyText: string; navigateDeptId?: string | null; quickReplies?: QuickReply[] | null };

export async function sendChatMessage(body: ChatRequest): Promise<ChatResponse> {
  return sendChatMessageLocal(body);
}
