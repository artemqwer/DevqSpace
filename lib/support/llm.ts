import "server-only";
import { getSupportSettings } from "./store";
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
  const model = settings.model || "gemini-2.5-flash";
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

  // Формуємо початковий contents для Gemini
  const contents: Array<{
    role: "user" | "model" | "function";
    parts: Array<Record<string, any>>;
  }> = [];

  for (const m of messages) {
    if (m.role === "user") {
      contents.push({ role: "user", parts: [{ text: m.content || "" }] });
    } else if (m.role === "assistant") {
      contents.push({ role: "model", parts: [{ text: m.content || "" }] });
    }
  }

  // Схема інструментів для Gemini functionDeclarations
  const geminiTools = [
    {
      functionDeclarations: SUPPORT_TOOLS.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters,
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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
      return {
        success: false,
        error: `Google Gemini API помилка HTTP ${res.status}: ${errText.slice(0, 150)}`,
      };
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
