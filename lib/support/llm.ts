import "server-only";
import { getSupportSettings, saveSupportSettings } from "./store";
import { SUPPORT_TOOLS, executeTool, type ToolDefinition } from "./tools";

export type LLMChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
};

export type LLMResponse =
  | {
      success: true;
      reply: string;
      toolCalls?: string[];
      escalated?: boolean;
      escalationReason?: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Універсальний адаптер для звернення до LLM (Google Gemini / OpenAI / DeepSeek / OpenRouter / Groq).
 */
export async function askLLM(
  messages: LLMChatMessage[],
  context: {
    sessionId: string;
    onEscalate?: (reason: string) => Promise<void>;
  },
): Promise<LLMResponse> {
  const settings = await getSupportSettings();

  if (!settings.apiKey) {
    return {
      success: false,
      error: "NO_API_KEY",
    };
  }

  // Якщо обрано Google Gemini або ключ схожий на Google API Key (AIza...)
  const isGoogle =
    settings.provider === "google" ||
    settings.apiKey.startsWith("AIza") ||
    settings.baseUrl.includes("generativelanguage.googleapis.com");

  if (isGoogle) {
    return await askGoogleGemini(messages, settings, context);
  }

  return await askOpenAICompatible(messages, settings, context);
}

function toGeminiSchema(schema: any): any {
  if (!schema || typeof schema !== "object") return schema;
  const res: Record<string, any> = Array.isArray(schema) ? [] : {};
  for (const [k, v] of Object.entries(schema)) {
    if (k === "type" && typeof v === "string") {
      res[k] = v.toUpperCase();
    } else if (typeof v === "object") {
      res[k] = toGeminiSchema(v);
    } else {
      res[k] = v;
    }
  }
  return res;
}

/**
 * Опитування Google Gemini API для отримання списку реально доступних моделей за ключем.
 */
export async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.models)) return [];

    return data.models
      .filter((m: any) =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes("generateContent"),
      )
      .map((m: any) => m.name.replace(/^models\//, ""))
      .sort((a: string, b: string) => {
        const rank = (id: string) => {
          if (id === "gemini-2.0-flash") return 1;
          if (id.includes("2.0-flash")) return 2;
          if (id === "gemini-1.5-flash") return 3;
          if (id.includes("1.5-flash")) return 4;
          if (id.includes("flash")) return 5;
          return 20;
        };
        return rank(a) - rank(b);
      });
  } catch (e) {
    console.error("[gemini] Failed to list models:", e);
    return [];
  }
}

/**
 * 1. Нативний Google Gemini REST адаптер (з підтримкою functionDeclarations)
 */
