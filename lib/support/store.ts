import "server-only";
import { Redis } from "@upstash/redis";
import type {
  SupportTicket,
  SupportMessage,
  SupportSettings,
  SupportTicketStatus,
  VerificationState,
} from "./types";

const REDIS_KEYS = {
  settings: "devq:support:settings",
  ticket: (id: string) => `devq:support:ticket:${id}`,
  sessionTicket: (sessionId: string) => `devq:support:session:${sessionId}`,
  ticketIndex: "devq:support:ticket_index", // sorted set by updatedAt
  verification: (sessionId: string, orderId: string) =>
    `devq:support:verify:${sessionId}:${orderId}`,
};

export const DEFAULT_SUPPORT_SETTINGS: SupportSettings = {
  aiEnabled: false,
  provider: (process.env.SUPPORT_AI_PROVIDER as any) || "google",
  apiKey: process.env.SUPPORT_AI_API_KEY ?? "",
  baseUrl:
    process.env.SUPPORT_AI_BASE_URL ??
    "https://generativelanguage.googleapis.com/v1beta",
  model: process.env.SUPPORT_AI_MODEL ?? "gemini-2.0-flash",
  companyName: "DevqSpace",
  welcomeMessage:
    "Привіт! Я AI-асистент DevqSpace. Допоможу з вибором готового рішення, статусом замовлення або відповім на технічні запитання. Чим можу допомогти?",
  systemPrompt: `Ти — офіційний AI-консультант платформи DevqSpace (devq.space).
DevqSpace — маркетплейс готових IT-рішень, Telegram-ботів, Web-сервісів, Web3-продуктів та студія кастомної розробки.

Твої обов'язки та правила:
1. Відповідай ввічливо, експертно, чітко та доброзичливо. За замовчуванням відповідай мовою, якою звернувся клієнт (українською / англійською / іншою).
2. Використовуй надані інструменти (tools):
   - Якщо клієнт шукає товар, запитує що у вас є або чи є конкретний бот/шаблон — викликай інструмент пошуку товарів по каталогу (searchCatalog).
   - Якщо запитує деталі чи наявність конкретного товару — викликай checkProductStock.
   - Якщо клієнт запитує статус або деталі свого замовлення — викликай verifyAndGetOrder.
3. БЕЗПЕКА ТА ЗАХИСТ ДАНИХ (КРИТИЧНО):
   - Ніколи не розголошуй статус, вміст чи деталі замовлення БЕЗ підтвердження клієнтом (номер замовлення + контактний телефон чи email, вказаний при покупці).
   - Якщо клієнт запитує замовлення, але не надав підтверджуючий контакт — ввічливо попроси вказати номер замовлення разом з email чи телефоном для верифікації.
   - Ніколи не розголошуй персональні дані інших клієнтів (PII) та системні ключі/токені.
4. Ескалація на оператора:
   - Якщо клієнт явно просить людину/оператора/менеджера, або виникає конфліктна ситуація, претензія, або ти не знаєш відповіді — викликай інструмент escalateToHuman або повідом клієнту, що з'єднуєш з оператором.`,
  maxFailedVerifications: 3,
  lockoutMinutes: 15,
};

// ---- Redis lazy client ----
let redisClient: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

import { devReadState, devWriteState } from "@/lib/devStorage";

const SUPPORT_DB_FILE = "support.json";

// In-memory fallback
type MemSupportDB = {
  settings: SupportSettings;
  tickets: Map<string, SupportTicket>;
  sessionTickets: Map<string, string>; // sessionId -> ticketId
  verifications: Map<string, VerificationState>; // `${sessionId}:${orderId}` -> state
};

const g = globalThis as unknown as {
  __devqSupportMem?: MemSupportDB;
};

