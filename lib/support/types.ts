export type SupportTicketStatus =
  | "ai" // диалог ведет AI
  | "waiting_operator" // эскалирован, ожидает ответа оператора (AI заморожен)
  | "operator_active" // оператор подключился и ведет диалог
  | "closed"; // диалог завершен

export type SupportSender = "user" | "ai" | "operator" | "system";

export type SupportMessage = {
  id: string;
  sender: SupportSender;
  text: string;
  timestamp: number;
  metadata?: {
    orderId?: string;
    escalationReason?: string;
    toolCalls?: string[];
  };
};

export type SupportTicket = {
  id: string; // tick_...
  sessionId: string; // кука / localStorage клиента
  status: SupportTicketStatus;
  createdAt: number;
  updatedAt: number;
  clientInfo: {
    ip?: string;
    userAgent?: string;
    verifiedOrderId?: string;
    contact?: string;
    name?: string;
  };
  escalationReason?: string;
  messages: SupportMessage[];
  unreadForOperator: boolean;
  unreadForUser: boolean;
};

export type LLMProvider =
  | "google"
  | "openai"
  | "deepseek"
  | "openrouter"
  | "groq"
  | "custom";

export type SupportSettings = {
  aiEnabled: boolean;
  provider: LLMProvider;
  apiKey: string; // secret, хранится в Redis / devStorage
  baseUrl: string; // напр. https://generativelanguage.googleapis.com/v1beta или https://api.openai.com/v1
  model: string; // напр. gemini-2.0-flash, gemini-1.5-flash, gpt-4o-mini
  systemPrompt: string;
  companyName: string;
  welcomeMessage: string;
  maxFailedVerifications: number; // по умолчанию 3
  lockoutMinutes: number; // по умолчанию 15
};

export type VerificationState = {
  failedAttempts: number;
  lockedUntil?: number;
  verifiedOrderIds: string[];
};