async function askGoogleGemini(
  messages: LLMChatMessage[],
  settings: Awaited<ReturnType<typeof getSupportSettings>>,
  context: {
    sessionId: string;
    onEscalate?: (reason: string) => Promise<void>;
  },
): Promise<LLMResponse> {
  const rawModel = settings.model || "gemini-2.0-flash";
  let cleanModel = rawModel.replace(/^models\//, "");

  // Захист від застарілих / неіснуючих конфігів у базі
  if (cleanModel === "gemini-2.5-flash" || cleanModel === "gemini-1.0-pro") {
    cleanModel = "gemini-2.0-flash";
  }

  const apiKey = settings.apiKey;
  const executedToolNames: string[] = [];
  let escalated = false;
  let escalationReason = "";

  const wrappedOnEscalate = async (reason: string) => {
    escalated = true;
    escalationReason = reason;
    if (context.onEscalate) await context.onEscalate(reason);
  };

  // Витягуємо системний промпт
  const systemMsg = messages.find((m) => m.role === "system");
  const systemText = systemMsg?.content || settings.systemPrompt;

  // Формуємо contents для Gemini з чергуванням реплік
  const contents: Array<{
    role: "user" | "model" | "function";
    parts: Array<Record<string, any>>;
  }> = [];

  for (const m of messages) {
    if (m.role === "user" && m.content?.trim()) {
      const last = contents[contents.length - 1];
      if (last && last.role === "user") {
        last.parts.push({ text: m.content.trim() });
      } else {
        contents.push({ role: "user", parts: [{ text: m.content.trim() }] });
      }
    } else if (m.role === "assistant" && m.content?.trim()) {
      const last = contents[contents.length - 1];
      if (last && last.role === "model") {
        last.parts.push({ text: m.content.trim() });
      } else {
        contents.push({ role: "model", parts: [{ text: m.content.trim() }] });
      }
    }
  }

  // Захист: contents ніколи не може бути порожнім для Gemini!
  if (contents.length === 0) {
    const lastUserMsg = messages.slice().reverse().find((m) => m.role === "user");
    contents.push({
      role: "user",
      parts: [
        {
          text:
            lastUserMsg?.content?.trim() ||
            "Привіт! Допоможи з платформою DevqSpace.",
        },
      ],
    });
  }

  // Схема інструментів для Gemini functionDeclarations
  const geminiTools = [
    {
      functionDeclarations: SUPPORT_TOOLS.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        parameters: toGeminiSchema(t.function.parameters),
      })),
    },
  ];

  // Tool-calling loop (макс 3 ітерації)
  for (let iteration = 0; iteration < 3; iteration++) {
    const payload = {
      systemInstruction: systemText
        ? { parts: [{ text: systemText }] }
        : undefined,
      contents,
      tools: geminiTools,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 650,
      },
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });
    } catch (e: any) {
      return {
        success: false,
        error: `Помилка зв'язку з Google Gemini (${e.name === "TimeoutError" ? "Таймаут" : e.message})`,
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[gemini-native] HTTP ${res.status}: ${errText}`);

      // Якщо модель не знайдена (404) або застаріла — автоматично опитуємо API на актуальні моделі!
      if (
        res.status === 404 ||
        errText.includes("no longer available") ||
        errText.includes("not found")
      ) {
        console.warn(`[gemini] Model ${cleanModel} not available (HTTP 404). Querying available models for key...`);
        try {
          const available = await getAvailableGeminiModels(apiKey);
          const fallbackModel = available[0] || "gemini-2.0-flash";
          if (fallbackModel && fallbackModel !== cleanModel) {
            console.log(`[gemini] Auto-switching from ${cleanModel} to available model: ${fallbackModel}`);
            cleanModel = fallbackModel;
            // Оновлюємо налаштування в базі для наступних запитів
            await saveSupportSettings({ model: fallbackModel }).catch(() => {});
            // Повторюємо запит з новою моделлю
            continue;
          }
        } catch (discoErr) {
          console.error("[gemini] Model discovery failed:", discoErr);
        }
      }

      // Автоматичний надійний фолбек на офіційний OpenAI-compatible endpoint Gemini
      try {
        return await askOpenAICompatible(
          messages,
          {
            ...settings,
            baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
            model: cleanModel,
          },
          context,
        );
      } catch {
        return {
          success: false,
          error: `Google Gemini API помилка HTTP ${res.status}: ${errText.slice(0, 150)}`,
        };
      }
    }

    const data = await res.json().catch(() => null);
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts;

    if (!parts || !parts.length) {
      return {
        success: false,
        error: "Google Gemini повернув порожню відповідь",
      };
    }

    // Перевіряємо чи є виклик інструменту (functionCall)
    const functionCallPart = parts.find((p: any) => Boolean(p.functionCall));

    if (!functionCallPart) {
      // Звичайний текст
      const textPart = parts.find((p: any) => typeof p.text === "string");
      const reply = textPart?.text?.trim() || "Чим можу ще допомогти?";
      return {
        success: true,
        reply,
        toolCalls: executedToolNames,
        escalated,
        escalationReason,
      };
    }

    // Обробка виклику функції
    const fn = functionCallPart.functionCall;
    const fnName = fn.name;
    const fnArgs = fn.args || {};
    executedToolNames.push(fnName);

    // Додаємо виклик моделі в історію
    contents.push({
      role: "model",
      parts: [{ functionCall: fn }],
    });

    // Виконуємо інструмент локально
    const toolOutput = await executeTool(fnName, fnArgs, {
      sessionId: context.sessionId,
      onEscalate: wrappedOnEscalate,
    });

    let parsedOutput: Record<string, any>;
    try {
      parsedOutput = JSON.parse(toolOutput);
    } catch {
      parsedOutput = { result: toolOutput };
    }

    // Передаємо результат виконання інструменту назад у Gemini
    contents.push({
      role: "function",
      parts: [
        {
          functionResponse: {
            name: fnName,
            response: parsedOutput,
          },
        },
      ],
    });
  }

  return {
    success: true,
    reply: "Ось актуальна інформація за вашим запитом.",
    toolCalls: executedToolNames,
    escalated,
    escalationReason,
  };
}

/**
 * 2. OpenAI-сумісний адаптер (OpenAI / DeepSeek / OpenRouter / Groq / Ollama)
 */
async function askOpenAICompatible(
  messages: LLMChatMessage[],
  settings: Awaited<ReturnType<typeof getSupportSettings>>,
  context: {
    sessionId: string;
    onEscalate?: (reason: string) => Promise<void>;
  },
): Promise<LLMResponse> {
  const endpoint = `${settings.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const executedToolNames: string[] = [];
  let escalated = false;
  let escalationReason = "";

  const wrappedOnEscalate = async (reason: string) => {
    escalated = true;
    escalationReason = reason;
    if (context.onEscalate) await context.onEscalate(reason);
  };

  const currentMessages = [...messages];

  for (let iteration = 0; iteration < 3; iteration++) {
    const payload = {
      model: settings.model || "gpt-4o-mini",
      messages: currentMessages,
      tools: SUPPORT_TOOLS,
      tool_choice: "auto",
      temperature: 0.5,
      max_tokens: 650,
    };

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });
    } catch (e: any) {
      return {
        success: false,
        error: `Помилка зв'язку з LLM сервером (${e.name === "TimeoutError" ? "Таймаут" : e.message})`,
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        success: false,
        error: `LLM API помилка HTTP ${res.status}: ${errText.slice(0, 150)}`,
      };
    }

    const data = await res.json().catch(() => null);
    if (!data?.choices?.[0]?.message) {
      return {
        success: false,
        error: "Некоректна відповідь від LLM моделі",
      };
    }

    const choiceMsg = data.choices[0].message;

    if (!choiceMsg.tool_calls || choiceMsg.tool_calls.length === 0) {
      return {
        success: true,
        reply: choiceMsg.content || "Чим можу ще допомогти?",
        toolCalls: executedToolNames,
        escalated,
        escalationReason,
      };
    }

    currentMessages.push({
      role: "assistant",
      content: choiceMsg.content ?? null,
      tool_calls: choiceMsg.tool_calls,
    });

    for (const toolCall of choiceMsg.tool_calls) {
      const fnName = toolCall.function.name;
      executedToolNames.push(fnName);
      let parsedArgs: Record<string, any> = {};
      try {
        parsedArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        parsedArgs = {};
      }

      const toolOutput = await executeTool(fnName, parsedArgs, {
        sessionId: context.sessionId,
        onEscalate: wrappedOnEscalate,
      });

      currentMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolOutput,
      });
    }
  }

  return {
    success: true,
    reply: "Ось актуальна інформація за вашим запитом.",
    toolCalls: executedToolNames,
    escalated,
    escalationReason,
  };
}