function hydrate(): MemSupportDB {
  const raw = devReadState(SUPPORT_DB_FILE) as any;
  if (!raw) {
    return {
      settings: { ...DEFAULT_SUPPORT_SETTINGS },
      tickets: new Map(),
      sessionTickets: new Map(),
      verifications: new Map(),
    };
  }
  try {
    return {
      settings: { ...DEFAULT_SUPPORT_SETTINGS, ...(raw.settings || {}) },
      tickets: new Map(raw.tickets || []),
      sessionTickets: new Map(raw.sessionTickets || []),
      verifications: new Map(raw.verifications || []),
    };
  } catch {
    return {
      settings: { ...DEFAULT_SUPPORT_SETTINGS },
      tickets: new Map(),
      sessionTickets: new Map(),
      verifications: new Map(),
    };
  }
}

function persist(m: MemSupportDB): void {
  try {
    devWriteState(SUPPORT_DB_FILE, {
      settings: m.settings,
      tickets: Array.from(m.tickets.entries()),
      sessionTickets: Array.from(m.sessionTickets.entries()),
      verifications: Array.from(m.verifications.entries()),
    });
  } catch (e) {
    console.error("[support/store] Failed to persist support state:", e);
  }
}

function mem(): MemSupportDB {
  if (!g.__devqSupportMem) {
    g.__devqSupportMem = hydrate();
  }
  return g.__devqSupportMem;
}

// ---- Settings ----

export async function getSupportSettings(): Promise<SupportSettings> {
  const redis = getRedis();
  if (!redis) {
    return { ...mem().settings };
  }
  const raw = await redis.get<Partial<SupportSettings>>(REDIS_KEYS.settings);
  return {
    ...DEFAULT_SUPPORT_SETTINGS,
    ...(raw ?? {}),
    // Fallback on env if apiKey is empty in db
    apiKey: raw?.apiKey || process.env.SUPPORT_AI_API_KEY || "",
  };
}

export async function saveSupportSettings(
  patch: Partial<SupportSettings>,
): Promise<SupportSettings> {
  const current = await getSupportSettings();
  const next = { ...current, ...patch };
  const redis = getRedis();
  if (!redis) {
    mem().settings = next;
    persist(mem());
    return next;
  }
  await redis.set(REDIS_KEYS.settings, next);
  return next;
}

// ---- Tickets & Messages ----

export async function getTicket(id: string): Promise<SupportTicket | null> {
  const redis = getRedis();
  if (!redis) {
    return mem().tickets.get(id) ?? null;
  }
  return await redis.get<SupportTicket>(REDIS_KEYS.ticket(id));
}

export async function getTicketBySession(
  sessionId: string,
): Promise<SupportTicket | null> {
  const redis = getRedis();
  if (!redis) {
    const id = mem().sessionTickets.get(sessionId);
    return id ? (mem().tickets.get(id) ?? null) : null;
  }
  const id = await redis.get<string>(REDIS_KEYS.sessionTicket(sessionId));
  if (!id) return null;
  return await getTicket(id);
}

export async function createTicket(
  sessionId: string,
  clientInfo?: SupportTicket["clientInfo"],
): Promise<SupportTicket> {
  const now = Date.now();
  const id = `tick_${Math.random().toString(36).slice(2, 9)}_${now.toString(36)}`;
  const ticket: SupportTicket = {
    id,
    sessionId,
    status: "ai",
    createdAt: now,
    updatedAt: now,
    clientInfo: clientInfo ?? {},
    messages: [],
    unreadForOperator: false,
    unreadForUser: false,
  };

  const redis = getRedis();
  if (!redis) {
    mem().tickets.set(id, ticket);
    mem().sessionTickets.set(sessionId, id);
    persist(mem());
    return ticket;
  }

  await redis.set(REDIS_KEYS.ticket(id), ticket);
  await redis.set(REDIS_KEYS.sessionTicket(sessionId), id);
  await redis.zadd(REDIS_KEYS.ticketIndex, { score: now, member: id });
  return ticket;
}

