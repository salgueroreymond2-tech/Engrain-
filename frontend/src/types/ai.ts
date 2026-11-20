export interface AssistantMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AssistantResponse {
  conversationId: string;
  message: AssistantMessage;
  disclaimers: string[];
}