export async function getOrCreateTicket(
  sessionId: string,
  clientInfo?: SupportTicket["clientInfo"],
): Promise<SupportTicket> {
  const existing = await getTicketBySession(sessionId);
  if (existing && existing.status !== "closed") {
    if (clientInfo && Object.keys(clientInfo).length > 0) {
      existing.clientInfo = { ...existing.clientInfo, ...clientInfo };
      await saveTicket(existing);
    }
    return existing;
  }
  return await createTicket(sessionId, clientInfo);
}

export async function saveTicket(ticket: SupportTicket): Promise<SupportTicket> {
  ticket.updatedAt = Date.now();
  const redis = getRedis();
  if (!redis) {
    mem().tickets.set(ticket.id, ticket);
    mem().sessionTickets.set(ticket.sessionId, ticket.id);
    persist(mem());
    return ticket;
  }
  await redis.set(REDIS_KEYS.ticket(ticket.id), ticket);
  await redis.set(REDIS_KEYS.sessionTicket(ticket.sessionId), ticket.id);
  await redis.zadd(REDIS_KEYS.ticketIndex, {
    score: ticket.updatedAt,
    member: ticket.id,
  });
  return ticket;
}

export async function getAllTickets(limit = 50): Promise<SupportTicket[]> {
  const redis = getRedis();
  if (!redis) {
    return [...mem().tickets.values()]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }
  const ids = await redis.zrange<string[]>(REDIS_KEYS.ticketIndex, 0, limit - 1, {
    rev: true,
  });
  if (!ids.length) return [];
  const rows = await redis.mget<SupportTicket[]>(
    ...ids.map((id) => REDIS_KEYS.ticket(id)),
  );
  return rows.filter((r): r is SupportTicket => Boolean(r));
}

export async function addMessage(
  ticketId: string,
  sender: SupportMessage["sender"],
  text: string,
  metadata?: SupportMessage["metadata"],
): Promise<SupportMessage | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  const msg: SupportMessage = {
    id: `msg_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
    sender,
    text,
    timestamp: Date.now(),
    metadata,
  };

  ticket.messages.push(msg);
  // Keep last 40 messages per ticket
  if (ticket.messages.length > 40) {
    ticket.messages = ticket.messages.slice(-40);
  }

  if (sender === "user") {
    ticket.unreadForOperator = true;
  } else if (sender === "operator" || sender === "ai") {
    ticket.unreadForUser = true;
  }

  await saveTicket(ticket);
  return msg;
}

export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
  escalationReason?: string,
): Promise<SupportTicket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  ticket.status = status;
  if (escalationReason) ticket.escalationReason = escalationReason;
  if (status === "waiting_operator" || status === "operator_active") {
    ticket.unreadForOperator = true;
  } else if (status === "ai") {
    // When returning control back to AI, mark unread cleared
    ticket.unreadForOperator = false;
  }

  return await saveTicket(ticket);
}

// ---- Verification & Brute-Force Rate Limiter ----

export async function getVerificationState(
  sessionId: string,
  orderId: string,
): Promise<VerificationState> {
  const key = `${sessionId}:${orderId.trim().toLowerCase()}`;
  const redis = getRedis();
  if (!redis) {
    return (
      mem().verifications.get(key) ?? {
        failedAttempts: 0,
        verifiedOrderIds: [],
      }
    );
  }
  const raw = await redis.get<VerificationState>(
    REDIS_KEYS.verification(sessionId, orderId.trim().toLowerCase()),
  );
  return (
    raw ?? {
      failedAttempts: 0,
      verifiedOrderIds: [],
    }
  );
}

export async function saveVerificationState(
  sessionId: string,
  orderId: string,
  state: VerificationState,
): Promise<void> {
  const key = `${sessionId}:${orderId.trim().toLowerCase()}`;
  const redis = getRedis();
  if (!redis) {
    mem().verifications.set(key, state);
    persist(mem());
    return;
  }
  // Store with 24 hours TTL
  await redis.set(
    REDIS_KEYS.verification(sessionId, orderId.trim().toLowerCase()),
    state,
    { ex: 86400 },
  );
}
